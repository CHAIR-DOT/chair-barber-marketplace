import { Suspense } from "react";
import { translate } from "@/i18n/translate";
import Loading from "@/app/loading";
import DiscoveryQuery from "./query-client";
export const metadata = { title: translate("ka", "metadata.discover") };
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <DiscoveryQuery />
    </Suspense>
  );
}
