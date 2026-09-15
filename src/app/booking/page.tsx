import { BookingPage, type BookingParams } from "@/components/booking-flow";
export const metadata = { title: "Book your chair" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<BookingParams>;
}) {
  return <BookingPage initial={await searchParams} />;
}
