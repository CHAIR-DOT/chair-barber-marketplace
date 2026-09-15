import { notFound } from "next/navigation";
import { shops } from "@/lib/data";
import { ShopProfile } from "@/components/profiles";
export const dynamicParams = false;
export function generateStaticParams() {
  return shops.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: shops.find((s) => s.slug === slug)?.name ?? "Shop not found",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = shops.find((s) => s.slug === slug);
  if (!shop) notFound();
  return <ShopProfile id={shop.id} />;
}
