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

  return (
    <RoleWorkspace role="manufacturing" section="manufacturing-orders">
      <ManufacturingOrdersClient initialOrders={orders} products={products} />
    </RoleWorkspace>
  );
}
