import { getRoleSections } from "../../role-data";
import { RoleSectionPage } from "../../role-section-page";

export function generateStaticParams() {
  return getRoleSections("admin").map((section) => ({ section }));
}

export default function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return <RoleSectionPage role="admin" params={params} />;
}
