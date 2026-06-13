import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "@/app/dashboard/role-workspace";
import { sql } from "@/lib/db";
import MasterDataClient from "./master-data-client";

export default async function AdminMasterDataPage() {
  await requireRole("admin");

  const products = await sql<any[]>`
    SELECT p.*, 
           COALESCE(i.on_hand_qty, 0) as on_hand_qty, 
           COALESCE(i.reserved_qty, 0) as reserved_qty
    FROM products p
    LEFT JOIN inventory i ON i.product_id = p.id
    ORDER BY p.created_at DESC
  `;

  const customers = await sql<any[]>`
    SELECT id, name, email, phone
    FROM customers
    ORDER BY name ASC
  `;

  const vendors = await sql<any[]>`
    SELECT id, name, email, phone
    FROM vendors
    ORDER BY name ASC
  `;

  return (
    <RoleWorkspace role="admin" section="master-data">
      <MasterDataClient products={products} customers={customers} vendors={vendors} />
    </RoleWorkspace>
  );
}
