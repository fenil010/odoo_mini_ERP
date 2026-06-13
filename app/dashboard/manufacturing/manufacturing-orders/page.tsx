import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "@/app/dashboard/role-workspace";
import { sql } from "@/lib/db";
import ManufacturingOrdersClient from "./manufacturing-orders-client";

export default async function ManufacturingOrdersPage() {
  await requireRole("manufacturing");

  const orders = await sql<any[]>`
    SELECT 
      mo.id,
      mo.mo_number,
      mo.quantity,
      mo.status,
      mo.created_at,
      mo.parent_manufacturing_order_id,
      p.name as product_name,
      p.sku,
      mo.product_id,
      so.order_number as sales_order_number
    FROM manufacturing_orders mo
    JOIN products p ON p.id = mo.product_id
    LEFT JOIN sales_orders so ON so.id = mo.sales_order_id
    ORDER BY mo.created_at DESC
  `;

  // Fetch products that can be manufactured
  const products = await sql<any[]>`
    SELECT id, name, sku 
    FROM products 
    WHERE procurement_type = 'MANUFACTURE' OR product_type = 'FINISHED_GOOD'
    ORDER BY name ASC
  `;

  // Fetch real BOM items and component inventory status
  const bomComponents = await sql<any[]>`
    SELECT 
      b.product_id as parent_product_id,
      bi.component_product_id,
      p.name as component_name,
      p.sku as component_sku,
      p.procurement_type as component_procurement_type,
      bi.quantity::float as quantity_required,
      COALESCE(i.on_hand_qty, 0)::int as on_hand_qty,
      COALESCE(i.reserved_qty, 0)::int as reserved_qty
    FROM boms b
    JOIN bom_items bi ON bi.bom_id = b.id
    JOIN products p ON p.id = bi.component_product_id
    LEFT JOIN inventory i ON i.product_id = p.id
  `;

  // Fetch active purchase order items
  const purchaseOrderItems = await sql<any[]>`
    SELECT 
      po.id,
      po.po_number,
      po.status,
      po.manufacturing_order_id,
      poi.product_id,
      poi.quantity::float as quantity
    FROM purchase_orders po
    JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
  `;

  return (
    <RoleWorkspace role="manufacturing" section="manufacturing-orders">
      <ManufacturingOrdersClient 
        initialOrders={orders} 
        products={products} 
        bomComponents={bomComponents}
        purchaseOrderItems={purchaseOrderItems}
      />
    </RoleWorkspace>
  );
}
