"use client";
import { useI18n } from "@/i18n/provider";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="container not-found" role="alert">
      <div className="eyebrow">{t("errors.eyebrow")}</div>
      <h1>{t("errors.title")}</h1>
      <p>{t("errors.page")}</p>
      <div className="inline-actions">
        <button className="button button-dark" onClick={reset}>
          {t("errors.retry")}
        </button>
        <Link className="button button-outline" href="/">
          {t("errors.home")}
        </Link>
      </div>
    </div>
  );
}
