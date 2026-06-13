import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "@/app/dashboard/role-workspace";
import { sql } from "@/lib/db";
import PurchaseOrdersClient from "./purchase-orders-client";

export default async function PurchaseOrdersPage() {
  await requireRole("purchase");

  const orders = await sql<any[]>`
    SELECT 
      po.id,
      po.po_number,
      po.status,
      po.created_at,
      COALESCE(v.name, 'Deleted Vendor') as vendor_name,
      po.vendor_id,
      COUNT(poi.id) as item_count,
      COALESCE(SUM(poi.quantity * poi.cost_price), 0) as total_amount,
      COALESCE(
        json_agg(
          json_build_object(
            'product_id', poi.product_id,
            'product_name', p.name,
            'sku', p.sku,
            'quantity', poi.quantity,
            'cost_price', poi.cost_price
          )
        ) FILTER (WHERE poi.id IS NOT NULL),
        '[]'
      ) as items
    FROM purchase_orders po
    LEFT JOIN vendors v ON v.id = po.vendor_id
    LEFT JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
    LEFT JOIN products p ON p.id = poi.product_id
    GROUP BY po.id, v.name
    ORDER BY po.created_at DESC
  `;

  const vendors = await sql<any[]>`
    SELECT id, name FROM vendors ORDER BY name ASC
  `;

  const products = await sql<any[]>`
    SELECT 
      p.id, 
      p.name, 
      p.sku, 
      p.cost_price,
      COALESCE(
        (
          SELECT json_agg(pv.vendor_id) 
          FROM product_vendors pv 
          WHERE pv.product_id = p.id AND pv.vendor_id IS NOT NULL
        ),
        '[]'::json
      ) as vendor_ids
    FROM products p
    ORDER BY p.name ASC
  `;

  return (
    <RoleWorkspace role="purchase" section="purchase-orders">
      <PurchaseOrdersClient initialOrders={orders} vendors={vendors} products={products} />
    </RoleWorkspace>
  );
}
