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
  return { title: `Barber ${(await params).section}` };
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
