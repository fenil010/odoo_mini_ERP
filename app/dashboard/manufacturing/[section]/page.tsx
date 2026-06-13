import { getRoleSectionsFromDB } from "@/lib/role-queries";
import { RoleSectionPage } from "../../role-section-page";

export async function generateStaticParams() {
  const sections = await getRoleSectionsFromDB("manufacturing");
  return sections.map((section) => ({ section }));
}

export default function ManufacturingSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return <RoleSectionPage role="manufacturing" params={params} />;
}
