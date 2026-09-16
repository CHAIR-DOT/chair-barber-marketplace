"use client";

import { useSearchParams } from "next/navigation";
import { BookingPage } from "@/components/booking-flow";

export default function BookingQuery() {
  const searchParams = useSearchParams();
  return (
    <BookingPage
      initial={{
        shop: searchParams.get("shop") ?? undefined,
        barber: searchParams.get("barber") ?? undefined,
        service: searchParams.get("service") ?? undefined,
        reschedule: searchParams.get("reschedule") ?? undefined,
      }}
    />
  );
}
