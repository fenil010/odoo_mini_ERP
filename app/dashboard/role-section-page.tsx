import { notFound } from "next/navigation";
import { getRolePage, type RoleKey } from "./role-data";
import { RoleWorkspace } from "./role-workspace";

type RoleSectionPageProps = {
  role: RoleKey;
  params: Promise<{ section: string }>;
};

export async function RoleSectionPage({ role, params }: RoleSectionPageProps) {
  const { section } = await params;

  if (!getRolePage(role, section)) {
    notFound();
  }

  return <RoleWorkspace role={role} section={section} />;
}
