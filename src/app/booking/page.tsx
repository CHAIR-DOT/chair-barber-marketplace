import { Suspense } from "react";
import { translate } from "@/i18n/translate";
import Loading from "@/app/loading";
import BookingQuery from "./query-client";
export const metadata = { title: translate("ka", "metadata.booking") };
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <BookingQuery />
    </Suspense>
  );
}
