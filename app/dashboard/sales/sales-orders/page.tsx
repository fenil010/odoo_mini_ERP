import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "@/app/dashboard/role-workspace";
import { sql } from "@/lib/db";
import SalesOrdersClient from "./sales-orders-client";

export default async function SalesOrdersPage() {
  await requireRole("sales");

  const orders = await sql<any[]>`
    SELECT 
      so.id,
      so.order_number,
      so.status,
      so.created_at,
      c.name as customer_name,
      so.customer_id,
      COUNT(soi.id) as item_count,
      COALESCE(SUM(soi.quantity * soi.price), 0) as total_amount,
      COALESCE(
        json_agg(
          json_build_object(
            'product_id', soi.product_id,
            'product_name', p.name,
            'sku', p.sku,
            'quantity', soi.quantity,
            'price', soi.price,
            'available_qty', COALESCE(inv.on_hand_qty, 0) - COALESCE(inv.reserved_qty, 0),
            'reserved_for_order', COALESCE((
              SELECT SUM(sl.quantity)
              FROM stock_ledger sl
              WHERE sl.reference_type = 'sales_orders'
                AND sl.reference_id = so.id
                AND sl.product_id = soi.product_id
                AND sl.movement_type = 'SALES_RESERVE'
            ), 0)
          )
        ) FILTER (WHERE soi.id IS NOT NULL),
        '[]'
      ) as items,
      COALESCE(
        (
          -- Fetch ALL manufacturing orders linked to this SO, with their parent linkage
          SELECT json_agg(
            json_build_object(
              'id', mo.id,
              'mo_number', mo.mo_number,
              'quantity', mo.quantity,
              'status', mo.status,
              'product_name', mp.name,
              'parent_manufacturing_order_id', mo.parent_manufacturing_order_id,
              'child_pos', COALESCE((
                SELECT json_agg(json_build_object(
                  'po_number', po2.po_number,
                  'status', po2.status,
                  'product_name', pp2.name
                ))
                FROM purchase_orders po2
                JOIN purchase_order_items poi2 ON poi2.purchase_order_id = po2.id
                JOIN products pp2 ON pp2.id = poi2.product_id
                WHERE po2.manufacturing_order_id = mo.id
              ), '[]'::json)
            ) ORDER BY mo.id ASC
          )
          FROM manufacturing_orders mo
          JOIN products mp ON mp.id = mo.product_id
          WHERE mo.sales_order_id = so.id
        ),
        '[]'
      ) as related_mos,
      COALESCE(
        (
          -- Direct POs (not tied to an MO)
          SELECT json_agg(json_build_object('po_number', po.po_number, 'status', po.status))
          FROM purchase_orders po
          WHERE po.sales_order_id = so.id
            AND po.manufacturing_order_id IS NULL
        ),
        '[]'
      ) as related_pos,
      NOT EXISTS (
        SELECT 1
        FROM sales_order_items soi2
        LEFT JOIN inventory inv ON inv.product_id = soi2.product_id
        WHERE soi2.sales_order_id = so.id
          AND (
            COALESCE(inv.on_hand_qty, 0) - COALESCE(inv.reserved_qty, 0) + COALESCE((
              SELECT SUM(sl.quantity)
              FROM stock_ledger sl
              WHERE sl.reference_type = 'sales_orders'
                AND sl.reference_id = so.id
                AND sl.product_id = soi2.product_id
                AND sl.movement_type = 'SALES_RESERVE'
            ), 0)
          ) < soi2.quantity
      ) as can_deliver
    FROM sales_orders so
    JOIN customers c ON c.id = so.customer_id
    LEFT JOIN sales_order_items soi ON soi.sales_order_id = so.id
    LEFT JOIN products p ON p.id = soi.product_id
    LEFT JOIN inventory inv ON inv.product_id = soi.product_id
    GROUP BY so.id, c.name
    ORDER BY so.created_at DESC
  `;

  const customers = await sql<any[]>`
    SELECT id, name FROM customers ORDER BY name ASC
  `;

  const products = await sql<any[]>`
    SELECT id, name, sku, sale_price 
    FROM products 
    WHERE product_type = 'FINISHED_GOOD'
    ORDER BY name ASC
  `;

  return (
    <RoleWorkspace role="sales" section="sales-orders">
      <SalesOrdersClient initialOrders={orders} customers={customers} products={products} />
    </RoleWorkspace>
  );
}
