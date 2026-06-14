import { sql } from "./lib/db";

async function main() {
  const products = await sql`
    SELECT id, name, sku, cost_price, sale_price 
    FROM products
  `;

  console.log(`Found ${products.length} products to update.`);

  await sql.begin(async (tx) => {
    for (const p of products) {
      const cost = Number(p.cost_price);
      const sale = Number(p.sale_price);
      const margin = sale - cost;

      if (margin <= 0) {
        console.log(`Skipping ${p.name} (SKU: ${p.sku}) because margin is <= 0 (${margin})`);
        continue;
      }

      // Calculate charge as 15% of the margin, minimum 1.00
      // For very small margins (e.g. <= 5.00), we ensure total charges don't exceed the margin
      let charge = Math.round((margin * 0.15) * 100) / 100;
      if (charge < 1.00) {
        charge = 1.00;
      }
      
      // Safety check: if 4 * charge >= margin, scale charge down to fit margin with at least 1.00 profit left
      if (charge * 4 >= margin) {
        charge = Math.floor(((margin - 1.00) / 4) * 100) / 100;
      }

      // Final safety check: ensure charge is not negative
      if (charge < 0.01) {
        charge = 0.01;
      }

      console.log(`Updating ${p.name} (SKU: ${p.sku}) - Sale: ${sale}, Cost: ${cost}, Margin: ${margin} -> Setting charges to ${charge} each (Total: ${charge * 4})`);

      await tx`
        UPDATE products
        SET shipping_charge = ${charge},
            packing_charge = ${charge},
            manufacturing_charge = ${charge},
            other_charge = ${charge}
        WHERE id = ${p.id}
      `;
    }
  });

  const updatedProducts = await sql`
    SELECT id, name, sku, cost_price, sale_price, shipping_charge, packing_charge, manufacturing_charge, other_charge,
           (sale_price - (cost_price + shipping_charge + packing_charge + manufacturing_charge + other_charge))::float as net_profit
    FROM products
    ORDER BY name ASC
  `;

  console.log("UPDATED PRODUCTS DATA:", JSON.stringify(updatedProducts, null, 2));
  process.exit(0);
}

main().catch(console.error);
