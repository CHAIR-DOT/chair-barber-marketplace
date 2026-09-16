"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { shops, styles } from "@/lib/data";
import { InteractiveStyleHero } from "@/components/interactive-style-hero";
import { PremiumFilterBar } from "@/components/premium-filter-bar";
import { useMock } from "@/components/provider";
import { BarberCard, ShopCard, StyleCard } from "@/components/cards";
import { useI18n } from "@/i18n/provider";
export default function Home() {
  const { state } = useMock();
  const { t } = useI18n();
  return (
    <>
      <InteractiveStyleHero />
      <PremiumFilterBar />
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
