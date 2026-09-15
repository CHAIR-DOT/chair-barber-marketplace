"use client";
import { useState } from "react";
import Link from "next/link";
import { GitCompareArrows, X } from "lucide-react";
import { useMock } from "./provider";
import { Modal, Rating } from "./ui";
import { shops, styles } from "@/lib/data";
import { getPrice, ratingFor } from "@/lib/booking";
import { money } from "@/lib/dates";
import { NextSlot } from "./cards";
export function CompareDock() {
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
              aria-label={`Remove ${b.name} from comparison`}
            >
              <img src={b.image} alt={b.name} />
              <X size={12} />
            </button>
          ))}
        </div>
        <span>
          {compare.length} / 3{" "}
          <span className="hide-mobile">barbers selected</span>
        </span>
        <button
          disabled={compare.length < 2}
          className="button button-dark"
          onClick={() => setOpen(true)}
        >
          Compare
        </button>
        <button
          className="icon-button"
          onClick={clearCompare}
          aria-label="Clear comparison"
        >
          <X size={18} />
        </button>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Find your kind of barber"
        wide
      >
        <p className="muted small-text">
          A little side-by-side clarity for your next haircut.
        </p>
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
                  <dt>Experience</dt>
                  <dd>{b.experience} years</dd>
                  <dt>Haircut from</dt>
                  <dd>{money(getPrice(b, "haircut", state))}</dd>
                  <dt>Best at</dt>
                  <dd>
                    {b.styleIds
                      .map((id) => styles.find((s) => s.id === id)?.name)
                      .join(", ")}
                  </dd>
                  <dt>Location</dt>
                  <dd>
                    {shop.name}
                    <br />
                    {shop.neighborhood}
                  </dd>
                  <dt>Next available</dt>
                  <dd>
                    <NextSlot barberId={b.id} />
                  </dd>
                </dl>
                <Link
                  href={`/booking?barber=${b.id}&shop=${b.shopId}`}
                  onClick={() => setOpen(false)}
                  className="button button-dark"
                >
                  Book {b.name.split(" ")[0]}
                </Link>
                <Link
                  href={`/barbers/${b.slug}`}
                  onClick={() => setOpen(false)}
                  className="text-link"
                >
                  View profile
                </Link>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
