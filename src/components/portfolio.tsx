"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import { styles } from "@/lib/data";
import type { PortfolioItem } from "@/lib/types";
import { EmptyState, Modal } from "./ui";
import { useI18n } from "@/i18n/provider";
export function PortfolioGallery({
  items,
  barberName,
}: {
  items: PortfolioItem[];
  barberName: string;
}) {
  const { t, number, styleName, portfolioDescription, portfolioTitle } =
    useI18n();
  const [filter, setFilter] = useState("all"),
    [selected, setSelected] = useState<string | null>(null),
    tags = styles.filter((s) => items.some((i) => i.styleIds.includes(s.id))),
    filtered =
      filter === "all"
        ? items
        : items.filter((i) => i.styleIds.includes(filter)),
    index = filtered.findIndex((i) => i.id === selected),
    current = filtered[index];
  const move = (step: number) =>
    setSelected(
      filtered[(index + step + filtered.length) % filtered.length].id,
    );
  return (
    <>
      <div className="portfolio-filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          {t("portfolio.allWork")} <span>{number(items.length)}</span>
        </button>
        {tags.map((t) => (
          <button
            key={t.id}
            className={filter === t.id ? "active" : ""}
            onClick={() => setFilter(t.id)}
          >
            {styleName(t)}
          </button>
        ))}
      </div>
      {filtered.length ? (
        <div className="portfolio-grid">
          {filtered.map((i) => (
            <button
              className="portfolio-item"
              key={i.id}
              onClick={() => setSelected(i.id)}
              aria-label={t("portfolio.viewWork", {
                title: portfolioTitle(i),
                name: barberName,
              })}
            >
              <img
                src={i.image}
                alt={t("portfolio.imageAlt", { title: portfolioTitle(i) })}
                loading="lazy"
              />
              <span className="portfolio-caption">
                {portfolioTitle(i)}
                <Maximize2 size={15} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t("portfolio.emptyTitle")}
          text={t("portfolio.emptyText")}
        />
      )}
      <p className="gallery-disclaimer">{t("portfolio.notice")}</p>
      <Modal
        open={!!current}
        onClose={() => setSelected(null)}
        title={current ? portfolioTitle(current) : t("portfolio.title")}
        wide
      >
        {current && (
          <div
            className="lightbox"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") move(1);
              if (e.key === "ArrowLeft") move(-1);
            }}
          >
            <img src={current.image} alt={portfolioTitle(current)} />
            <div className="lightbox-footer">
              <div>
                <strong>{portfolioTitle(current)}</strong>
                <p>{portfolioDescription(current)}</p>
                <span>{t("portfolio.concept", { name: barberName })}</span>
              </div>
              <div className="inline-actions">
                <button
                  className="icon-button"
                  aria-label={t("portfolio.previous")}
                  onClick={() => move(-1)}
                >
                  <ArrowLeft size={18} />
                </button>
                <span>
                  {number(index + 1)} / {number(filtered.length)}
                </span>
                <button
                  className="icon-button"
                  aria-label={t("portfolio.next")}
                  onClick={() => move(1)}
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
