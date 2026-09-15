import { translate } from "@/i18n/translate";
import { BookingPage, type BookingParams } from "@/components/booking-flow";
export const metadata = { title: translate("ka", "metadata.booking") };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<BookingParams>;
}) {
  return <BookingPage initial={await searchParams} />;
}
