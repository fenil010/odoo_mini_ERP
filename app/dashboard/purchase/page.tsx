import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "../role-workspace";

export default async function PurchasePage() {
  await requireRole("purchase");
  return <RoleWorkspace role="purchase" />;
}
