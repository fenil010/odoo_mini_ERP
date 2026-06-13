import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "../role-workspace";

export default async function ManufacturingPage() {
  await requireRole("manufacturing");
  return <RoleWorkspace role="manufacturing" />;
}
