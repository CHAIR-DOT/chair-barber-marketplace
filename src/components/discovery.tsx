"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
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
              `${b.name} ${shop.name} ${shop.neighborhood} ${b.styleIds.map((id) => styles.find((s) => s.id === id)?.name).join(" ")}`
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
        <h3>Make it your own</h3>
        <button className="link-button" onClick={reset}>
          Reset all
        </button>
      </div>
      <label className="field">
        Neighborhood
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">All of Tbilisi</option>
          {neighborhoods.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Distance
        <select value={distance} onChange={(e) => setDistance(+e.target.value)}>
          <option value={10}>Any distance</option>
          <option value={1}>Within 1 km</option>
          <option value={3}>Within 3 km</option>
          <option value={5}>Within 5 km</option>
        </select>
        <span className="hint">Sample distance from central Tbilisi</span>
      </label>
      <label className="field">
        Service
        <select value={service} onChange={(e) => setService(e.target.value)}>
          <option value="">Any service</option>
          {state.services.map((s) => (
            <option value={s.id} key={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Haircut style
        <select value={style} onChange={(e) => setStyle(e.target.value)}>
          <option value="">Any style</option>
          {styles.map((s) => (
            <option value={s.id} key={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <div className="filter-divider" />
      <label className="field">
        Price up to <strong>₾{maxPrice}</strong>
        <input
          type="range"
          min="15"
          max="100"
          step="5"
          value={maxPrice}
          onChange={(e) => setMaxPrice(+e.target.value)}
        />
        <div className="range-labels">
          <span>₾15</span>
          <span>₾100</span>
        </div>
      </label>
      <label className="field">
        Minimum rating
        <select
          value={minRating}
          onChange={(e) => setMinRating(+e.target.value)}
        >
          <option value={0}>All ratings</option>
          <option value={4}>4.0 and above</option>
          <option value={4.5}>4.5 and above</option>
          <option value={4.9}>4.9 and above</option>
        </select>
      </label>
      <label className="field">
        Experience
        <select
          value={experience}
          onChange={(e) => setExperience(+e.target.value)}
        >
          <option value={0}>All experience levels</option>
          <option value={3}>3+ years</option>
          <option value={5}>5+ years</option>
          <option value={8}>8+ years</option>
        </select>
      </label>
      <div className="filter-divider" />
      <label className="field">
        Availability
        <select
          value={availability}
          onChange={(e) => {
            setAvailability(e.target.value);
            setDate("");
          }}
        >
          <option value="">Any day</option>
          <option value="today">Available today</option>
          <option value="tomorrow">Available tomorrow</option>
        </select>
      </label>
      <label className="field">
        Or choose a date
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
        eyebrow="A GOOD CUT STARTS HERE"
        title={
          mode === "shops"
            ? "Find your new local"
            : mode === "barbers" && initial.style
              ? "Find your style specialist"
              : "Find your kind of barber"
        }
        description="Explore the people, the places, and the craft. Find a chair that feels like yours."
      />
      <div className="discovery-search">
        <Search size={19} />
        <input
          aria-label="Search barbers, shops, or styles"
          placeholder="A name, a neighborhood, a style…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            className="icon-button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
          >
            <X size={15} />
          </button>
        )}
        <span>
          <MapPin size={15} />
          Tbilisi, Georgia
        </span>
      </div>
      <div className="discovery-layout">
        <aside className="filter-sidebar">{filters}</aside>
        <div className="discovery-results">
          <div className="result-controls">
            <div className="tabs" role="tablist" aria-label="Result type">
              <button
                role="tab"
                aria-selected={kind === "barbers"}
                className={kind === "barbers" ? "active" : ""}
                onClick={() => setKind("barbers")}
              >
                Barbers <span className="count">{filtered.length}</span>
              </button>
              <button
                role="tab"
                aria-selected={kind === "shops"}
                className={kind === "shops" ? "active" : ""}
                onClick={() => setKind("shops")}
              >
                Barber shops{" "}
                <span className="count">{filteredShops.length}</span>
              </button>
            </div>
            <label className="sort-control">
              Sort by
              <select
                aria-label="Sort results"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Highest rated</option>
                <option value="reviews">Most reviewed</option>
                <option value="price">Lowest price</option>
                <option value="available">Earliest available</option>
              </select>
            </label>
          </div>
          <div className="result-meta">
            <p aria-live="polite">
              {kind === "barbers" ? filtered.length : filteredShops.length}{" "}
              {kind === "barbers" ? "barbers" : "shops"}{" "}
              {location ? `in ${location}` : "in Tbilisi"}
            </p>
            <button
              className="button button-outline mobile-filters"
              onClick={() => setMobile(true)}
            >
              <SlidersHorizontal size={15} />
              Filters{activeCount ? ` (${activeCount})` : ""}
            </button>
            {activeCount > 0 && (
              <button className="link-button" onClick={reset}>
                Clear {activeCount} filters
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
              title="No chairs found. Yet."
              text="Try a wider neighborhood, another date, or fewer filters. Your next great cut is out there."
              action="Clear filters"
              onAction={reset}
            />
          )}
          <div className="results-note">
            You’re exploring fictional profiles and illustrative portfolio
            photographs.
          </div>
        </div>
      </div>
      <Modal
        open={mobile}
        onClose={() => setMobile(false)}
        title="Find your fit"
      >
        <div className="mobile-filter-content">{mobile && filters}</div>
        <button
          className="button button-dark button-full"
          onClick={() => setMobile(false)}
        >
          Show {kind === "barbers" ? filtered.length : filteredShops.length}{" "}
          results
        </button>
      </Modal>
    </div>
  );
}
