"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { styles } from "@/lib/data";
import {
  BEARD_STYLE_IDS,
  discoveryStyleHref,
  type BeardStyleId,
} from "@/lib/style-selection";
import { useStyleSelection } from "./style-selection-provider";
import { useI18n } from "@/i18n/provider";
import type { StyleCategory, StyleScene } from "./style-scene";
import "./interactive-style-hero.css";

const hairStyles = styles.filter((style) => style.id !== "beard-styles");

function BeardIllustration({ style }: { style: BeardStyleId }) {
  const shapes: Record<BeardStyleId, string> = {
    "clean-shaven": "",
    stubble: "M22 36L27 47Q40 60 53 47L58 36L55 51Q40 68 25 51Z",
    "short-beard":
      "M21 31L27 42L34 44L40 42L46 44L53 42L59 31L57 52Q40 74 23 52Z",
    "full-beard":
      "M21 29L27 41L34 44L40 41L46 44L53 41L59 29L60 51L51 66L40 73L29 66L20 51Z",
    goatee:
      "M32 46Q40 42 48 46L47 60Q40 68 33 60ZM30 42Q40 36 50 42L47 46Q40 42 33 46Z",
    defined: "M21 28L27 43L34 46L40 43L46 46L53 43L59 28L57 53L47 64H33L23 53Z",
  };
  return (
    <svg
      viewBox="0 0 80 80"
      aria-hidden="true"
      className={`beard-illustration beard-${style}`}
    >
      <path
        d="M23 22Q23 7 40 7Q57 7 57 22L58 38Q55 56 40 61Q25 56 22 38Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        opacity=".65"
      />
      <path
        d="M28 29h5m14 0h5m-13 5-2 8h5m-9 7q7 4 14 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity=".6"
      />
      {shapes[style] && (
        <path
          d={shapes[style]}
          fill="currentColor"
          opacity={style === "stubble" ? ".35" : ".85"}
        />
      )}
      {style === "clean-shaven" && (
        <path d="m61 47 3-6 3 6 6 3-6 3-3 6-3-6-6-3Z" fill="currentColor" />
      )}
    </svg>
  );
}

function ModelPortrait({
  category,
  onCategory,
}: {
  category: StyleCategory;
  onCategory: (category: StyleCategory) => void;
}) {
  const { t } = useI18n();
  const host = useRef<HTMLDivElement>(null);
  const hairSpot = useRef<HTMLButtonElement>(null);
  const beardSpot = useRef<HTMLButtonElement>(null);
  const controller = useRef<StyleScene | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  const { selection } = useStyleSelection();
  const latestSelection = useRef(selection);
  latestSelection.current = selection;
  const latestCategory = useRef(category);
  latestCategory.current = category;

  useEffect(() => {
    let cancelled = false;
    let sceneReady = false;
    let scene: StyleScene | undefined;
    setStatus("loading");
    const timer = window.setTimeout(() => {
      if (!cancelled) {
        setStatus("fallback");
        scene?.dispose();
        controller.current = null;
        cancelled = true;
      }
    }, 15000);
    import("./style-scene")
      .then(({ createStyleScene }) => {
        if (cancelled || !host.current) return;
        scene = createStyleScene(host.current, {
          onReady: () => {
            if (!cancelled) {
              sceneReady = true;
              window.clearTimeout(timer);
              setStatus("ready");
            }
          },
          onError: () => {
            if (!cancelled) {
              window.clearTimeout(timer);
              setStatus("fallback");
              scene?.dispose();
              controller.current = null;
              cancelled = true;
            }
          },
          onHotspot: (name, xPercent, yPercent) => {
            if (cancelled || !sceneReady) return;
            const element =
              name === "hair" ? hairSpot.current : beardSpot.current;
            if (element) {
              element.style.left = `${xPercent}%`;
              element.style.top = `${yPercent}%`;
            }
          },
        });
        controller.current = scene;
        scene.setCategory(latestCategory.current);
        scene.setSelection(latestSelection.current);
      })
      .catch(() => {
        if (!cancelled) {
          window.clearTimeout(timer);
          setStatus("fallback");
        }
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      scene?.dispose();
      controller.current = null;
    };
  }, []);

  useEffect(() => {
    controller.current?.setCategory(category);
  }, [category]);
  useEffect(() => {
    controller.current?.setSelection(selection);
  }, [selection]);
  const ready = status === "ready";
  return (
    <div className={`model-portrait ${ready ? "model-ready" : ""}`}>
      <div className="model-stage" aria-busy={status === "loading"}>
        <div className="portrait-aura" />
        {status === "loading" && (
          <div className="model-skeleton" aria-hidden="true" />
        )}
        {status === "fallback" && (
          <img src="/images/hero.jpg" alt="" className="model-poster" />
        )}
        <div
          ref={host}
          className="model-canvas"
          role="img"
          aria-hidden={!ready}
          aria-label={t("hero.modelLabel")}
        />
        {ready &&
          (["hair", "beard"] as const).map((name) => (
            <button
              key={name}
              ref={name === "hair" ? hairSpot : beardSpot}
              className={`model-hotspot hotspot-${name} ${category === name ? "is-active" : ""}`}
              type="button"
              aria-label={t(
                name === "hair" ? "hero.hairOptions" : "hero.beardOptions",
              )}
              aria-pressed={category === name}
              onClick={() => onCategory(name)}
            >
              <span className="hotspot-ring">
                <span />
              </span>
              <span className="hotspot-label">{t(`hero.${name}`)}</span>
            </button>
          ))}
      </div>
      <div className="model-tools">
        <p aria-live="polite">
          {t(
            ready
              ? "hero.rotate"
              : status === "loading"
                ? "hero.loading"
                : "hero.fallback",
          )}
        </p>
        <div className="model-rotation" aria-hidden={!ready}>
          <button
            type="button"
            disabled={!ready}
            onClick={() => controller.current?.rotate(-1)}
            aria-label={t("hero.rotateLeft")}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => controller.current?.reset()}
            aria-label={t("hero.resetView")}
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => controller.current?.rotate(1)}
            aria-label={t("hero.rotateRight")}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div className="model-credit">
        {t("hero.modelCredit")}:{" "}
        <a
          href="https://creativecommons.org/licenses/by/3.0/"
          target="_blank"
          rel="noreferrer"
        >
          Lee Perry-Smith / Infinite · CC BY 3.0
        </a>
      </div>
    </div>
  );
}

