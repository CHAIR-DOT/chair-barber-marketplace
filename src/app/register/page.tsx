import { Suspense } from "react";
import { translate } from "@/i18n/translate";
import Loading from "@/app/loading";
import RegisterQuery from "./query-client";
export const metadata = { title: translate("ka", "metadata.register") };
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <RegisterQuery />
    </Suspense>
  );
}
