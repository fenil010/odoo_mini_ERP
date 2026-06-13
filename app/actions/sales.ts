"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";
import { logAudit } from "@/lib/audit";
import { generateOrderNumber } from "@/lib/erp-utils";
import { createLedgerEntry, recalculateSalesOrderStatus, checkAndStartWaitingMOs } from "@/lib/stock-ledger";
import { runProcurementEngine } from "@/lib/procurement-engine";

const salesOrderSchema = z.object({
  customer_id: z.coerce.number().min(1, "Customer is required."),
  items: z.array(
    z.object({
      product_id: z.coerce.number().min(1, "Product is required."),
      quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
      price: z.coerce.number().min(0, "Price must be non-negative."),
    })
  ).min(1, "At least one item is required."),
});

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createSalesOrderAction(
  customerId: number,
  items: { product_id: number; quantity: number; price: number }[]
): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "SALES" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  const result = salesOrderSchema.safeParse({ customer_id: customerId, items });
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid order input." };
  }

  const orderNumber = generateOrderNumber("SO");

  try {
    await sql.begin(async (tx) => {
      // 1. Create Sales Order
      const soResult = await tx<{ id: number }[]>`
        INSERT INTO sales_orders (order_number, customer_id, status, created_by, created_at)
        VALUES (${orderNumber}, ${customerId}, 'DRAFT', ${session.userId}, NOW())
        RETURNING id
      `;
      const soId = soResult[0].id;

      // 2. Insert items
      for (const item of items) {
        await tx`
          INSERT INTO sales_order_items (sales_order_id, product_id, quantity, price)
          VALUES (${soId}, ${item.product_id}, ${item.quantity}, ${item.price})
        `;
      }

      // 3. Log Audit
      await logAudit(tx, {
        userId: session.userId,
        entityType: "sales_orders",
        entityId: soId,
        action: "CREATE",
        newValue: { orderNumber, customerId, items },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[createSalesOrderAction] error:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function confirmSalesOrderAction(orderId: number): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "SALES" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  try {
    const orderResult = await sql`SELECT status, order_number FROM sales_orders WHERE id = ${orderId} LIMIT 1`;
    const order = orderResult[0];
    if (!order) return { error: "Sales order not found." };
    if (order.status !== "DRAFT") return { error: "Only draft orders can be confirmed." };

    const items = await sql`
      SELECT product_id, quantity, price
      FROM sales_order_items
      WHERE sales_order_id = ${orderId}
    `;

    await sql.begin(async (tx) => {
      let hasShortage = false;

      // Confirm the items, checking stock levels
      for (const item of items) {
        // Ensure inventory row exists
        await tx`
          INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
          VALUES (${item.product_id}, 0, 0)
          ON CONFLICT (product_id) DO NOTHING
        `;

        const invResult = await tx`
          SELECT on_hand_qty, reserved_qty 
          FROM inventory 
          WHERE product_id = ${item.product_id}
        `;
        const inv = invResult[0] || { on_hand_qty: 0, reserved_qty: 0 };
        const availableQty = inv.on_hand_qty - inv.reserved_qty;

        const productResult = await tx`
          SELECT procure_on_demand, procurement_type 
          FROM products 
          WHERE id = ${item.product_id}
        `;
        const prod = productResult[0] || { procure_on_demand: true };

        if (availableQty >= item.quantity) {
          // Full stock available, reserve all
          await createLedgerEntry(tx, {
            productId: item.product_id,
            movementType: "SALES_RESERVE",
            quantity: item.quantity,
            referenceType: "sales_orders",
            referenceId: orderId,
            notes: `Reserved stock for order ${order.order_number}`,
          });
        } else {
          // Stock shortage detected!
          hasShortage = true;
          const availableToReserve = Math.max(0, availableQty);
          const shortageQty = item.quantity - availableToReserve;

          // Reserve whatever is available right now
          if (availableToReserve > 0) {
            await createLedgerEntry(tx, {
              productId: item.product_id,
              movementType: "SALES_RESERVE",
              quantity: availableToReserve,
              referenceType: "sales_orders",
              referenceId: orderId,
              notes: `Partial reservation for order ${order.order_number}`,
            });
          }

          // Trigger procurement automatically for shortage if procure_on_demand is active
          if (prod.procure_on_demand) {
            await runProcurementEngine(tx, {
              productId: item.product_id,
              shortageQty,
              salesOrderId: orderId,
              userId: session.userId,
            });
          }
        }
      }

      // Update Sales Order status
      await tx`
        UPDATE sales_orders
        SET status = 'CONFIRMED'
        WHERE id = ${orderId}
      `;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "sales_orders",
        entityId: orderId,
        action: "CONFIRM",
        oldValue: { status: "DRAFT" },
        newValue: { status: "CONFIRMED" },
      });

      // Recalculate Sales Order status automatically based on reservations (WAITING_INVENTORY or READY_TO_DELIVER)
      // This will automatically deliver the order if allReserved is true.
      await recalculateSalesOrderStatus(tx, orderId);
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[confirmSalesOrderAction] error:", error);
    return { error: "Failed to confirm sales order." };
  }
}

export async function deliverSalesOrderAction(orderId: number): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "SALES" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  try {
    const orderResult = await sql`SELECT status, order_number FROM sales_orders WHERE id = ${orderId} LIMIT 1`;
    const order = orderResult[0];
    if (!order) return { error: "Sales order not found." };
    if (order.status !== "READY_TO_DELIVER" && order.status !== "CONFIRMED") {
      return { error: "Only ready or confirmed orders can be delivered." };
    }

    const items = await sql`
      SELECT product_id, quantity
      FROM sales_order_items
      WHERE sales_order_id = ${orderId}
    `;

    // 1. Verify physical stock first
    for (const item of items) {
      const invResult = await sql`
        SELECT COALESCE(on_hand_qty, 0) as on_hand_qty, COALESCE(reserved_qty, 0) as reserved_qty
        FROM inventory 
        WHERE product_id = ${item.product_id}
      `;
      const inv = invResult[0] || { on_hand_qty: 0, reserved_qty: 0 };

      // Query actual reserved quantity for this product on this order in stock_ledger
      const ledgerResult = await sql`
        SELECT COALESCE(SUM(quantity), 0) as reserved_qty
        FROM stock_ledger
        WHERE reference_type = 'sales_orders'
          AND reference_id = ${orderId}
          AND product_id = ${item.product_id}
          AND movement_type = 'SALES_RESERVE'
      `;
      const actualReserved = Number(ledgerResult[0]?.reserved_qty || 0);

      // available_qty = on_hand_qty - reserved_qty + reserved_for_this_order
      const availableQty = inv.on_hand_qty - inv.reserved_qty + actualReserved;

      if (availableQty < item.quantity) {
        return {
          error: `Insufficient stock to deliver. Available: ${availableQty}, Required: ${item.quantity}. Please complete outstanding procurement first.`,
        };
      }
    }

    // 2. Process delivery
    await sql.begin(async (tx) => {
      for (const item of items) {
        await createLedgerEntry(tx, {
          productId: item.product_id,
          movementType: "SALES_DELIVERY",
          quantity: item.quantity,
          referenceType: "sales_orders",
          referenceId: orderId,
          notes: `Delivered stock for order ${order.order_number}`,
        });
      }

      await tx`
        UPDATE sales_orders
        SET status = 'DELIVERED'
        WHERE id = ${orderId}
      `;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "sales_orders",
        entityId: orderId,
        action: "DELIVER",
        oldValue: { status: "CONFIRMED" },
        newValue: { status: "DELIVERED" },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[deliverSalesOrderAction] error:", error);
    return { error: "Failed to deliver sales order." };
  }
}

export async function cancelSalesOrderAction(orderId: number): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "SALES" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  try {
    const orderResult = await sql`SELECT status, order_number FROM sales_orders WHERE id = ${orderId} LIMIT 1`;
    const order = orderResult[0];
    if (!order) return { error: "Sales order not found." };
    if (order.status === "DELIVERED") return { error: "Cannot cancel a delivered order." };
    if (order.status === "CANCELLED") return { error: "Order is already cancelled." };

    const statusBefore = order.status;
    const items = await sql`
      SELECT product_id, quantity
      FROM sales_order_items
      WHERE sales_order_id = ${orderId}
    `;

    await sql.begin(async (tx) => {
      // If it was confirmed, we reserved stock, so we must release it
      if (statusBefore === "CONFIRMED" || statusBefore === "WAITING_INVENTORY" || statusBefore === "READY_TO_DELIVER") {
        for (const item of items) {
          // Query actual reserved quantity from stock_ledger
          const ledgerResult = await tx`
            SELECT COALESCE(SUM(quantity), 0) as reserved_qty
            FROM stock_ledger
            WHERE reference_type = 'sales_orders'
              AND reference_id = ${orderId}
              AND product_id = ${item.product_id}
              AND movement_type = 'SALES_RESERVE'
          `;
          const actualReserved = Number(ledgerResult[0]?.reserved_qty || 0);

          if (actualReserved > 0) {
            // Release reservation by submitting negative actualReserved qty in stock_ledger
            await createLedgerEntry(tx, {
              productId: item.product_id,
              movementType: "SALES_RESERVE",
              quantity: -actualReserved,
              referenceType: "sales_orders",
              referenceId: orderId,
              notes: `Released reservation due to cancellation of order ${order.order_number}`,
            });

            // Automatically check and start other MOs waiting for this released component!
            await checkAndStartWaitingMOs(tx, item.product_id, session.userId);
          }
        }
      }

      await tx`
        UPDATE sales_orders
        SET status = 'CANCELLED'
        WHERE id = ${orderId}
      `;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "sales_orders",
        entityId: orderId,
        action: "CANCEL",
        oldValue: { status: statusBefore },
        newValue: { status: "CANCELLED" },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[cancelSalesOrderAction] error:", error);
    return { error: "Failed to cancel sales order." };
  }
}
