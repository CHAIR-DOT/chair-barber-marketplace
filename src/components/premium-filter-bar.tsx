"use client";

import { useState } from "react";
import {
  CalendarDays,
  MapPin,
  Scissors,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { neighborhoods, services } from "@/lib/data";
import { today } from "@/lib/dates";
import { publicPath } from "@/lib/public-path";
import { useI18n } from "@/i18n/provider";
import { PremiumSelect } from "./premium-select";
import "./premium-home-filter.css";

export function PremiumFilterBar() {
  const { t, label, serviceName, number } = useI18n();
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const activeCount = [location, service, date].filter(Boolean).length;
  return (
    <section
      className="home-filter-section"
      aria-labelledby="home-filter-title"
    >
      <div className="home-filter-heading">
        <h2 id="home-filter-title">{t("homeFilters.title")}</h2>
        <p>{t("homeFilters.subtitle")}</p>
      </div>
      <form
        action={publicPath("/discover")}
        className="container premium-home-search"
      >
        <PremiumSelect
          label={t("home.location")}
          name="location"
          value={location}
          onChange={setLocation}
          icon={<MapPin size={19} />}
          options={[
            { value: "", label: t("home.city") },
            ...neighborhoods.map((n) => ({ value: n, label: label(n) })),
          ]}
        />
        <PremiumSelect
          label={t("home.service")}
          name="service"
          value={service}
          onChange={setService}
          icon={<Scissors size={19} />}
          options={[
            { value: "", label: t("home.anyService") },
            ...services
              .slice(0, 3)
              .map((s) => ({ value: s.id, label: serviceName(s) })),
          ]}
        />
        <label className="premium-home-date">
          <CalendarDays size={19} />
          <span>
            <small>{t("home.when")}</small>
            <input
              type="date"
              name="date"
              min={today()}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-label={t("home.appointmentDate")}
            />
          </span>
        </label>
        <button
          type="submit"
          name="filters"
          value="open"
          className="button home-more-filters"
        >
          <SlidersHorizontal size={16} />
          {t("homeFilters.more")}
          {activeCount > 0 && (
            <span className="premium-filter-count">{number(activeCount)}</span>
          )}
        </button>
        <button type="submit" className="button button-dark">
          <Search size={17} />
          {t("home.find")}
        </button>
      </form>
    </section>
  );
}
