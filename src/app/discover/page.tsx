import { Discovery, type DiscoveryParams } from "@/components/discovery";
export const metadata = { title: "Discover barbers in Tbilisi" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<DiscoveryParams>;
}) {
  return <Discovery initial={await searchParams} />;
}
