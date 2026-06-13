import { getRoleSectionsFromDB } from "@/lib/role-queries";
import { RoleSectionPage } from "../../role-section-page";

export async function generateStaticParams() {
  return (await getRoleSectionsFromDB("sales")).map((section) => ({ section }));
}

export default function SalesSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return <RoleSectionPage role="sales" params={params} />;
}