function StyleConfigurator({
  category,
  onCategory,
}: {
  category: StyleCategory;
  onCategory: (category: StyleCategory) => void;
}) {
  const { t, styleName, locale } = useI18n();
  const optionList = useRef<HTMLDivElement>(null);
  const { selection, setHairStyle, setBeardStyle, submitSelection } =
    useStyleSelection();
  useEffect(() => {
    const list = optionList.current;
    if (!list) return;
    function revealSelection() {
      if (!list) return;
      const chosen = list.querySelector<HTMLButtonElement>(
        '[aria-pressed="true"]',
      );
      if (!chosen) return;
      const bounds = list.getBoundingClientRect();
      const item = chosen.getBoundingClientRect();
      // Scroll only the choices, never the surrounding hero/page.
      if (item.left < bounds.left) list.scrollLeft += item.left - bounds.left;
      else if (item.right > bounds.right)
        list.scrollLeft += item.right - bounds.right;
      if (item.top < bounds.top) list.scrollTop += item.top - bounds.top;
      else if (item.bottom > bounds.bottom)
        list.scrollTop += item.bottom - bounds.bottom;
    }
    revealSelection();
    const observer = new ResizeObserver(revealSelection);
    observer.observe(list);
    return () => observer.disconnect();
  }, [category, selection.hairStyleId, selection.beardStyleId, locale]);
  const selectedHair =
    hairStyles.find((style) => style.id === selection.hairStyleId) ??
    hairStyles[0];
  return (
    <div className="style-configurator" id="style-configurator">
      <div className="configurator-heading">
        <span className="studio-eyebrow">{t("hero.studio")}</span>
        <h2>{t("hero.choose")}</h2>
      </div>
      <div className="style-categories" aria-label={t("hero.studio")}>
        {(["hair", "beard"] as const).map((name) => (
          <button
            type="button"
            key={name}
            aria-pressed={category === name}
            onClick={() => onCategory(name)}
          >
            {t(`hero.${name}`)}
            <span>{name === "hair" ? "01" : "02"}</span>
          </button>
        ))}
      </div>
      <div
        ref={optionList}
        className="style-options"
        role="group"
        aria-label={t(
          category === "hair" ? "hero.hairOptions" : "hero.beardOptions",
        )}
      >
        {category === "hair"
          ? hairStyles.map((style) => (
              <button
                type="button"
                key={style.id}
                className="style-option"
                aria-pressed={selection.hairStyleId === style.id}
                onClick={() => setHairStyle(style.id)}
              >
                <span className="style-thumbnail">
                  <img src={style.image} alt="" loading="lazy" />
                  {selection.hairStyleId === style.id && (
                    <Check size={12} className="style-check" />
                  )}
                </span>
                <span>{styleName(style)}</span>
              </button>
            ))
          : BEARD_STYLE_IDS.map((id) => (
              <button
                type="button"
                key={id}
                className="style-option"
                aria-pressed={selection.beardStyleId === id}
                onClick={() => setBeardStyle(id)}
              >
                <span className="style-thumbnail">
                  <BeardIllustration style={id} />
                  {selection.beardStyleId === id && (
                    <Check size={12} className="style-check" />
                  )}
                </span>
                <span>{t(`hero.beard.${id}`)}</span>
              </button>
            ))}
      </div>
      <div className="style-current" aria-live="polite">
        <span>{t("hero.selected")}</span>
        <strong>
          {styleName(selectedHair)}
          <span className="combination-plus"> + </span>
          {t(`hero.beard.${selection.beardStyleId}`)}
        </strong>
      </div>
      <Link
        href={discoveryStyleHref(selection.hairStyleId)}
        className="style-cta"
        onClick={submitSelection}
      >
        {t("hero.find")}
        <ArrowRight size={18} />
      </Link>
      <p className="style-preview-note">{t("hero.previewNote")}</p>
    </div>
  );
}

export function InteractiveStyleHero() {
  const { t } = useI18n();
  const [category, setCategory] = useState<StyleCategory>("hair");
  return (
    <section className="style-hero" aria-labelledby="style-hero-title">
      <div className="style-hero-grain" />
      <div className="container style-hero-inner">
        <div className="style-hero-copy">
          <div className="studio-eyebrow">
            <span />
            {t("hero.eyebrow")}
          </div>
          <h1
            id="style-hero-title"
            aria-label={`${t("hero.title")} ${t("hero.titleAccent")}`}
          >
            {t("hero.title")}
            <em>{t("hero.titleAccent")}</em>
          </h1>
          <p>{t("hero.intro")}</p>
          <a href="#style-configurator" className="style-explore">
            {t("hero.explore")}
            <ArrowDown size={16} />
          </a>
          <span className="hero-wordmark" aria-hidden="true">
            CHAIR<span>.</span>
          </span>
        </div>
        <ModelPortrait category={category} onCategory={setCategory} />
        <StyleConfigurator category={category} onCategory={setCategory} />
      </div>
    </section>
  );
}
