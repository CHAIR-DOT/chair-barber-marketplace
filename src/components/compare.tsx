"use client";
import { useState } from "react";
import Link from "next/link";
import { GitCompareArrows, X } from "lucide-react";
import { useMock } from "./provider";
import { Modal, Rating } from "./ui";
import { shops, styles } from "@/lib/data";
import { getPrice, ratingFor } from "@/lib/booking";
import { useI18n } from "@/i18n/provider";
import { NextSlot } from "./cards";
export function CompareDock() {
  const { t, money, number, styleName, label } = useI18n();
  const { state, compare, clearCompare, toggleCompare } = useMock(),
    [open, setOpen] = useState(false),
    barbers = state.barbers.filter((b) => compare.includes(b.id));
  if (!barbers.length) return null;
  return (
    <>
      <div className="compare-dock">
        <GitCompareArrows size={20} />
        <div className="compare-avatars">
          {barbers.map((b) => (
            <button
              key={b.id}
              onClick={() => toggleCompare(b.id)}
              aria-label={t("compare.remove", { name: b.name })}
            >
              <img src={b.image} alt={b.name} />
              <X size={12} />
            </button>
          ))}
        </div>
        <span>
          {number(compare.length)} / {number(3)}{" "}
          <span className="hide-mobile">{t("compare.selected")}</span>
        </span>
        <button
          disabled={compare.length < 2}
          className="button button-dark"
          onClick={() => setOpen(true)}
        >
          {t("compare.compare")}
        </button>
        <button
          className="icon-button"
          onClick={clearCompare}
          aria-label={t("compare.clear")}
        >
          <X size={18} />
        </button>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("compare.title")}
        wide
      >
        <p className="muted small-text">{t("compare.description")}</p>
        <div
          className="compare-grid"
          style={{
            gridTemplateColumns: `repeat(${barbers.length}, minmax(0, 1fr))`,
          }}
        >
          {barbers.map((b) => {
            const rating = ratingFor(b.id, state.reviews),
              shop = shops.find((s) => s.id === b.shopId)!;
            return (
              <div key={b.id} className="compare-column">
                <img src={b.image} alt={b.name} />
                <h3>{b.name}</h3>
                <Rating value={rating.value} count={rating.count} />
                <dl>
                  <dt>{t("compare.experience")}</dt>
                  <dd>{t("compare.years", { count: b.experience })}</dd>
                  <dt>{t("compare.haircutFrom")}</dt>
                  <dd>{money(getPrice(b, "haircut", state))}</dd>
                  <dt>{t("compare.bestAt")}</dt>
                  <dd>
                    {b.styleIds
                      .map((id) => {
                        const style = styles.find((s) => s.id === id);
                        return style ? styleName(style) : "";
                      })
                      .join(", ")}
                  </dd>
                  <dt>{t("compare.location")}</dt>
                  <dd>
                    {shop.name}
                    <br />
                    {label(shop.neighborhood)}
                  </dd>
                  <dt>{t("compare.nextAvailable")}</dt>
                  <dd>
                    <NextSlot barberId={b.id} />
                  </dd>
                </dl>
                <Link
                  href={`/booking?barber=${b.id}&shop=${b.shopId}`}
                  onClick={() => setOpen(false)}
                  className="button button-dark"
                >
                  {t("compare.book", { name: b.name.split(" ")[0] })}
                </Link>
                <Link
                  href={`/barbers/${b.slug}`}
                  onClick={() => setOpen(false)}
                  className="text-link"
                >
                  {t("compare.viewProfile")}
                </Link>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
