import { getRoleSections } from "../../role-data";
import { RoleSectionPage } from "../../role-section-page";

export function generateStaticParams() {
  return getRoleSections("owner").map((section) => ({ section }));
}

export default function OwnerSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return <RoleSectionPage role="owner" params={params} />;
}
