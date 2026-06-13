import { sql } from "./lib/db";
async function main() {
  const products = await sql`SELECT id, name, sku, procurement_type, product_type FROM products`;
  console.log("PRODUCTS:", products);
  const boms = await sql`SELECT b.id as bom_id, p.name as product, bi.quantity, p_comp.name as component FROM boms b JOIN products p ON p.id = b.product_id JOIN bom_items bi ON bi.bom_id = b.id JOIN products p_comp ON p_comp.id = bi.component_product_id`;
  console.log("BOM ITEMS:", boms);
  process.exit(0);
}
main().catch(console.error);
