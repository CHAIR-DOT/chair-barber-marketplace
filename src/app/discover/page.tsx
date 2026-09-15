import { translate } from "@/i18n/translate";
import { Discovery, type DiscoveryParams } from "@/components/discovery";
export const metadata = { title: translate("ka", "metadata.discover") };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<DiscoveryParams>;
}) {
  return <Discovery initial={await searchParams} />;
}
