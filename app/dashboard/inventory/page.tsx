import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "../role-workspace";

export default async function InventoryPage() {
  await requireRole("inventory");
  return <RoleWorkspace role="inventory" />;
}
