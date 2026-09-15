"use client";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { ArrowUpRight } from "lucide-react";
import { useMock } from "./provider";
import { BarberCard, StyleCard } from "./cards";
import { BackLink, FavoriteButton, PageHeader } from "./ui";
import { styles } from "@/lib/data";
export function StylePage({ id }: { id?: string }) {
  const { t, styleName, styleDescription } = useI18n();
  const { state } = useMock(),
    style = styles.find((s) => s.id === id);
  if (!style)
    return (
      <div className="container page-section">
        <PageHeader
          eyebrow={t("styles.eyebrow")}
          title={t("styles.title")}
          description={t("styles.description")}
        />
        <div className="all-styles-grid">
          {styles.map((s) => (
            <StyleCard style={s} key={s.id} />
          ))}
        </div>
      </div>
    );
  const barbers = state.barbers.filter((b) => b.styleIds.includes(style.id));
  return (
    <div className="container page-section">
      <BackLink href="/styles">{t("styles.allStyles")}</BackLink>
      <div className="style-detail-hero">
        <div>
          <div className="eyebrow">{t("styles.guide")}</div>
          <h1>
            {styleName(style)}
            <span className="accent">.</span>
          </h1>
          <p>
            {styleDescription(style)} {t("styles.detailDescription")}
          </p>
          <div className="inline-actions">
            <Link
              href={`/discover?style=${style.id}`}
              className="button button-dark"
            >
              {t("styles.findSpecialist")} <ArrowUpRight size={17} />
            </Link>
            <div className="relative">
              <FavoriteButton
                type="style"
                id={style.id}
                label={styleName(style)}
              />
            </div>
          </div>
        </div>
        <img
          src={style.image}
          alt={t("styles.imageAlt", { name: styleName(style) })}
        />
      </div>
      <div className="section-heading">
        <div>
          <h2>{t("styles.bestBarbers", { name: styleName(style) })}</h2>
          <p>{t("styles.specialistCount", { count: barbers.length })}</p>
        </div>
      </div>
      <div className="barber-grid">
        {barbers.map((b) => (
          <BarberCard key={b.id} barber={b} />
        ))}
      </div>
    </div>
  );
}
