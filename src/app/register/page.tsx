import { AuthPage } from "@/components/auth";
export const metadata = { title: "Create an account" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  return <AuthPage register initialRole={(await searchParams).role} />;
}
