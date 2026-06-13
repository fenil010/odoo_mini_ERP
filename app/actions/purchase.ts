"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";
import { logAudit } from "@/lib/audit";
import { generateOrderNumber } from "@/lib/erp-utils";
import { createLedgerEntry, allocateStockToWaitingOrders, startManufacturingOrderIfReady } from "@/lib/stock-ledger";

const purchaseOrderSchema = z.object({
  vendor_id: z.coerce.number().min(1, "Vendor is required."),
  items: z.array(
    z.object({
      product_id: z.coerce.number().min(1, "Product is required."),
      quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
      cost_price: z.coerce.number().min(0, "Cost price must be non-negative."),
    })
  ).min(1, "At least one item is required."),
});

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createPurchaseOrderAction(
  vendorId: number,
  items: { product_id: number; quantity: number; cost_price: number }[]
): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "PURCHASE" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  const result = purchaseOrderSchema.safeParse({ vendor_id: vendorId, items });
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid inputs." };
  }

  const poNumber = generateOrderNumber("PO");

  try {
    await sql.begin(async (tx) => {
      const poResult = await tx<{ id: number }[]>`
        INSERT INTO purchase_orders (po_number, vendor_id, status, created_by, created_at)
        VALUES (${poNumber}, ${vendorId}, 'DRAFT', ${session.userId}, NOW())
        RETURNING id
      `;
      const poId = poResult[0].id;

      for (const item of items) {
        await tx`
          INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, cost_price)
          VALUES (${poId}, ${item.product_id}, ${item.quantity}, ${item.cost_price})
        `;
      }

      await logAudit(tx, {
        userId: session.userId,
        entityType: "purchase_orders",
        entityId: poId,
        action: "CREATE",
        newValue: { poNumber, vendorId, items },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[createPurchaseOrderAction] error:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function confirmPurchaseOrderAction(poId: number): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "PURCHASE" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  try {
    const orderResult = await sql`SELECT status FROM purchase_orders WHERE id = ${poId} LIMIT 1`;
    const order = orderResult[0];
    if (!order) return { error: "Purchase order not found." };
    if (order.status !== "DRAFT") return { error: "Only draft orders can be confirmed." };

    await sql.begin(async (tx) => {
      await tx`
        UPDATE purchase_orders
        SET status = 'CONFIRMED'
        WHERE id = ${poId}
      `;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "purchase_orders",
        entityId: poId,
        action: "CONFIRM",
        oldValue: { status: "DRAFT" },
        newValue: { status: "CONFIRMED" },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[confirmPurchaseOrderAction] error:", error);
    return { error: "Failed to confirm purchase order." };
  }
}

export async function receivePurchaseOrderAction(poId: number): Promise<ActionState> {
  const session = await requireAuth();
  if (
    session.role !== "PURCHASE" &&
    session.role !== "INVENTORY" &&
    session.role !== "ADMIN" &&
    session.role !== "OWNER"
  ) {
    return { error: "Permission denied." };
  }

  try {
    const orderResult = await sql`SELECT status, po_number FROM purchase_orders WHERE id = ${poId} LIMIT 1`;
    const order = orderResult[0];
    if (!order) return { error: "Purchase order not found." };
    if (order.status !== "CONFIRMED") return { error: "Only confirmed orders can be received." };

    const items = await sql`
      SELECT product_id, quantity
      FROM purchase_order_items
      WHERE purchase_order_id = ${poId}
    `;

    await sql.begin(async (tx) => {
      for (const item of items) {
        await createLedgerEntry(tx, {
          productId: item.product_id,
          movementType: "PURCHASE_RECEIPT",
          quantity: item.quantity,
          referenceType: "purchase_orders",
          referenceId: poId,
          notes: `Received materials for PO ${order.po_number}`,
        });

        // Allocate received stock to waiting orders (Sales Orders or component allocations)
        await allocateStockToWaitingOrders(tx, item.product_id);
      }

      await tx`
        UPDATE purchase_orders
        SET status = 'RECEIVED'
        WHERE id = ${poId}
      `;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "purchase_orders",
        entityId: poId,
        action: "RECEIVE",
        oldValue: { status: "CONFIRMED" },
        newValue: { status: "RECEIVED" },
      });

      const waitingMOs = await tx`
        SELECT DISTINCT mo.id
        FROM manufacturing_orders mo
        WHERE mo.status = 'WAITING_MATERIALS'
      `;

      for (const mo of waitingMOs) {
        // Automatically check and start production if components are ready!
        await startManufacturingOrderIfReady(tx, mo.id, session.userId);
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[receivePurchaseOrderAction] error:", error);
    return { error: "Failed to receive purchase order." };
  }
}

export async function cancelPurchaseOrderAction(poId: number): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "PURCHASE" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  try {
    const orderResult = await sql`SELECT status FROM purchase_orders WHERE id = ${poId} LIMIT 1`;
    const order = orderResult[0];
    if (!order) return { error: "Purchase order not found." };
    if (order.status === "RECEIVED") return { error: "Received purchase orders cannot be cancelled." };
    if (order.status === "CANCELLED") return { error: "Purchase order is already cancelled." };

    const statusBefore = order.status;

    await sql.begin(async (tx) => {
      await tx`
        UPDATE purchase_orders
        SET status = 'CANCELLED'
        WHERE id = ${poId}
      `;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "purchase_orders",
        entityId: poId,
        action: "CANCEL",
        oldValue: { status: statusBefore },
        newValue: { status: "CANCELLED" },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[cancelPurchaseOrderAction] error:", error);
    return { error: "Failed to cancel purchase order." };
  }
}
