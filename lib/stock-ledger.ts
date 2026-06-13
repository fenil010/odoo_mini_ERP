import postgres from "postgres";
import { logAudit } from "./audit";


export type MovementType =
  | "PURCHASE_RECEIPT"
  | "SALES_RESERVE"
  | "SALES_DELIVERY"
  | "MO_RESERVE"
  | "MO_CONSUME"
  | "MO_PRODUCE"
  | "ADJUSTMENT";

export async function createLedgerEntry(
  client: postgres.Sql | postgres.TransactionSql,
  params: {
    productId: number;
    movementType: MovementType;
    quantity: number; // positive or negative quantity representing the transaction size/delta
    referenceType: string; // e.g. "sales_orders", "purchase_orders", "manufacturing_orders", "manual"
    referenceId: number;
    notes?: string;
  }
) {
  const { productId, movementType, quantity: rawQuantity, referenceType, referenceId, notes } = params;
  const quantity = rawQuantity < 0 ? -Math.ceil(Math.abs(rawQuantity)) : Math.ceil(rawQuantity);

  // 1. Insert into stock_ledger
  await client`
    INSERT INTO stock_ledger (product_id, movement_type, quantity, reference_type, reference_id, notes)
    VALUES (${productId}, ${movementType}, ${quantity}, ${referenceType}, ${referenceId}, ${notes || null})
  `;

  // 2. Ensure the inventory row exists for this product
  await client`
    INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
    VALUES (${productId}, 0, 0)
    ON CONFLICT (product_id) DO NOTHING
  `;

  // Determine adjustments based on movement type
  let onHandDelta = 0;
  let reservedDelta = 0;

  switch (movementType) {
    case "PURCHASE_RECEIPT":
      onHandDelta = quantity;
      break;

    case "SALES_RESERVE":
      reservedDelta = quantity;
      break;

    case "SALES_DELIVERY":
      onHandDelta = -quantity;
      reservedDelta = -quantity;
      break;

    case "MO_RESERVE":
      reservedDelta = quantity;
      break;

    case "MO_CONSUME":
      onHandDelta = -quantity;
      reservedDelta = -quantity;
      break;

    case "MO_PRODUCE":
      onHandDelta = quantity;
      break;

    case "ADJUSTMENT":
      onHandDelta = quantity;
      break;

    default:
      throw new Error(`Unknown movement type: ${movementType}`);
  }

  // 3. Negative Inventory Protection: query the current values and validate before updating
  const [inv] = await client<{ on_hand_qty: number; reserved_qty: number }[]>`
    SELECT on_hand_qty, reserved_qty 
    FROM inventory 
    WHERE product_id = ${productId}
    FOR UPDATE
  `;

  if (!inv) {
    throw new Error(`Inventory record not found for product ID ${productId}`);
  }

  const nextOnHand = Number(inv.on_hand_qty) + onHandDelta;
  const nextReserved = Number(inv.reserved_qty) + reservedDelta;

  if (nextOnHand < 0) {
    throw new Error(`Inventory mutation failed: on_hand_qty for product ID ${productId} would become negative (${nextOnHand})`);
  }

  // Self-healing: if reserved_qty would become negative (due to legacy database states or desynced reservations),
  // clamp it to 0 to prevent crashes and allow normal transaction flow.
  const finalReserved = Math.max(0, nextReserved);

  await client`
    UPDATE inventory
    SET on_hand_qty = ${nextOnHand},
        reserved_qty = ${finalReserved},
        updated_at = NOW()
    WHERE product_id = ${productId}
  `;
}

