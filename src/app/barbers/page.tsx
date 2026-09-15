import { translate } from "@/i18n/translate";
import { Discovery } from "@/components/discovery";
export const metadata = { title: translate("ka", "metadata.barbers") };
export default function Page() {
  return <Discovery mode="barbers" />;
}
