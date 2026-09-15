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
  return { title: `My ${(await params).section}` };
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
