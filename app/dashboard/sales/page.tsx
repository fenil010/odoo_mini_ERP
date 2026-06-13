import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "../role-workspace";

export default async function SalesPage() {
  await requireRole("sales");
  return <RoleWorkspace role="sales" />;
}