export async function recalculateSalesOrderStatus(tx: postgres.TransactionSql, salesOrderId: number) {
  const [order] = await tx`
    SELECT status, order_number FROM sales_orders WHERE id = ${salesOrderId} FOR UPDATE
  `;
  if (!order) return;
  if (order.status !== "CONFIRMED" && order.status !== "WAITING_INVENTORY" && order.status !== "READY_TO_DELIVER") {
    return;
  }

  const items = await tx`
    SELECT 
      soi.product_id,
      soi.quantity as required_qty,
      COALESCE((
        SELECT SUM(sl.quantity)
        FROM stock_ledger sl
        WHERE sl.reference_type = 'sales_orders'
          AND sl.reference_id = ${salesOrderId}
          AND sl.product_id = soi.product_id
          AND sl.movement_type = 'SALES_RESERVE'
      ), 0) as reserved_qty
    FROM sales_order_items soi
    WHERE soi.sales_order_id = ${salesOrderId}
  `;

  let allReserved = true;
  for (const item of items) {
    if (Number(item.reserved_qty) < Number(item.required_qty)) {
      allReserved = false;
      break;
    }
  }

  if (allReserved) {
    // Automatically deliver Sales Order when fully reserved!
    for (const item of items) {
      await createLedgerEntry(tx, {
        productId: item.product_id,
        movementType: "SALES_DELIVERY",
        quantity: Number(item.required_qty),
        referenceType: "sales_orders",
        referenceId: salesOrderId,
        notes: `Auto-delivered stock for order ${order.order_number} (automatic delivery on fulfillment)`,
      });
    }

    await tx`
      UPDATE sales_orders
      SET status = 'DELIVERED'
      WHERE id = ${salesOrderId}
    `;

    await logAudit(tx, {
      userId: 1, // System admin
      entityType: "sales_orders",
      entityId: salesOrderId,
      action: "DELIVER",
      oldValue: { status: order.status },
      newValue: { status: "DELIVERED" },
    });
  } else {
    // If not all reserved, update to WAITING_INVENTORY
    if (order.status !== "WAITING_INVENTORY") {
      await tx`
        UPDATE sales_orders
        SET status = 'WAITING_INVENTORY'
        WHERE id = ${salesOrderId}
      `;

      await logAudit(tx, {
        userId: 1, // System admin
        entityType: "sales_orders",
        entityId: salesOrderId,
        action: "STATUS_UPDATE",
        oldValue: { status: order.status },
        newValue: { status: "WAITING_INVENTORY" },
      });
    }
  }
}

export async function allocateStockToWaitingOrders(tx: postgres.TransactionSql, productId: number) {
  const [inv] = await tx`
    SELECT on_hand_qty, reserved_qty 
    FROM inventory 
    WHERE product_id = ${productId}
    FOR UPDATE
  `;
  if (!inv) return;
  let availableQty = Number(inv.on_hand_qty) - Number(inv.reserved_qty);
  if (availableQty <= 0) return;

  const waitingItems = await tx`
    SELECT 
      soi.sales_order_id,
      soi.quantity as required_qty,
      so.order_number,
      COALESCE((
        SELECT SUM(sl.quantity)
        FROM stock_ledger sl
        WHERE sl.reference_type = 'sales_orders'
          AND sl.reference_id = soi.sales_order_id
          AND sl.product_id = soi.product_id
          AND sl.movement_type = 'SALES_RESERVE'
      ), 0) as reserved_qty
    FROM sales_order_items soi
    JOIN sales_orders so ON so.id = soi.sales_order_id
    WHERE soi.product_id = ${productId}
      AND so.status IN ('CONFIRMED', 'WAITING_INVENTORY', 'READY_TO_DELIVER')
    ORDER BY so.created_at ASC, soi.sales_order_id ASC
  `;

  for (const item of waitingItems) {
    if (availableQty <= 0) break;

    const shortage = Number(item.required_qty) - Number(item.reserved_qty);
    if (shortage <= 0) continue;

    const allocateQty = Math.min(availableQty, shortage);
    if (allocateQty > 0) {
      await createLedgerEntry(tx, {
        productId,
        movementType: "SALES_RESERVE",
        quantity: allocateQty,
        referenceType: "sales_orders",
        referenceId: item.sales_order_id,
        notes: `Auto-allocated stock for order ${item.order_number} from incoming inventory`,
      });
      availableQty -= allocateQty;

      await recalculateSalesOrderStatus(tx, item.sales_order_id);
    }
  }
}

