"use client";
import { useI18n } from "@/i18n/provider";
import Link from "next/link";
import { Scissors } from "lucide-react";
export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="container not-found">
      <Scissors size={35} />
      <div className="eyebrow">{t("errors.notFoundEyebrow")}</div>
      <h1>{t("errors.notFoundTitle")}</h1>
      <p>{t("errors.notFound")}</p>
      <Link className="button button-dark" href="/discover">
        {t("common.backDiscovery")}
      </Link>
    </div>
  );
}
