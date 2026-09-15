import { translate } from "@/i18n/translate";
import { notFound } from "next/navigation";
import { BarberWorkspace } from "@/components/barber-workspace";
export const dynamicParams = false;
export function generateStaticParams() {
  return ["dashboard", "profile", "portfolio", "services", "schedule"].map(
    (section) => ({ section }),
  );
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const valid = [
    "dashboard",
    "profile",
    "portfolio",
    "services",
    "schedule",
  ].includes(section);
  return {
    title: translate("ka", valid ? `metadata.${section}` : "metadata.notFound"),
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (
    !["dashboard", "profile", "portfolio", "services", "schedule"].includes(
      section,
    )
  )
    notFound();
  return <BarberWorkspace section={section} />;
}