export async function startManufacturingOrderIfReady(tx: postgres.TransactionSql, moId: number, userId: number) {
  const [mo] = await tx`
    SELECT id, mo_number, product_id, quantity, status 
    FROM manufacturing_orders 
    WHERE id = ${moId} 
    FOR UPDATE
  `;
  if (!mo) return;
  
  if (mo.status !== "WAITING_MATERIALS" && mo.status !== "READY" && mo.status !== "") {
    return;
  }

  const [bom] = await tx`SELECT id FROM boms WHERE product_id = ${mo.product_id} LIMIT 1`;
  
  let allComponentsAvailable = true;
  const componentsToReserve = [];
  if (bom) {
    const bomItems = await tx`
      SELECT bi.component_product_id, bi.quantity, p.name as component_name
      FROM bom_items bi
      JOIN products p ON p.id = bi.component_product_id
      WHERE bi.bom_id = ${bom.id}
    `;

    // Extract and sort component product IDs numerically to prevent deadlocks
    const componentIds = bomItems
      .map((item) => Number(item.component_product_id))
      .sort((a, b) => a - b);

    if (componentIds.length > 0) {
      // 1. Ensure all inventory records exist
      for (const id of componentIds) {
        await tx`
          INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
          VALUES (${id}, 0, 0)
          ON CONFLICT (product_id) DO NOTHING
        `;
      }

      // 2. Lock inventory rows in sorted, deterministic order
      const lockedInventory = await tx`
        SELECT product_id, on_hand_qty, reserved_qty 
        FROM inventory 
        WHERE product_id = ANY(${componentIds}) 
        ORDER BY product_id ASC 
        FOR UPDATE
      `;

      const inventoryMap = new Map(lockedInventory.map((row) => [row.product_id, row]));

      // 3. Verify availability of all components
      for (const item of bomItems) {
        const neededQty = Number(item.quantity) * Number(mo.quantity);
        const inv = inventoryMap.get(item.component_product_id) || { on_hand_qty: 0, reserved_qty: 0 };
        const availableQty = Number(inv.on_hand_qty) - Number(inv.reserved_qty);

        if (availableQty < neededQty) {
          allComponentsAvailable = false;
          break;
        }

        componentsToReserve.push({
          productId: item.component_product_id,
          reserveQty: neededQty,
        });
      }
    }
  }
  if (allComponentsAvailable) {
    // 1. Reserve all components in the stock ledger
    for (const comp of componentsToReserve) {
      await createLedgerEntry(tx, {
        productId: comp.productId,
        movementType: "MO_RESERVE",
        quantity: comp.reserveQty,
        referenceType: "manufacturing_orders",
        referenceId: moId,
        notes: `Auto-reserved component for MO ${mo.mo_number}`,
      });
    }

    // 2. Update MO status to READY
    await tx`
      UPDATE manufacturing_orders
      SET status = 'READY'
      WHERE id = ${moId}
    `;

    // 3. Log audit entry
    await logAudit(tx, {
      userId,
      entityType: "manufacturing_orders",
      entityId: moId,
      action: "AUTO_READY",
      oldValue: { status: mo.status },
      newValue: { status: "READY" },
    });
  } else {
    if (mo.status !== "WAITING_MATERIALS") {
      await tx`
        UPDATE manufacturing_orders
        SET status = 'WAITING_MATERIALS'
        WHERE id = ${moId}
      `;
    }
  }
}

export async function checkAndStartWaitingMOs(
  tx: postgres.TransactionSql,
  productId: number,
  userId: number
) {
  const waitingMOs = await tx`
    SELECT DISTINCT mo.id
    FROM manufacturing_orders mo
    JOIN boms b ON b.product_id = mo.product_id
    JOIN bom_items bi ON bi.bom_id = b.id
    WHERE mo.status = 'WAITING_MATERIALS'
      AND bi.component_product_id = ${productId}
  `;

  for (const mo of waitingMOs) {
    await startManufacturingOrderIfReady(tx, mo.id, userId);
  }
}

