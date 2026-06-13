import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "@/app/dashboard/role-workspace";
import { sql } from "@/lib/db";
import OnHandStockClient from "./on-hand-stock-client";

export default async function OnHandStockPage() {
  await requireRole("inventory");

  const stock = await sql<any[]>`
    SELECT 
      p.id as product_id,
      p.name as product_name,
      p.sku,
      p.image_url,
      p.product_type,
      COALESCE(inv.id, 0) as id,
      COALESCE(inv.on_hand_qty, 0) as on_hand_qty,
      COALESCE(inv.reserved_qty, 0) as reserved_qty,
      COALESCE(inv.on_hand_qty - inv.reserved_qty, 0) as available_qty
    FROM products p
    LEFT JOIN inventory inv ON inv.product_id = p.id
    ORDER BY p.name ASC
  `;

  return (
    <RoleWorkspace role="inventory" section="on-hand-stock">
      <OnHandStockClient initialStock={stock} />
    </RoleWorkspace>
  );
}
