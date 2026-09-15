import { translate } from "@/i18n/translate";
import { AccountPage } from "@/components/account";
export const metadata = { title: translate("ka", "metadata.account") };
export default function Page() {
  return <AccountPage />;
}
