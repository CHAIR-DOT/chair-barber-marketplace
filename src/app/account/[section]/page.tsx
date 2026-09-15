import { translate } from "@/i18n/translate";
import { notFound } from "next/navigation";
import { AccountPage } from "@/components/account";
export const dynamicParams = false;
export function generateStaticParams() {
  return ["appointments", "favorites", "reviews", "settings"].map(
    (section) => ({ section }),
  );
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const valid = ["appointments", "favorites", "reviews", "settings"].includes(
    section,
  );
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
  if (!["appointments", "favorites", "reviews", "settings"].includes(section))
    notFound();
  return <AccountPage section={section} />;
}
