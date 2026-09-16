"use client";

import { useSearchParams } from "next/navigation";
import { AuthPage } from "@/components/auth";

export default function RegisterQuery() {
  const searchParams = useSearchParams();
  return (
    <AuthPage register initialRole={searchParams.get("role") ?? undefined} />
  );
}
