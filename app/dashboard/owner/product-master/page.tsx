import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "@/app/dashboard/role-workspace";
import { sql } from "@/lib/db";
import ProductMasterClient from "./product-master-client";

export default async function OwnerProductMasterPage() {
  await requireRole("owner");

  const products = await sql<any[]>`
    SELECT p.*, 
           COALESCE(i.on_hand_qty, 0) as on_hand_qty, 
           COALESCE(i.reserved_qty, 0) as reserved_qty
    FROM products p
    LEFT JOIN inventory i ON i.product_id = p.id
    ORDER BY p.created_at DESC
  `;

  return (
    <RoleWorkspace role="owner" section="product-master">
      <ProductMasterClient initialProducts={products} />
    </RoleWorkspace>
  );
}
