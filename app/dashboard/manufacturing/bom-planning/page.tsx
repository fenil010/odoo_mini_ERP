import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "@/app/dashboard/role-workspace";
import { sql } from "@/lib/db";
import BomPlanningClient from "./bom-planning-client";

export default async function BomPlanningPage() {
  await requireRole("manufacturing");

  const boms = await sql<any[]>`
    SELECT 
      b.id,
      b.product_id,
      p.name as product_name,
      p.sku,
      COUNT(bi.id) as item_count,
      COALESCE(
        json_agg(
          json_build_object(
            'component_product_id', bi.component_product_id,
            'component_name', cp.name,
            'sku', cp.sku,
            'quantity', bi.quantity
          )
        ) FILTER (WHERE bi.id IS NOT NULL),
        '[]'
      ) as components
    FROM boms b
    JOIN products p ON p.id = b.product_id
    LEFT JOIN bom_items bi ON bi.bom_id = b.id
    LEFT JOIN products cp ON cp.id = bi.component_product_id
    GROUP BY b.id, p.name, p.sku, b.product_id
    ORDER BY p.name ASC
  `;

  // Products that can be manufactured
  const products = await sql<any[]>`
    SELECT id, name, sku 
    FROM products 
    WHERE procurement_type = 'MANUFACTURE' OR product_type = 'FINISHED_GOOD'
    ORDER BY name ASC
  `;

  // Component options (raw materials)
  const rawMaterials = await sql<any[]>`
    SELECT id, name, sku 
    FROM products 
    WHERE procurement_type = 'BUY' OR product_type = 'RAW_MATERIAL'
    ORDER BY name ASC
  `;

  return (
    <RoleWorkspace role="manufacturing" section="bom-planning">
      <BomPlanningClient initialBoms={boms} products={products} rawMaterials={rawMaterials} />
    </RoleWorkspace>
  );
}
