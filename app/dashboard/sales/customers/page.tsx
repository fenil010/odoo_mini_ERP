import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "@/app/dashboard/role-workspace";
import { sql } from "@/lib/db";
import CustomersClient from "./customers-client";

export default async function SalesCustomersPage() {
  await requireRole("sales");

  const customers = await sql<any[]>`
    SELECT id, name, email, phone
    FROM customers
    ORDER BY name ASC
  `;

  return (
    <RoleWorkspace role="sales" section="customers">
      <CustomersClient initialCustomers={customers} />
    </RoleWorkspace>
  );
}
