import { translate } from "@/i18n/translate";
import { notFound } from "next/navigation";
import { barbers } from "@/lib/data";
import { BarberProfile } from "@/components/profiles";
export const dynamicParams = false;
export function generateStaticParams() {
  return barbers.map((b) => ({ slug: b.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title:
      barbers.find((b) => b.slug === slug)?.name ??
      translate("ka", "metadata.notFound"),
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const barber = barbers.find((b) => b.slug === slug);
  if (!barber) notFound();
  return <BarberProfile id={barber.id} />;
}
