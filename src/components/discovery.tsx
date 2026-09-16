"use client";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useI18n } from "@/i18n/provider";
import { createDisplay } from "@/i18n/display";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import {
  ArrowDownWideNarrow,
  CalendarDays,
  Clock3,
  MapPin,
  Navigation,
  RotateCcw,
  Scissors,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useMock } from "./provider";
import { BarberCard, ShopCard } from "./cards";
import { PremiumSelect } from "./premium-select";
import { StyleSelectionBrief } from "./style-selection-brief";
import { useStyleSelection } from "./style-selection-provider";
import { isHairStyleId } from "@/lib/style-selection";
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

function PriceFilter({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const { t, money } = useI18n();
  const id = useId();
  return (
    <div className="premium-price-filter">
      <div className="premium-price-heading">
        <label htmlFor={id}>{t("discovery.priceUpTo")}</label>
        <strong>{money(value)}</strong>
      </div>
      <input
        id={id}
        className="premium-price-range"
        type="range"
        min="15"
        max="100"
        step="5"
        value={value}
        aria-valuetext={money(value)}
        style={
          { "--range-fill": `${((value - 15) / 85) * 100}%` } as CSSProperties
        }
        onChange={(event) => onChange(+event.target.value)}
      />
      <div className="premium-price-limits">
        <span>{money(15)}</span>
        <span>{money(100)}</span>
      </div>
      {value < 100 && (
        <button
          type="button"
          className="premium-price-reset"
          onClick={() => onChange(100)}
        >
          <RotateCcw size={12} aria-hidden="true" />
          {t("filters.resetPrice")}
        </button>
      )}
    </div>
  );
}

export interface DiscoveryParams {
  location?: string;
  service?: string;
  date?: string;
  style?: string;
  availability?: string;
  q?: string;
  filters?: string;
}
export function Discovery({
  initial = {},
  mode = "barbers",
}: {
  initial?: DiscoveryParams;
  mode?: "barbers" | "shops";
}) {
  const {
    t,
    money,
    number,
    label,
    serviceName,
    styleName,
    date: formatDate,
  } = useI18n();
  const { selection, setHairStyle, clearSelection } = useStyleSelection();
  const appliedInitialStyle = useRef<string | undefined | null>(null);
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
  useEffect(() => {
    if (
      initial.filters === "open" &&
      window.matchMedia("(max-width: 800px)").matches
    ) {
      setMobile(true);
    }
  }, [initial.filters]);
  useEffect(() => {
    if (!selection.submitted || appliedInitialStyle.current === initial.style)
      return;
    appliedInitialStyle.current = initial.style;
    // A submitted session preference must never override the route's real filter.
    if (isHairStyleId(initial.style)) {
      if (selection.hairStyleId !== initial.style) setHairStyle(initial.style);
    } else clearSelection();
  }, [
    initial.style,
    selection.submitted,
    selection.hairStyleId,
    setHairStyle,
    clearSelection,
  ]);
  const changeStyle = (value: string) => {
    setStyle(value);
    if (isHairStyleId(value)) setHairStyle(value);
    else clearSelection();
  };
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
    clearSelection();
  };
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
  const activeChips: { key: string; name: string; remove: () => void }[] = [];
  if (query)
    activeChips.push({
      key: "query",
      name: t("filters.search", { query }),
      remove: () => setQuery(""),
    });
  if (location)
    activeChips.push({
      key: "location",
      name: label(location),
      remove: () => setLocation(""),
    });
  if (service) {
    const selected = state.services.find((item) => item.id === service);
    activeChips.push({
      key: "service",
      name: selected ? serviceName(selected) : service,
      remove: () => setService(""),
    });
  }
  if (style) {
    const selected = styles.find((item) => item.id === style);
    activeChips.push({
      key: "style",
      name: selected ? styleName(selected) : style,
      remove: () => changeStyle(""),
    });
  }
  if (date)
    activeChips.push({
      key: "date",
      name: Number.isFinite(new Date(`${date}T12:00:00Z`).valueOf())
        ? formatDate(date)
        : date,
      remove: () => setDate(""),
    });
  if (availability)
    activeChips.push({
      key: "availability",
      name:
        availability === "today" || availability === "tomorrow"
          ? t(`discovery.${availability}`)
          : availability,
      remove: () => setAvailability(""),
    });
  if (maxPrice < 100)
    activeChips.push({
      key: "price",
      name: t("filters.price", { price: money(maxPrice) }),
      remove: () => setMaxPrice(100),
    });
  if (minRating)
    activeChips.push({
      key: "rating",
      name: t("filters.rating", { rating: number(minRating) }),
      remove: () => setMinRating(0),
    });
  if (experience)
    activeChips.push({
      key: "experience",
      name: t("filters.experience", { count: experience }),
      remove: () => setExperience(0),
    });
  if (distance < 10)
    activeChips.push({
      key: "distance",
      name: t("filters.distance", { count: distance }),
      remove: () => setDistance(10),
    });
  const activeCount = activeChips.length;
  const filters = (
    <>
      <div className="filter-title premium-filter-title">
        <h3>
          <SlidersHorizontal size={16} aria-hidden="true" />
          {t("discovery.filters")}
          {activeCount > 0 && (
            <span className="premium-filter-count">{number(activeCount)}</span>
          )}
        </h3>
        {activeCount > 0 && (
          <button className="link-button" onClick={reset}>
            {t("filters.clearAll")}
          </button>
        )}
      </div>
      <div className="premium-filter-group">
        <PremiumSelect
          label={t("discovery.neighborhood")}
          icon={<MapPin size={18} />}
          value={location}
          onChange={setLocation}
          options={[
            { value: "", label: t("discovery.allTbilisi") },
            ...neighborhoods.map((n) => ({ value: n, label: label(n) })),
          ]}
        />
        <div className="premium-filter-with-hint">
          <PremiumSelect
            label={t("discovery.distance")}
            icon={<Navigation size={17} />}
            value={String(distance)}
            onChange={(value) => setDistance(+value)}
            options={[
              { value: "10", label: t("discovery.anyDistance") },
              ...[1, 3, 5].map((n) => ({
                value: String(n),
                label: t(`discovery.distance${n}`),
              })),
            ]}
          />
          <p className="premium-filter-hint">{t("discovery.distanceHint")}</p>
        </div>
      </div>
      <div className="premium-filter-group">
        <PremiumSelect
          label={t("discovery.service")}
          icon={<Scissors size={18} />}
          value={service}
          onChange={setService}
          options={[
            { value: "", label: t("discovery.anyService") },
            ...state.services.map((item) => ({
              value: item.id,
              label: serviceName(item),
            })),
          ]}
        />
        <PremiumSelect
          label={t("discovery.haircutStyle")}
          icon={<Sparkles size={17} />}
          value={style}
          onChange={changeStyle}
          options={[
            { value: "", label: t("discovery.anyStyle") },
            ...styles.map((item) => ({
              value: item.id,
              label: styleName(item),
            })),
          ]}
        />
        <PriceFilter value={maxPrice} onChange={setMaxPrice} />
      </div>
      <div className="premium-filter-group">
        <PremiumSelect
          label={t("discovery.minimumRating")}
          icon={<Star size={17} />}
          value={String(minRating)}
          onChange={(value) => setMinRating(+value)}
          options={[
            { value: "0", label: t("discovery.allRatings") },
            { value: "4", label: t("discovery.rating4") },
            { value: "4.5", label: t("discovery.rating45") },
            { value: "4.9", label: t("discovery.rating49") },
          ]}
        />
        <PremiumSelect
          label={t("discovery.experience")}
          icon={<Scissors size={17} />}
          value={String(experience)}
          onChange={(value) => setExperience(+value)}
          options={[
            { value: "0", label: t("discovery.allExperience") },
            ...[3, 5, 8].map((n) => ({
              value: String(n),
              label: t(`discovery.experience${n}`),
            })),
          ]}
        />
      </div>
      <div className="premium-filter-group">
        <PremiumSelect
          label={t("discovery.availability")}
          icon={<Clock3 size={17} />}
          value={availability}
          onChange={(value) => {
            setAvailability(value);
            setDate("");
          }}
          options={[
            { value: "", label: t("discovery.anyDay") },
            { value: "today", label: t("discovery.today") },
            { value: "tomorrow", label: t("discovery.tomorrow") },
          ]}
        />
        <label className="premium-date-filter">
          <span>
            <CalendarDays size={16} aria-hidden="true" />
            {t("discovery.chooseDate")}
          </span>
          <input
            type="date"
            min={today()}
            max={addDays(30)}
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setAvailability("");
            }}
          />
        </label>
      </div>
    </>
  );
  return (
    <div className="container page-section premium-discovery">
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
      <StyleSelectionBrief />
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
        <aside className="filter-sidebar premium-filter-sidebar">
          {filters}
        </aside>
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
            <PremiumSelect
              className="premium-sort-control"
              label={t("discovery.sortBy")}
              value={sort}
              icon={<ArrowDownWideNarrow size={17} />}
              onChange={setSort}
              options={[
                { value: "recommended", label: t("discovery.recommended") },
                { value: "rating", label: t("discovery.highestRated") },
                { value: "reviews", label: t("discovery.mostReviewed") },
                { value: "price", label: t("discovery.lowestPrice") },
                { value: "available", label: t("discovery.earliestAvailable") },
              ]}
            />
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
              className="button button-outline mobile-filters premium-filter-button"
              onClick={() => setMobile(true)}
            >
              <SlidersHorizontal size={15} />
              {t("discovery.filters")}
              {activeCount > 0 && (
                <span className="premium-filter-count">
                  {number(activeCount)}
                </span>
              )}
            </button>
          </div>
          {activeChips.length > 0 && (
            <div
              className="premium-active-filters"
              role="group"
              aria-label={t("filters.active")}
            >
              {activeChips.map((chip) => (
                <button
                  type="button"
                  key={chip.key}
                  className="premium-filter-chip"
                  onClick={chip.remove}
                  aria-label={t("filters.remove", { name: chip.name })}
                >
                  <span>{chip.name}</span>
                  <X size={13} aria-hidden="true" />
                </button>
              ))}
              {activeChips.length > 1 && (
                <button
                  type="button"
                  className="premium-clear-filters"
                  onClick={reset}
                >
                  {t("filters.clearAll")}
                </button>
              )}
            </div>
          )}
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
      <div className="premium-filter-sheet">
        <Modal
          open={mobile}
          onClose={() => setMobile(false)}
          title={t("discovery.mobileTitle")}
        >
          <div className="mobile-filter-content premium-filter-scroll">
            {mobile && filters}
          </div>
          <div className="premium-sheet-footer">
            {activeCount > 0 && (
              <button
                type="button"
                className="premium-clear-filters"
                onClick={reset}
              >
                {t("filters.clearAll")}
              </button>
            )}
            <button
              className="button button-dark"
              onClick={() => setMobile(false)}
            >
              {t("discovery.showResults", {
                count:
                  kind === "barbers" ? filtered.length : filteredShops.length,
              })}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
