import { getRoleSectionsFromDB } from "@/lib/role-queries";
import { RoleSectionPage } from "../../role-section-page";

export async function generateStaticParams() {
  const sections = await getRoleSectionsFromDB("admin");
  return sections.map((section) => ({ section }));
}

export default function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return <RoleSectionPage role="admin" params={params} />;
}
