import postgres from "postgres";
import { generateOrderNumber } from "./erp-utils";
import { logAudit } from "./audit";
import { startManufacturingOrderIfReady } from "./stock-ledger";

/**
 * runProcurementEngine — Pure server function
 * 
 * Invoked when stock shortage is detected.
 * Automates creation of Manufacturing Orders (MO) or Purchase Orders (PO)
 * depending on product procurement type.
 */
export async function runProcurementEngine(
  tx: postgres.TransactionSql,
  params: {
    productId: number;
    shortageQty: number;
    salesOrderId?: number;
    userId: number;
    parentManufacturingOrderId?: number;
  },
  visited: Set<number> = new Set()
) {
  const { productId, shortageQty: rawShortageQty, salesOrderId, userId, parentManufacturingOrderId } = params;
  const shortageQty = Math.ceil(rawShortageQty);

  // 1. Cycle detection (CRITICAL FIX 6)
  if (visited.has(productId)) {
    throw new Error("Circular Bill Of Materials detected.");
  }
  visited.add(productId);

  // 2. Fetch product details
  const products = await tx`
    SELECT id, name, sku, procurement_type, product_type
    FROM products
    WHERE id = ${productId}
  `;
  const product = products[0];
  if (!product) return;

  // Normalize/validate procurement type (CRITICAL FIX 13)
  let normalizedType = (product.procurement_type || "").toUpperCase().trim();
  if (normalizedType === "BUY") {
    normalizedType = "PURCHASE";
  }

  if (normalizedType !== "PURCHASE" && normalizedType !== "MANUFACTURE") {
    console.error(`[runProcurementEngine] Unknown procurement type: ${product.procurement_type} for product ID ${productId}`);
    
    // Log audit entry for validation failure
    await logAudit(tx, {
      userId,
      entityType: "products",
      entityId: productId,
      action: "PROCUREMENT_FAILURE",
      newValue: { error: `Unknown procurement type: ${product.procurement_type}`, shortageQty, salesOrderId }
    });
    
    throw new Error(`Unknown procurement type: ${product.procurement_type}`);
  }

  if (normalizedType === "MANUFACTURE") {
    // Check for existing unfulfilled Manufacturing Orders to prevent duplicate runs
    const existingMfgResult = await tx`
      SELECT COALESCE(SUM(quantity), 0)::int as total
      FROM manufacturing_orders
      WHERE product_id = ${productId}
        AND status IN ('WAITING_MATERIALS', 'READY', 'IN_PROGRESS')
        AND (sales_order_id = ${salesOrderId || null} OR (sales_order_id IS NULL AND parent_manufacturing_order_id IS NULL))
    `;
    const existingMfgQty = existingMfgResult[0]?.total || 0;
    const adjustedQty = shortageQty - existingMfgQty;

    if (adjustedQty <= 0) {
      console.log(`[runProcurementEngine] Sufficient unfulfilled Manufacturing Orders exist (${existingMfgQty} units) for product ID ${productId}. Skipping new MO creation.`);
      return;
    }

    const moNumber = generateOrderNumber("MO");

    // Create Manufacturing Order with WAITING_MATERIALS status initially
    const moResult = await tx<{ id: number }[]>`
      INSERT INTO manufacturing_orders (mo_number, product_id, quantity, status, sales_order_id, parent_manufacturing_order_id, created_at)
      VALUES (${moNumber}, ${productId}, ${adjustedQty}, 'WAITING_MATERIALS', ${salesOrderId || null}, ${parentManufacturingOrderId || null}, NOW())
      RETURNING id
    `;
    const moId = moResult[0].id;

    // Create audit entry for auto-generated MO
    await logAudit(tx, {
      userId,
      entityType: "manufacturing_orders",
      entityId: moId,
      action: "AUTO_CREATE",
      newValue: { moNumber, productId, quantity: adjustedQty, status: 'WAITING_MATERIALS', salesOrderId, parentManufacturingOrderId },
    });

    // Fetch Bill of Materials (BoM)
    const bomResult = await tx`
      SELECT id FROM boms WHERE product_id = ${productId} LIMIT 1
    `;
    const bom = bomResult[0];

    if (bom) {
      const bomItems = await tx`
        SELECT component_product_id, quantity
        FROM bom_items
        WHERE bom_id = ${bom.id}
      `;

      for (const item of bomItems) {
        const neededQty = Number(item.quantity) * adjustedQty;
        
        // Ensure inventory record exists
        await tx`
          INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
          VALUES (${item.component_product_id}, 0, 0)
          ON CONFLICT (product_id) DO NOTHING
        `;

        const inventoryResult = await tx`
          SELECT on_hand_qty, reserved_qty 
          FROM inventory 
          WHERE product_id = ${item.component_product_id}
        `;
        const inv = inventoryResult[0] || { on_hand_qty: 0, reserved_qty: 0 };
        const availableQty = inv.on_hand_qty - inv.reserved_qty;

        if (availableQty < neededQty) {
          const componentShortage = neededQty - availableQty;

          // Recursively trigger procurement engine for missing raw materials/components
          await runProcurementEngine(tx, {
            productId: item.component_product_id,
            shortageQty: componentShortage,
            salesOrderId,
            userId,
            parentManufacturingOrderId: moId,
          }, new Set(visited));
        }
      }
    }

    // Automatically check and start production if components are ready!
    await startManufacturingOrderIfReady(tx, moId, userId);
  } else if (normalizedType === "PURCHASE") {
    // Check for existing unfulfilled Purchase Orders to prevent duplicate vendor orders
    const existingPoResult = await tx`
      SELECT COALESCE(SUM(poi.quantity), 0)::int as total
      FROM purchase_order_items poi
      JOIN purchase_orders po ON po.id = poi.purchase_order_id
      WHERE poi.product_id = ${productId}
        AND po.status IN ('DRAFT', 'CONFIRMED', 'SHIPPED')
        AND (po.sales_order_id = ${salesOrderId || null} OR (po.sales_order_id IS NULL AND po.manufacturing_order_id IS NULL))
    `;
    const existingPoQty = existingPoResult[0]?.total || 0;
    const adjustedQty = shortageQty - existingPoQty;

    if (adjustedQty <= 0) {
      console.log(`[runProcurementEngine] Sufficient unfulfilled Purchase Orders exist (${existingPoQty} units) for product ID ${productId}. Skipping new PO creation.`);
      return;
    }

    const poNumber = generateOrderNumber("PO");

    let vendorId = null;
    const mappedVendor = await tx`
      SELECT vendor_id FROM product_vendors WHERE product_id = ${productId} LIMIT 1
    `;
    
    if (mappedVendor.length > 0) {
      vendorId = mappedVendor[0].vendor_id;
    } else {
      const anyVendor = await tx`SELECT id FROM vendors LIMIT 1`;
      if (anyVendor.length > 0) {
        vendorId = anyVendor[0].id;
      }
    }

    if (!vendorId) {
      // Fallback fallback: create a default vendor if none exists
      const defaultVendorResult = await tx<{ id: number }[]>`
        INSERT INTO vendors (name, email, phone)
        VALUES ('Default Vendor', 'default@vendor.local', '0000000000')
        RETURNING id
      `;
      vendorId = defaultVendorResult[0].id;
    }

    const poResult = await tx<{ id: number }[]>`
      INSERT INTO purchase_orders (po_number, vendor_id, status, sales_order_id, manufacturing_order_id, created_by, created_at)
      VALUES (${poNumber}, ${vendorId}, 'DRAFT', ${salesOrderId || null}, ${parentManufacturingOrderId || null}, ${userId}, NOW())
      RETURNING id
    `;
    const poId = poResult[0].id;

    const costPriceResult = await tx`
      SELECT cost_price FROM products WHERE id = ${productId}
    `;
    const costPrice = costPriceResult[0]?.cost_price || 0.00;

    await tx`
      INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, cost_price)
      VALUES (${poId}, ${productId}, ${adjustedQty}, ${costPrice})
    `;

    // Create audit entry for auto-generated PO
    await logAudit(tx, {
      userId,
      entityType: "purchase_orders",
      entityId: poId,
      action: "AUTO_CREATE",
      newValue: { poNumber, vendorId, productId, quantity: adjustedQty, costPrice, parentManufacturingOrderId },
    });
  }
}
