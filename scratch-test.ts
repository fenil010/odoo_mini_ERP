import { getNavbarData } from "./lib/dashboard-data";

async function main() {
  console.log("=== SALES NOTIFICATIONS ===");
  const sales = await getNavbarData("sales");
  console.log(sales.notifications.map(n => ({ id: n.id, title: n.title, desc: n.desc })));

  console.log("\n=== PURCHASE NOTIFICATIONS ===");
  const purchase = await getNavbarData("purchase");
  console.log(purchase.notifications.map(n => ({ id: n.id, title: n.title, desc: n.desc })));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
