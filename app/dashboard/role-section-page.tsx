import { notFound } from "next/navigation";
import { getRolePageFromDB } from "@/lib/role-queries";
import { type RoleKey } from "./role-data";
import { RoleWorkspace } from "./role-workspace";
import { requireRole } from "@/lib/auth/auth";

type RoleSectionPageProps = {
  role: RoleKey;
  params: Promise<{ section: string }>;
};

export async function RoleSectionPage({ role, params }: RoleSectionPageProps) {
  // Server-side role check — unauthenticated or wrong role will be redirected
  await requireRole(role);

  const { section } = await params;

  if (!(await getRolePageFromDB(role, section))) {
    notFound();
  }

  return <RoleWorkspace role={role} section={section} />;
}

