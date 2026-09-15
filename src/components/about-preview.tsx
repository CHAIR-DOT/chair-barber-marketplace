"use client";
import Link from "next/link";
import { ResetDemo } from "./reset-demo";
import { useI18n } from "@/i18n/provider";
export function AboutPreview() {
  const { t } = useI18n();
  return (
    <div className="container about-preview">
      <div className="eyebrow">{t("about.eyebrow")}</div>
      <h1>{t("about.title")}</h1>
      <p>{t("about.intro")}</p>
      <h2>{t("about.peopleTitle")}</h2>
      <p>{t("about.people")}</p>
      <h2>{t("about.exploreTitle")}</h2>
      <p>{t("about.explore")}</p>
      <h2>{t("about.localTitle")}</h2>
      <p>{t("about.local")}</p>
      <div className="inline-actions">
        <Link href="/discover" className="button button-dark">
          {t("about.exploreButton")}
        </Link>
        <Link href="/barber/dashboard" className="button button-outline">
          {t("about.workspaceButton")}
        </Link>
        <ResetDemo />
      </div>
    </div>
  );
}
