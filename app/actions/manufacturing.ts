"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";
import { logAudit } from "@/lib/audit";
import { generateOrderNumber } from "@/lib/erp-utils";
import { createLedgerEntry, allocateStockToWaitingOrders, startManufacturingOrderIfReady, checkAndStartWaitingMOs } from "@/lib/stock-ledger";
import { runProcurementEngine } from "@/lib/procurement-engine";

const moSchema = z.object({
  product_id: z.coerce.number().min(1, "Product is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createManufacturingOrderAction(
  productId: number,
  quantity: number
): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "MANUFACTURING" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  const result = moSchema.safeParse({ product_id: productId, quantity });
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid input." };
  }

  const moNumber = generateOrderNumber("MO");

  try {
    await sql.begin(async (tx) => {
      const bomResult = await tx`SELECT id FROM boms WHERE product_id = ${productId} LIMIT 1`;
      const bom = bomResult[0];

      let initialStatus = "READY";

      if (bom) {
        const bomItems = await tx`
          SELECT component_product_id, quantity FROM bom_items WHERE bom_id = ${bom.id}
        `;

        for (const item of bomItems) {
          const neededQty = Number(item.quantity) * quantity;
          
          await tx`
            INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
            VALUES (${item.component_product_id}, 0, 0)
            ON CONFLICT (product_id) DO NOTHING
          `;

          const invResult = await tx`
            SELECT on_hand_qty, reserved_qty FROM inventory WHERE product_id = ${item.component_product_id}
          `;
          const inv = invResult[0] || { on_hand_qty: 0, reserved_qty: 0 };
          const availableQty = inv.on_hand_qty - inv.reserved_qty;

          if (availableQty < neededQty) {
            initialStatus = "WAITING_MATERIALS";
            
            // Automatically trigger procurement for missing raw materials/components
            const componentShortage = neededQty - availableQty;
            await runProcurementEngine(tx, {
              productId: item.component_product_id,
              shortageQty: componentShortage,
              userId: session.userId,
            });
          }
        }
      }

      const moResult = await tx<{ id: number }[]>`
        INSERT INTO manufacturing_orders (mo_number, product_id, quantity, status, created_at)
        VALUES (${moNumber}, ${productId}, ${quantity}, 'WAITING_MATERIALS', NOW())
        RETURNING id
      `;
      const moId = moResult[0].id;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "manufacturing_orders",
        entityId: moId,
        action: "CREATE",
        newValue: { moNumber, productId, quantity, status: 'WAITING_MATERIALS' },
      });

      // Automatically check and start production if components are ready!
      await startManufacturingOrderIfReady(tx, moId, session.userId);
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[createManufacturingOrderAction] error:", error);
    return { error: "Failed to create manufacturing order." };
  }
}

