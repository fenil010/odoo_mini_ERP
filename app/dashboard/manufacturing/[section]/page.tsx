import { getRoleSections } from "../../role-data";
import { RoleSectionPage } from "../../role-section-page";

export function generateStaticParams() {
  return getRoleSections("manufacturing").map((section) => ({ section }));
}

export default function ManufacturingSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return <RoleSectionPage role="manufacturing" params={params} />;
}
