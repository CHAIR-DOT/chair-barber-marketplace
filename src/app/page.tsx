"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Scissors,
  Search,
} from "lucide-react";
import { shops, styles, services, neighborhoods } from "@/lib/data";
import { today } from "@/lib/dates";
import { useMock } from "@/components/provider";
import { BarberCard, ShopCard, StyleCard } from "@/components/cards";
import { useI18n } from "@/i18n/provider";
export default function Home() {
  const { state } = useMock();
  const { t, label, serviceName } = useI18n();
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="small-line" />
            {t("home.eyebrow")}
          </div>
          <h1>
            {t("home.title1")}
            <br />
            {t("home.title2")} <em>{t("home.titleAccent")}</em>
          </h1>
          <p>{t("home.intro")}</p>
          <div className="hero-proof">
            <div className="avatar-stack">
              {state.barbers.slice(0, 3).map((b) => (
                <img src={b.image} alt="" key={b.id} />
              ))}
            </div>
            <div>
              <span className="proof-stars">★★★★★</span>
              <span>{t("home.proof")}</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="/images/hero.jpg"
            alt={t("home.imageAlt")}
            fetchPriority="high"
          />
          <span className="image-caption">{t("home.caption")}</span>
          <div className="hero-note">
            <Scissors size={18} />
            <div>
              <strong>{t("home.noteTitle")}</strong>
              <span>{t("home.noteText")}</span>
            </div>
            <ArrowUpRight size={20} />
          </div>
        </div>
        <form action="/discover" className="hero-search">
          <label>
            <MapPin size={20} />
            <span>
              <small>{t("home.where")}</small>
              <select name="location" aria-label={t("home.location")}>
                <option value="">{t("home.city")}</option>
                {neighborhoods.map((n) => (
                  <option key={n} value={n}>
                    {label(n)}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label>
            <Scissors size={20} />
            <span>
              <small>{t("home.what")}</small>
              <select name="service" aria-label={t("home.service")}>
                <option value="">{t("home.anyService")}</option>
                {services.slice(0, 3).map((s) => (
                  <option key={s.id} value={s.id}>
                    {serviceName(s)}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label className="search-date">
            <CalendarDays size={20} />
            <span>
              <small>{t("home.when")}</small>
              <input
                type="date"
                name="date"
                min={today()}
                aria-label={t("home.appointmentDate")}
              />
            </span>
          </label>
          <button className="button button-dark">
            <Search size={18} />
            {t("home.find")}
          </button>
        </form>
      </section>
      <div className="container quick-discovery">
        <span>{t("home.inspiration")}</span>
        {[
          ["home.skinFades", "skin-fade"],
          ["home.beardStyling", "beard-styles"],
          ["home.classicCuts", "classic-scissor-cut"],
        ].map(([key, id]) => (
          <Link href={`/styles/${id}`} key={id}>
            {t(key)}
            <ArrowUpRight size={12} />
          </Link>
        ))}
        <Link href="/discover?availability=today" className="available-quick">
          <span />
          {t("home.availableToday")}
        </Link>
      </div>
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("home.neighborhood")}</span>
            <h2>
              {t("home.popular")}
              <span className="accent">.</span>
            </h2>
            <p>{t("home.popularText")}</p>
          </div>
          <Link href="/shops" className="text-link">
            {t("home.allShops")}
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="shop-grid">
          {shops.slice(0, 3).map((s) => (
            <ShopCard shop={s} key={s.id} />
          ))}
        </div>
      </section>
      <section className="style-section">
        <div className="container section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{t("home.look")}</span>
              <h2>
                {t("home.styleTitle")}
                <span className="accent">.</span>
              </h2>
              <p>{t("home.styleText")}</p>
            </div>
            <Link href="/styles" className="text-link">
              {t("home.browseStyle")}
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="style-grid">
            {[
              styles[0],
              styles[3],
              styles[6],
              styles[8],
              styles[9],
              styles[11],
            ].map((s) => (
              <StyleCard style={s} key={s.id} />
            ))}
          </div>
        </div>
      </section>
      <section className="container section top-barbers">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("home.people")}</span>
            <h2>
              {t("home.topBarbers")}
              <span className="accent">.</span>
            </h2>
            <p>{t("home.barbersText")}</p>
          </div>
          <Link href="/barbers" className="text-link">
            {t("home.allBarbers")}
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="barber-grid">
          {[
            state.barbers[0],
            state.barbers[2],
            state.barbers[4],
            state.barbers[6],
          ].map((b) => (
            <BarberCard barber={b} key={b.id} />
          ))}
        </div>
      </section>
      <section className="how-section container" id="how-it-works">
        <div className="how-intro">
          <div className="eyebrow">{t("home.howEyebrow")}</div>
          <h2>
            {t("home.howTitle")}
            <br />
            <em>{t("home.howAccent")}</em>
          </h2>
          <Link href="/discover" className="button button-dark">
            {t("footer.find")}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="how-steps">
          {[1, 2, 3].map((n) => (
            <div key={n}>
              <span>{`0${n}`}</span>
              <div>
                <h3>{t(`home.step${n}Title`)}</h3>
                <p>{t(`home.step${n}Text`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="barber-invite container">
        <div>
          <span className="eyebrow">{t("home.inviteEyebrow")}</span>
          <h2>
            {t("home.invite1")}
            <br />
            {t("home.invite2")}
          </h2>
        </div>
        <Link href="/register?role=barber" className="button button-light">
          {t("navigation.join")}
          <ArrowUpRight size={18} />
        </Link>
      </section>
    </>
  );
}
