import { getRoleSections } from "../../role-data";
import { RoleSectionPage } from "../../role-section-page";

export function generateStaticParams() {
  return getRoleSections("inventory").map((section) => ({ section }));
}

export default function InventorySectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return <RoleSectionPage role="inventory" params={params} />;
}
