import { getRoleSections } from "../../role-data";
import { RoleSectionPage } from "../../role-section-page";

export function generateStaticParams() {
  return getRoleSections("purchase").map((section) => ({ section }));
}

export default function PurchaseSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return <RoleSectionPage role="purchase" params={params} />;
}
