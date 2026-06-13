import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "../role-workspace";

export default async function AdminPage() {
  await requireRole("admin");
  return <RoleWorkspace role="admin" />;
}
