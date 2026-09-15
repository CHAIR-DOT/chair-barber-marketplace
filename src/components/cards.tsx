"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  GitCompareArrows,
  MapPin,
} from "lucide-react";
import { shops, styles } from "@/lib/data";
import { getPrice, nextAvailable, ratingFor } from "@/lib/booking";
import {
  relativeDate,
  money,
  currentMinutes,
  minutes,
  today,
} from "@/lib/dates";
import type { Barber, BarberShop, HaircutStyle } from "@/lib/types";
import { useMock } from "./provider";
import { Badge, FavoriteButton, Rating } from "./ui";
export function NextSlot({ barberId }: { barberId: string }) {
  const { state } = useMock(),
    next = nextAvailable(state, barberId);
  return (
    <span className="availability">
      <i />
      {next
        ? `${relativeDate(next.date)}, ${next.time}`
        : "Schedule opening soon"}
    </span>
  );
}
export function ShopCard({ shop }: { shop: BarberShop }) {
  const { state } = useMock(),
    team = state.barbers.filter((b) => b.shopId === shop.id),
    rs = state.reviews.filter((r) => team.some((b) => b.id === r.barberId)),
    rating = rs.length ? rs.reduce((a, r) => a + r.rating, 0) / rs.length : 0;
  const open =
    !shop.closedDays.includes(new Date(`${today()}T12:00:00Z`).getUTCDay()) &&
    currentMinutes() >= minutes(shop.openingTime) &&
    currentMinutes() < minutes(shop.closingTime);
  const upcoming = team
    .map((b) => ({ b, next: nextAvailable(state, b.id) }))
    .filter((x) => x.next)
    .sort((a, b) =>
      `${a.next!.date}${a.next!.time}`.localeCompare(
        `${b.next!.date}${b.next!.time}`,
      ),
    )[0];
  return (
    <article className="shop-card">
      <div className="card-image">
        <Link href={`/shops/${shop.slug}`} aria-label={`Explore ${shop.name}`}>
          <img
            src={shop.image}
            alt={`${shop.name}, illustrative barbershop interior`}
            loading="lazy"
          />
        </Link>
        {shop.featured && (
          <span className="image-badge">THE NEIGHBORHOOD EDIT</span>
        )}
        <FavoriteButton type="shop" id={shop.id} label={shop.name} />
      </div>
      <div className="card-title">
        <Link href={`/shops/${shop.slug}`}>
          <h3>{shop.name}</h3>
        </Link>
        <Rating value={rating} count={rs.length} />
      </div>
      <p className="card-location">
        <MapPin size={13} />
        {shop.neighborhood}, Tbilisi <span>· {shop.distance} km</span>
      </p>
      <div className="shop-preview">
        <div className="avatar-stack">
          {team.slice(0, 3).map((b) => (
            <Link href={`/barbers/${b.slug}`} key={b.id} title={b.name}>
              <img src={b.image} alt={b.name} />
            </Link>
          ))}
        </div>
        <span>{team.length} talented barbers</span>
        <span className={`open-label ${open ? "is-open" : ""}`}>
          {open ? "Open now" : "Closed now"}
        </span>
      </div>
      <div className="card-bottom">
        <span className="availability">
          <i />
          {upcoming
            ? `${relativeDate(upcoming.next!.date)}, ${upcoming.next!.time}`
            : "No times available"}
        </span>
        <span className="from-price">
          From{" "}
          <strong>
            {money(Math.min(...team.map((b) => getPrice(b, "haircut", state))))}
          </strong>
        </span>
      </div>
    </article>
  );
}
export function BarberCard({
  barber,
  compact = false,
}: {
  barber: Barber;
  compact?: boolean;
}) {
  const { state, compare, toggleCompare } = useMock(),
    shop = shops.find((s) => s.id === barber.shopId)!,
    r = ratingFor(barber.id, state.reviews);
  return (
    <article className={`barber-card ${compact ? "compact" : ""}`}>
      <div className="barber-image">
        <Link
          href={`/barbers/${barber.slug}`}
          aria-label={`View ${barber.name}`}
        >
          <img
            src={barber.image}
            alt={`${barber.name}, illustrative barber portrait`}
            loading="lazy"
          />
        </Link>
        <FavoriteButton type="barber" id={barber.id} label={barber.name} />
        <span className="barber-image-badge">
          {!r.count
            ? "NEW TALENT"
            : r.value >= 4.9
              ? "TOP RATED"
              : "THE CRAFT EDIT"}
        </span>
      </div>
      <div className="barber-card-content">
        <div className="card-title">
          <Link href={`/barbers/${barber.slug}`}>
            <h3>
              {barber.name.split(" ")[0]} {barber.name.split(" ")[1]?.[0] ?? ""}
              {barber.name.split(" ")[1] ? "." : ""}
            </h3>
          </Link>
          {barber.verified && (
            <BadgeCheck
              className="verified-icon"
              size={17}
              aria-label="Demo verified barber"
            />
          )}
          <Rating value={r.value} count={r.count} />
        </div>
        <Link href={`/shops/${shop.slug}`} className="barber-shop">
          {shop.name} · {shop.neighborhood}
        </Link>
        <div className="barber-experience">
          {barber.experience} years experience{" "}
          <span>· {barber.completedCuts.toLocaleString("en-GB")} cuts</span>
        </div>
        <div className="tags">
          {barber.styleIds.slice(0, 3).map((id) => (
            <Link className="tag" key={id} href={`/styles/${id}`}>
              {styles.find((s) => s.id === id)?.name}
            </Link>
          ))}
        </div>
        <div className="barber-card-meta">
          <NextSlot barberId={barber.id} />
          <span className="from-price">
            From <strong>{money(getPrice(barber, "haircut", state))}</strong>
          </span>
        </div>
        <div className="barber-card-actions">
          <Link href={`/barbers/${barber.slug}`} className="text-link">
            Meet your barber <ArrowUpRight size={16} />
          </Link>
          <button
            className={`compare-toggle ${compare.includes(barber.id) ? "selected" : ""}`}
            aria-pressed={compare.includes(barber.id)}
            aria-label={`Compare ${barber.name}`}
            onClick={() => toggleCompare(barber.id)}
          >
            <GitCompareArrows size={15} />
            <span>Compare</span>
          </button>
        </div>
      </div>
    </article>
  );
}
export function StyleCard({ style }: { style: HaircutStyle }) {
  const { state } = useMock();
  return (
    <article className="style-card">
      <div className="style-image">
        <Link
          href={`/styles/${style.slug}`}
          aria-label={`Browse ${style.name} specialists`}
        >
          <img
            src={style.image}
            alt={`${style.name} inspiration, illustrative haircut`}
            loading="lazy"
          />
        </Link>
        <FavoriteButton type="style" id={style.id} label={style.name} />
      </div>
      <Link href={`/styles/${style.slug}`}>
        <h3>
          {style.name}
          <ArrowUpRight size={15} />
        </h3>
        <span>
          {state.barbers.filter((b) => b.styleIds.includes(style.id)).length}{" "}
          specialists
        </span>
      </Link>
    </article>
  );
}
