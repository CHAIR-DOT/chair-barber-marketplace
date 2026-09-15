import { createDisplay } from "@/i18n/display";
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
  const style = styles.find((s) => s.slug === slug);
  const { t, styleName } = createDisplay("ka");
  return {
    title: style
      ? t("metadata.style", { style: styleName(style) })
      : t("metadata.notFound"),
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
