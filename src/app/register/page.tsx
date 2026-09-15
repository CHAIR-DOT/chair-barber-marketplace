import { translate } from "@/i18n/translate";
import { AuthPage } from "@/components/auth";
export const metadata = { title: translate("ka", "metadata.register") };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  return <AuthPage register initialRole={(await searchParams).role} />;
}
