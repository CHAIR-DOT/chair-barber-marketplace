"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import { styles } from "@/lib/data";
import type { PortfolioItem } from "@/lib/types";
import { EmptyState, Modal } from "./ui";
export function PortfolioGallery({
  items,
  barberName,
}: {
  items: PortfolioItem[];
  barberName: string;
}) {
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
          All work <span>{items.length}</span>
        </button>
        {tags.map((t) => (
          <button
            key={t.id}
            className={filter === t.id ? "active" : ""}
            onClick={() => setFilter(t.id)}
          >
            {t.name}
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
              aria-label={`View ${i.title} by ${barberName}`}
            >
              <img
                src={i.image}
                alt={`${i.title} inspiration — illustrative stock photograph`}
                loading="lazy"
              />
              <span className="portfolio-caption">
                {i.title}
                <Maximize2 size={15} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          title="A fresh portfolio is on its way"
          text="This barber is getting their best work ready. Explore their services or meet another specialist."
        />
      )}
      <p className="gallery-disclaimer">
        Portfolio preview · Stock images illustrate the experience; they are not
        this fictional barber’s actual work.
      </p>
      <Modal
        open={!!current}
        onClose={() => setSelected(null)}
        title={current?.title ?? "Portfolio"}
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
            <img src={current.image} alt={current.title} />
            <div className="lightbox-footer">
              <div>
                <strong>{current.title}</strong>
                <p>{current.description}</p>
                <span>Portfolio concept for {barberName}</span>
              </div>
              <div className="inline-actions">
                <button
                  className="icon-button"
                  aria-label="Previous image"
                  onClick={() => move(-1)}
                >
                  <ArrowLeft size={18} />
                </button>
                <span>
                  {index + 1} / {filtered.length}
                </span>
                <button
                  className="icon-button"
                  aria-label="Next image"
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
