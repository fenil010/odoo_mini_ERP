import { sql } from "./lib/db";

async function main() {
  const allLogs = await sql`SELECT id, entity_type, action FROM audit_logs ORDER BY id DESC`;
  console.log("Total logs in database:", allLogs.length);
  console.log("Unique entity types:", [...new Set(allLogs.map(l => l.entity_type))]);
  console.log("First 15 logs:");
  console.log(allLogs.slice(0, 15));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
