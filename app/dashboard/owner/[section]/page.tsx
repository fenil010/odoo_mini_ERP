import { getRoleSectionsFromDB } from "@/lib/role-queries";
import { RoleSectionPage } from "../../role-section-page";

export async function generateStaticParams() {
  return (await getRoleSectionsFromDB("owner")).map((section) => ({ section }));
}

export default function OwnerSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return <RoleSectionPage role="owner" params={params} />;
}
