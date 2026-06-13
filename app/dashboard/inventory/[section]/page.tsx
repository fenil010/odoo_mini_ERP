import { getRoleSectionsFromDB } from "@/lib/role-queries";
import { RoleSectionPage } from "../../role-section-page";

export async function generateStaticParams() {
  return (await getRoleSectionsFromDB("inventory")).map((section) => ({ section }));
}

export default function InventorySectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return <RoleSectionPage role="inventory" params={params} />;
}
