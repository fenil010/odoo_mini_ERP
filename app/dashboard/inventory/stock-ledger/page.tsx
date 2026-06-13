import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "@/app/dashboard/role-workspace";
import { sql } from "@/lib/db";
import StockLedgerClient from "./stock-ledger-client";

export default async function StockLedgerPage() {
  await requireRole("inventory");

  const ledger = await sql<any[]>`
    SELECT 
      sl.id,
      sl.movement_type,
      sl.quantity,
      sl.reference_type,
      sl.reference_id,
      sl.notes,
      sl.created_at,
      p.name as product_name,
      p.sku
    FROM stock_ledger sl
    JOIN products p ON p.id = sl.product_id
    ORDER BY sl.created_at DESC
  `;

  return (
    <RoleWorkspace role="inventory" section="stock-ledger">
      <StockLedgerClient initialLedger={ledger} />
    </RoleWorkspace>
  );
}