export async function startManufacturingOrderAction(moId: number): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "MANUFACTURING" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  try {
    const moResult = await sql`SELECT status, product_id, quantity, mo_number FROM manufacturing_orders WHERE id = ${moId} LIMIT 1`;
    const mo = moResult[0];
    if (!mo) return { error: "Manufacturing order not found." };
    if (mo.status !== "READY") {
      return { error: "Production can only be started when status is READY (all materials available)." };
    }

    const bomResult = await sql`SELECT id FROM boms WHERE product_id = ${mo.product_id} LIMIT 1`;
    const bom = bomResult[0];

    await sql.begin(async (tx) => {
      if (bom) {
        const bomItems = await tx`
          SELECT bi.component_product_id, bi.quantity, p.name as component_name
          FROM bom_items bi
          JOIN products p ON p.id = bi.component_product_id
          WHERE bi.bom_id = ${bom.id}
        `;

        for (const item of bomItems) {
          const neededQty = Number(item.quantity) * Number(mo.quantity);

          // Check if components were already reserved by the auto-readiness engine
          const alreadyReservedResult = await tx`
            SELECT COALESCE(SUM(quantity), 0)::numeric as total
            FROM stock_ledger
            WHERE reference_type = 'manufacturing_orders'
              AND reference_id = ${moId}
              AND product_id = ${item.component_product_id}
              AND movement_type = 'MO_RESERVE'
          `;
          const alreadyReservedQty = Number(alreadyReservedResult[0]?.total || 0);

          if (alreadyReservedQty >= neededQty) {
            // Components already reserved by auto-readiness — skip to avoid double-reserve
            continue;
          }

          const remainingToReserve = neededQty - alreadyReservedQty;

          await tx`
            INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
            VALUES (${item.component_product_id}, 0, 0)
            ON CONFLICT (product_id) DO NOTHING
          `;

          const invResult = await tx`
            SELECT on_hand_qty, reserved_qty 
            FROM inventory 
            WHERE product_id = ${item.component_product_id}
            FOR UPDATE
          `;
          const inv = invResult[0] || { on_hand_qty: 0, reserved_qty: 0 };
          const availableQty = Number(inv.on_hand_qty) - Number(inv.reserved_qty);

          if (availableQty < remainingToReserve) {
            throw new Error(`Insufficient stock for component "${item.component_name}". Available: ${availableQty}, Needed: ${remainingToReserve}.`);
          }

          await createLedgerEntry(tx, {
            productId: item.component_product_id,
            movementType: "MO_RESERVE",
            quantity: remainingToReserve,
            referenceType: "manufacturing_orders",
            referenceId: moId,
            notes: `Reserved component for MO ${mo.mo_number}`,
          });
        }
      }

      await tx`
        UPDATE manufacturing_orders
        SET status = 'IN_PROGRESS'
        WHERE id = ${moId}
      `;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "manufacturing_orders",
        entityId: moId,
        action: "START",
        oldValue: { status: "READY" },
        newValue: { status: "IN_PROGRESS" },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[startManufacturingOrderAction] error:", error);
    return { error: "Failed to start manufacturing order." };
  }
}

export async function completeManufacturingOrderAction(moId: number): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "MANUFACTURING" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  try {
    const moResult = await sql`SELECT status, product_id, quantity, mo_number FROM manufacturing_orders WHERE id = ${moId} LIMIT 1`;
    const mo = moResult[0];
    if (!mo) return { error: "Manufacturing order not found." };
    if (mo.status !== "IN_PROGRESS") return { error: "Only production in progress can be completed." };

    const bomResult = await sql`SELECT id FROM boms WHERE product_id = ${mo.product_id} LIMIT 1`;
    const bom = bomResult[0];

    await sql.begin(async (tx) => {
      if (bom) {
        const bomItems = await tx`
          SELECT component_product_id, quantity FROM bom_items WHERE bom_id = ${bom.id}
        `;

        for (const item of bomItems) {
          const consumeQty = Number(item.quantity) * Number(mo.quantity);
          await createLedgerEntry(tx, {
            productId: item.component_product_id,
            movementType: "MO_CONSUME",
            quantity: consumeQty,
            referenceType: "manufacturing_orders",
            referenceId: moId,
            notes: `Consumed component for MO ${mo.mo_number}`,
          });
        }
      }

      await createLedgerEntry(tx, {
        productId: mo.product_id,
        movementType: "MO_PRODUCE",
        quantity: Number(mo.quantity),
        referenceType: "manufacturing_orders",
        referenceId: moId,
        notes: `Produced finished goods for MO ${mo.mo_number}`,
      });

      // Allocate produced stock to waiting sales orders!
      await allocateStockToWaitingOrders(tx, mo.product_id);

      // Automatically check and start other MOs waiting for this produced component!
      await checkAndStartWaitingMOs(tx, mo.product_id, session.userId);

      await tx`
        UPDATE manufacturing_orders
        SET status = 'COMPLETED'
        WHERE id = ${moId}
      `;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "manufacturing_orders",
        entityId: moId,
        action: "COMPLETE",
        oldValue: { status: "IN_PROGRESS" },
        newValue: { status: "COMPLETED" },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[completeManufacturingOrderAction] error:", error);
    return { error: "Failed to complete manufacturing order." };
  }
}

export async function cancelManufacturingOrderAction(moId: number): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "MANUFACTURING" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  try {
    const moResult = await sql`SELECT status, product_id, mo_number FROM manufacturing_orders WHERE id = ${moId} LIMIT 1`;
    const mo = moResult[0];
    if (!mo) return { error: "Manufacturing order not found." };
    if (mo.status === "COMPLETED") {
      return { error: "Completed manufacturing orders cannot be cancelled." };
    }
    if (mo.status === "CANCELLED") {
      return { error: "Manufacturing order is already cancelled." };
    }

    const statusBefore = mo.status;
    const bomResult = await sql`SELECT id FROM boms WHERE product_id = ${mo.product_id} LIMIT 1`;
    const bom = bomResult[0];

    await sql.begin(async (tx) => {
      // Release reservations if components were reserved
      if (bom) {
        const bomItems = await tx`
          SELECT component_product_id FROM bom_items WHERE bom_id = ${bom.id}
        `;

        for (const item of bomItems) {
          const ledgerResult = await tx`
            SELECT COALESCE(SUM(quantity), 0) as reserved_qty
            FROM stock_ledger
            WHERE reference_type = 'manufacturing_orders'
              AND reference_id = ${moId}
              AND product_id = ${item.component_product_id}
              AND movement_type = 'MO_RESERVE'
          `;
          const actualReserved = Number(ledgerResult[0]?.reserved_qty || 0);

            if (actualReserved > 0) {
              await createLedgerEntry(tx, {
                productId: item.component_product_id,
                movementType: "MO_RESERVE",
                quantity: -actualReserved,
                referenceType: "manufacturing_orders",
                referenceId: moId,
                notes: `Released reservation due to cancellation of MO ${mo.mo_number}`,
              });

              // Automatically check and start other MOs waiting for this released component!
              await checkAndStartWaitingMOs(tx, item.component_product_id, session.userId);
            }
          }
        }

      await tx`
        UPDATE manufacturing_orders
        SET status = 'CANCELLED'
        WHERE id = ${moId}
      `;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "manufacturing_orders",
        entityId: moId,
        action: "CANCEL",
        oldValue: { status: statusBefore },
        newValue: { status: "CANCELLED" },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[cancelManufacturingOrderAction] error:", error);
    return { error: "Failed to cancel manufacturing order." };
  }
}
