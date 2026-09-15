import { AboutPreview } from "@/components/about-preview";
import { translate } from "@/i18n/translate";
export const metadata = { title: translate("ka", "metadata.about") };
export default function Page() {
  return <AboutPreview />;
}
