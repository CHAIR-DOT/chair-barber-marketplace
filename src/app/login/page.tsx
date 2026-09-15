import { translate } from "@/i18n/translate";
import { AuthPage } from "@/components/auth";
export const metadata = { title: translate("ka", "metadata.login") };
export default function Page() {
  return <AuthPage />;
}
