import { notFound } from "next/navigation";
import { styles } from "@/lib/data";
import { StylePage } from "@/components/style-page";
export const dynamicParams = false;
export function generateStaticParams() {
  return styles.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: `${styles.find((s) => s.slug === slug)?.name ?? "Haircut style"} specialists`,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const style = styles.find((s) => s.slug === slug);
  if (!style) notFound();
  return <StylePage id={style.id} />;
}
