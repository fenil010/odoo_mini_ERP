import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "@/app/dashboard/role-workspace";
import { sql } from "@/lib/db";
import VendorsClient from "./vendors-client";

export default async function PurchaseVendorsPage() {
  await requireRole("purchase");

  const vendors = await sql<any[]>`
    SELECT 
      v.id, 
      v.name, 
      v.email, 
      v.phone,
      COALESCE(
        (
          SELECT json_agg(p.name)
          FROM product_vendors pv
          JOIN products p ON p.id = pv.product_id
          WHERE pv.vendor_id = v.id AND p.name IS NOT NULL
        ),
        '[]'::json
      ) as products_sold,
      COALESCE(
        (
          SELECT json_agg(pv.product_id)
          FROM product_vendors pv
          WHERE pv.vendor_id = v.id AND pv.product_id IS NOT NULL
        ),
        '[]'::json
      ) as product_ids
    FROM vendors v
    ORDER BY v.name ASC
  `;

  const products = await sql<any[]>`
    SELECT id, name, sku FROM products ORDER BY name ASC
  `;

  return (
    <RoleWorkspace role="purchase" section="vendors">
      <VendorsClient initialVendors={vendors} products={products} />
    </RoleWorkspace>
  );
}
