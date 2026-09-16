"use client";

import { useSearchParams } from "next/navigation";
import { Discovery } from "@/components/discovery";

export default function DiscoveryQuery() {
  const searchParams = useSearchParams();
  return (
    <Discovery
      initial={{
        location: searchParams.get("location") ?? undefined,
        service: searchParams.get("service") ?? undefined,
        date: searchParams.get("date") ?? undefined,
        style: searchParams.get("style") ?? undefined,
        availability: searchParams.get("availability") ?? undefined,
        q: searchParams.get("q") ?? undefined,
        filters: searchParams.get("filters") ?? undefined,
      }}
    />
  );
}
