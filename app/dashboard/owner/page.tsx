import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "../role-workspace";

export default async function OwnerPage() {
  await requireRole("owner");
  return <RoleWorkspace role="owner" />;
}
