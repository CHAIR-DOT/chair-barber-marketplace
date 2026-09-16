"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import "./barber-hero.css";

export function BarberHero() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  const [imageReady, setImageReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = true;
    const update = () =>
      setMotionAllowed(inView && !document.hidden && !preference.matches);
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              inView = entry.isIntersecting;
              update();
            },
            { threshold: 0 },
          );
    observer?.observe(element);
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <section
      ref={root}
      className="barber-hero style-hero"
      aria-labelledby="barber-hero-title"
      data-motion={
        motionAllowed && imageReady && !imageFailed ? "running" : "paused"
      }
    >
      <div className="barber-hero-visual" aria-hidden="true">
        <div className="atelier-architecture" />
        <div className="atelier-camera">
          <div className="atelier-poster" />
          <picture
            className={`atelier-image${imageReady && !imageFailed ? " is-ready" : ""}`}
          >
            <source
              media="(max-width: 800px)"
              srcSet="/images/hero/barber-atelier-mobile.webp"
            />
            <img
              src="/images/hero/barber-atelier.webp"
              alt=""
              width={1536}
              height={1024}
              fetchPriority="high"
              decoding="async"
              draggable={false}
              onLoad={() => {
                setImageFailed(false);
                setImageReady(true);
              }}
              onError={() => {
                setImageReady(false);
                setImageFailed(true);
              }}
            />
          </picture>
        </div>
        <div className="atelier-light" />
        <div className="atelier-dust">
          <i />
          <i />
          <i />
        </div>
        <div className="atelier-shade" />
      </div>
      <div className="container barber-hero-inner">
        <div className="barber-hero-copy">
          <div className="atelier-eyebrow">
            <span />
            {t("homeHero.eyebrow")}
          </div>
          <h1 id="barber-hero-title">
            {t("homeHero.title")} <em>{t("homeHero.titleAccent")}</em>
          </h1>
          <p className="barber-hero-intro">{t("homeHero.intro")}</p>
          <div className="barber-hero-actions">
            <Link href="/discover" className="barber-hero-primary">
              {t("homeHero.primary")}
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
            <Link href="/shops" className="barber-hero-secondary">
              {t("homeHero.secondary")}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="atelier-location">
            <MapPin size={13} aria-hidden="true" />
            {t("homeHero.location")}
          </div>
        </div>
        <div className="atelier-signature">
          <span className="atelier-signature-line" />
          <span>{t("homeHero.caption")}</span>
        </div>
        <div className="barber-hero-footer">
          <span className="atelier-detail">{t("homeHero.detail")}</span>
          <span className="atelier-invitation">
            <span />
            {t("homeHero.availability")}
          </span>
        </div>
      </div>
    </section>
  );
}
