"use client";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { createDisplay } from "@/i18n/display";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { useMock } from "./provider";
import { BarberCard, ShopCard } from "./cards";
import { EmptyState, Modal, PageHeader } from "./ui";
import { neighborhoods, shops, SLOT_TIMES, styles } from "@/lib/data";
import {
  getPrice,
  nextAvailable,
  ratingFor,
  slotAvailable,
} from "@/lib/booking";
import { addDays, today } from "@/lib/dates";
// Search all supported languages so changing the interface language preserves results.
const searchDisplays = SUPPORTED_LOCALES.map(createDisplay);

export interface DiscoveryParams {
  location?: string;
  service?: string;
  date?: string;
  style?: string;
  availability?: string;
  q?: string;
}
export function Discovery({
  initial = {},
  mode = "barbers",
}: {
  initial?: DiscoveryParams;
  mode?: "barbers" | "shops";
}) {
  const { t, money, number, label, serviceName, styleName } = useI18n();
  const { state } = useMock(),
    [kind, setKind] = useState(mode),
    [query, setQuery] = useState(initial.q ?? ""),
    [location, setLocation] = useState(initial.location ?? ""),
    [service, setService] = useState(initial.service ?? ""),
    [style, setStyle] = useState(initial.style ?? ""),
    [date, setDate] = useState(initial.date ?? ""),
    [availability, setAvailability] = useState(initial.availability ?? ""),
    [maxPrice, setMaxPrice] = useState(100),
    [minRating, setMinRating] = useState(0),
    [experience, setExperience] = useState(0),
    [distance, setDistance] = useState(10),
    [sort, setSort] = useState("recommended"),
    [mobile, setMobile] = useState(false);
  const reset = () => {
    setQuery("");
    setLocation("");
    setService("");
    setStyle("");
    setDate("");
    setAvailability("");
    setMaxPrice(100);
    setMinRating(0);
    setExperience(0);
    setDistance(10);
  };
  const activeCount = [
    location,
    service,
    style,
    date,
    availability,
    maxPrice < 100,
    minRating,
    experience,
    distance < 10,
  ].filter(Boolean).length;
  const filtered = useMemo(
    () =>
      state.barbers
        .filter((b) => {
          const shop = shops.find((s) => s.id === b.shopId)!,
            rating = ratingFor(b.id, state.reviews),
            targetDate =
              date ||
              (availability === "today"
                ? today()
                : availability === "tomorrow"
                  ? addDays(1)
                  : "");
          return (
            (!query ||
              `${b.name} ${shop.name} ${shop.neighborhood} ${searchDisplays.map((display) => display.label(shop.neighborhood)).join(" ")} ${b.styleIds
                .map((id) => {
                  const item = styles.find((s) => s.id === id);
                  return item
                    ? [
                        item.name,
                        ...searchDisplays.map((display) =>
                          display.styleName(item),
                        ),
                      ].join(" ")
                    : "";
                })
                .join(" ")}`
                .toLowerCase()
                .includes(query.toLowerCase())) &&
            (!location || location === shop.neighborhood) &&
            (!service || b.serviceIds.includes(service)) &&
            (!style || b.styleIds.includes(style)) &&
            getPrice(b, service || "haircut", state) <= maxPrice &&
            rating.value >= minRating &&
            b.experience >= experience &&
            shop.distance <= distance &&
            (!targetDate ||
              SLOT_TIMES.some((t) =>
                slotAvailable(state, b.id, service || "haircut", targetDate, t),
              ))
          );
        })
        .sort((a, b) => {
          const ar = ratingFor(a.id, state.reviews),
            br = ratingFor(b.id, state.reviews);
          if (sort === "rating") return br.value - ar.value;
          if (sort === "reviews") return br.count - ar.count;
          if (sort === "price")
            return (
              getPrice(a, service || "haircut", state) -
              getPrice(b, service || "haircut", state)
            );
          if (sort === "available") {
            const an = nextAvailable(state, a.id, service || "haircut"),
              bn = nextAvailable(state, b.id, service || "haircut");
            return `${an?.date ?? "9999"}${an?.time ?? ""}`.localeCompare(
              `${bn?.date ?? "9999"}${bn?.time ?? ""}`,
            );
          }
          return (
            Number(!!b.featured) - Number(!!a.featured) || br.value - ar.value
          );
        }),
    [
      state,
      query,
      location,
      service,
      style,
      date,
      availability,
      maxPrice,
      minRating,
      experience,
      distance,
      sort,
    ],
  );
  const filteredShops = Array.from(new Set(filtered.map((b) => b.shopId))).map(
    (id) => shops.find((s) => s.id === id)!,
  );
  const filters = (
    <>
      <div className="filter-title">
        <h3>{t("discovery.filtersTitle")}</h3>
        <button className="link-button" onClick={reset}>
          {t("discovery.resetAll")}
        </button>
      </div>
      <label className="field">
        {t("discovery.neighborhood")}
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">{t("discovery.allTbilisi")}</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>
              {label(n)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        {t("discovery.distance")}
        <select value={distance} onChange={(e) => setDistance(+e.target.value)}>
          <option value={10}>{t("discovery.anyDistance")}</option>
          <option value={1}>{t("discovery.distance1")}</option>
          <option value={3}>{t("discovery.distance3")}</option>
          <option value={5}>{t("discovery.distance5")}</option>
        </select>
        <span className="hint">{t("discovery.distanceHint")}</span>
      </label>
      <label className="field">
        {t("discovery.service")}
        <select value={service} onChange={(e) => setService(e.target.value)}>
          <option value="">{t("discovery.anyService")}</option>
          {state.services.map((s) => (
            <option value={s.id} key={s.id}>
              {serviceName(s)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        {t("discovery.haircutStyle")}
        <select value={style} onChange={(e) => setStyle(e.target.value)}>
          <option value="">{t("discovery.anyStyle")}</option>
          {styles.map((s) => (
            <option value={s.id} key={s.id}>
              {styleName(s)}
            </option>
          ))}
        </select>
      </label>
      <div className="filter-divider" />
      <label className="field">
        {t("discovery.priceUpTo")} <strong>{money(maxPrice)}</strong>
        <input
          type="range"
          min="15"
          max="100"
          step="5"
          value={maxPrice}
          onChange={(e) => setMaxPrice(+e.target.value)}
        />
        <div className="range-labels">
          <span>{money(15)}</span>
          <span>{money(100)}</span>
        </div>
      </label>
      <label className="field">
        {t("discovery.minimumRating")}
        <select
          value={minRating}
          onChange={(e) => setMinRating(+e.target.value)}
        >
          <option value={0}>{t("discovery.allRatings")}</option>
          <option value={4}>{t("discovery.rating4")}</option>
          <option value={4.5}>{t("discovery.rating45")}</option>
          <option value={4.9}>{t("discovery.rating49")}</option>
        </select>
      </label>
      <label className="field">
        {t("discovery.experience")}
        <select
          value={experience}
          onChange={(e) => setExperience(+e.target.value)}
        >
          <option value={0}>{t("discovery.allExperience")}</option>
          <option value={3}>{t("discovery.experience3")}</option>
          <option value={5}>{t("discovery.experience5")}</option>
          <option value={8}>{t("discovery.experience8")}</option>
        </select>
      </label>
      <div className="filter-divider" />
      <label className="field">
        {t("discovery.availability")}
        <select
          value={availability}
          onChange={(e) => {
            setAvailability(e.target.value);
            setDate("");
          }}
        >
          <option value="">{t("discovery.anyDay")}</option>
          <option value="today">{t("discovery.today")}</option>
          <option value="tomorrow">{t("discovery.tomorrow")}</option>
        </select>
      </label>
      <label className="field">
        {t("discovery.chooseDate")}
        <input
          type="date"
          min={today()}
          max={addDays(30)}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setAvailability("");
          }}
        />
      </label>
    </>
  );
  return (
    <div className="container page-section">
      <PageHeader
        eyebrow={t("discovery.eyebrow")}
        title={
          mode === "shops"
            ? t("discovery.shopsTitle")
            : mode === "barbers" && initial.style
              ? t("discovery.specialistTitle")
              : t("discovery.barbersTitle")
        }
        description={t("discovery.description")}
      />
      <div className="discovery-search">
        <Search size={19} />
        <input
          aria-label={t("discovery.searchLabel")}
          placeholder={t("discovery.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            className="icon-button"
            aria-label={t("discovery.clearSearch")}
            onClick={() => setQuery("")}
          >
            <X size={15} />
          </button>
        )}
        <span>
          <MapPin size={15} />
          {t("discovery.cityCountry")}
        </span>
      </div>
      <div className="discovery-layout">
        <aside className="filter-sidebar">{filters}</aside>
        <div className="discovery-results">
          <div className="result-controls">
            <div
              className="tabs"
              role="tablist"
              aria-label={t("discovery.resultType")}
            >
              <button
                role="tab"
                aria-selected={kind === "barbers"}
                className={kind === "barbers" ? "active" : ""}
                onClick={() => setKind("barbers")}
              >
                {t("discovery.barbers")}{" "}
                <span className="count">{number(filtered.length)}</span>
              </button>
              <button
                role="tab"
                aria-selected={kind === "shops"}
                className={kind === "shops" ? "active" : ""}
                onClick={() => setKind("shops")}
              >
                {t("discovery.shops")}{" "}
                <span className="count">{number(filteredShops.length)}</span>
              </button>
            </div>
            <label className="sort-control">
              {t("discovery.sortBy")}
              <select
                aria-label={t("discovery.sortLabel")}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="recommended">
                  {t("discovery.recommended")}
                </option>
                <option value="rating">{t("discovery.highestRated")}</option>
                <option value="reviews">{t("discovery.mostReviewed")}</option>
                <option value="price">{t("discovery.lowestPrice")}</option>
                <option value="available">
                  {t("discovery.earliestAvailable")}
                </option>
              </select>
            </label>
          </div>
          <div className="result-meta">
            <p aria-live="polite">
              {t(
                kind === "barbers"
                  ? "discovery.barberResults"
                  : "discovery.shopResults",
                {
                  count:
                    kind === "barbers" ? filtered.length : filteredShops.length,
                  location: label(location || "Tbilisi"),
                },
              )}
            </p>
            <button
              className="button button-outline mobile-filters"
              onClick={() => setMobile(true)}
            >
              <SlidersHorizontal size={15} />
              {t("discovery.filters")}
              {activeCount ? ` (${number(activeCount)})` : ""}
            </button>
            {activeCount > 0 && (
              <button className="link-button" onClick={reset}>
                {t("discovery.clearCount", { count: activeCount })}
              </button>
            )}
          </div>
          {(kind === "barbers" ? filtered : filteredShops).length ? (
            <div
              className={
                kind === "barbers"
                  ? "discovery-barber-grid"
                  : "discovery-shop-grid"
              }
            >
              {kind === "barbers"
                ? filtered.map((b) => <BarberCard key={b.id} barber={b} />)
                : filteredShops.map((s) => <ShopCard key={s.id} shop={s} />)}
            </div>
          ) : (
            <EmptyState
              title={t("discovery.emptyTitle")}
              text={t("discovery.emptyDescription")}
              action={t("discovery.clearFilters")}
              onAction={reset}
            />
          )}
          <div className="results-note">{t("discovery.disclosure")}</div>
        </div>
      </div>
      <Modal
        open={mobile}
        onClose={() => setMobile(false)}
        title={t("discovery.mobileTitle")}
      >
        <div className="mobile-filter-content">{mobile && filters}</div>
        <button
          className="button button-dark button-full"
          onClick={() => setMobile(false)}
        >
          {t("discovery.showResults", {
            count: kind === "barbers" ? filtered.length : filteredShops.length,
          })}
        </button>
      </Modal>
    </div>
  );
}
