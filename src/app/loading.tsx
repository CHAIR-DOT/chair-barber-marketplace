"use client";
import { useI18n } from "@/i18n/provider";
import { SkeletonCard } from "@/components/ui";
export default function Loading() {
  const { t } = useI18n();
  return (
    <div className="container page-section" role="status" aria-live="polite">
      <div className="page-heading">
        <h1>{t("common.finding")}</h1>
      </div>
      <div className="barber-grid">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <span className="sr-only">{t("common.loadingPage")}</span>
    </div>
  );
}
