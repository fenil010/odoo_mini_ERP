import { getRoleSectionsFromDB } from "@/lib/role-queries";
import { RoleSectionPage } from "../../role-section-page";

export async function generateStaticParams() {
  return (await getRoleSectionsFromDB("purchase")).map((section) => ({ section }));
}

export default function PurchaseSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return <RoleSectionPage role="purchase" params={params} />;
}
