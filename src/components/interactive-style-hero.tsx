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
  Image as ImageIcon,
  Box,
} from "lucide-react";
import {
  STYLE_ASSET_MANIFEST,
  resolveStudioSelection,
  getStyleCombination,
  getStyleThumbnail,
} from "@/lib/style-assets";
import { discoveryStyleHref } from "@/lib/style-selection";
import { useStyleSelection } from "./style-selection-provider";
import { useI18n } from "@/i18n/provider";
import type { StyleCategory, StyleScene } from "./style-scene";
import "./interactive-style-hero.css";

function MatchingPoster({
  src,
  label,
  hidden,
}: {
  src: string;
  label: string;
  hidden: boolean;
}) {
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  return failed ? (
    <div className="portrait-unavailable" aria-hidden={hidden}>
      <ImageIcon size={28} aria-hidden="true" />
      <p>{t("hero.previewUnavailable")}</p>
      <button
        type="button"
        onClick={() => {
          setFailed(false);
          setRetry((value) => value + 1);
        }}
      >
        {t("hero.retryPreview")}
      </button>
    </div>
  ) : (
    <img
      key={retry}
      src={retry ? `${src}?retry=${retry}` : src}
      alt={label}
      aria-hidden={hidden}
      className="model-poster"
      fetchPriority="high"
      onError={() => setFailed(true)}
    />
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
  const { selection: storedSelection } = useStyleSelection();
  const visibleSelection = resolveStudioSelection(storedSelection);
  const selection = { ...storedSelection, ...visibleSelection };
  const combination = getStyleCombination(visibleSelection);
  const [mode, setMode] = useState<"3d" | "photo">("3d");
  const [attempt, setAttempt] = useState(0);
  const latestSelection = useRef(selection);
  latestSelection.current = selection;
  const latestCategory = useRef(category);
  latestCategory.current = category;

  useEffect(() => {
    if (mode === "photo") {
      setStatus("fallback");
      return;
    }
    const device = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    if (
      attempt === 0 &&
      (device.connection?.saveData ||
        (device.deviceMemory && device.deviceMemory <= 2))
    ) {
      setMode("photo");
      return;
    }
    let cancelled = false;
    let sceneReady = false;
    let scene: StyleScene | undefined;
    setStatus("loading");
    const timer = window.setTimeout(() => {
      if (!cancelled) {
        setStatus("fallback");
        setMode("photo");
        scene?.dispose();
        controller.current = null;
        cancelled = true;
      }
    }, 12000);
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
              setMode("photo");
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
          setMode("photo");
        }
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      scene?.dispose();
      controller.current = null;
    };
  }, [mode, attempt]);

  useEffect(() => {
    controller.current?.setCategory(category);
  }, [category]);
  useEffect(() => {
    controller.current?.setSelection(selection);
  }, [selection]);
  const ready = mode === "3d" && status === "ready";
  return (
    <div className={`model-portrait ${ready ? "model-ready" : ""}`}>
      <div className="model-stage" aria-busy={status === "loading"}>
        <div className="portrait-aura" />
        <MatchingPoster
          key={combination.id}
          src={combination.previewSrc}
          hidden={ready}
          label={t("hero.previewLabel", {
            hair: t(
              STYLE_ASSET_MANIFEST.hairStyles.find(
                (item) => item.id === visibleSelection.hairStyleId,
              )!.labelKey,
            ),
            beard: t(
              STYLE_ASSET_MANIFEST.beardStyles.find(
                (item) => item.id === visibleSelection.beardStyleId,
              )!.labelKey,
            ),
          })}
        />
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
        <button
          type="button"
          className="portrait-mode"
          onClick={() => {
            setAttempt((value) => value + 1);
            setMode(mode === "3d" ? "photo" : "3d");
          }}
        >
          {mode === "3d" ? <ImageIcon size={15} /> : <Box size={15} />}
          {t(mode === "3d" ? "hero.photoView" : "hero.threeDView")}
        </button>
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
          href="https://static.makehumancommunity.org/makehuman/faq/are_makehuman_files_free.html"
          target="_blank"
          rel="noreferrer"
        >
          MakeHuman · CC0
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
  const { t, locale } = useI18n();
  const optionList = useRef<HTMLDivElement>(null);
  const {
    selection: storedSelection,
    setHairStyle,
    setBeardStyle,
    submitSelection,
  } = useStyleSelection();
  const selection = resolveStudioSelection(storedSelection);
  function commitVisiblePair() {
    setHairStyle(selection.hairStyleId);
    setBeardStyle(selection.beardStyleId);
  }
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
  const selectedHair = STYLE_ASSET_MANIFEST.hairStyles.find(
    (style) => style.id === selection.hairStyleId,
  )!;
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
          ? STYLE_ASSET_MANIFEST.hairStyles.map((style) => (
              <button
                type="button"
                key={style.id}
                className="style-option"
                aria-pressed={selection.hairStyleId === style.id}
                onClick={() => {
                  commitVisiblePair();
                  setHairStyle(style.id);
                }}
              >
                <span className="style-thumbnail">
                  <img
                    src={getStyleThumbnail("hair", style.id, selection)}
                    alt=""
                    loading="lazy"
                  />
                  {selection.hairStyleId === style.id && (
                    <Check size={12} className="style-check" />
                  )}
                </span>
                <span>{t(style.labelKey)}</span>
              </button>
            ))
          : STYLE_ASSET_MANIFEST.beardStyles.map(({ id, labelKey }) => (
              <button
                type="button"
                key={id}
                className="style-option"
                aria-pressed={selection.beardStyleId === id}
                onClick={() => {
                  commitVisiblePair();
                  setBeardStyle(id);
                }}
              >
                <span className="style-thumbnail">
                  <img
                    src={getStyleThumbnail("beard", id, selection)}
                    alt=""
                    loading="lazy"
                  />
                  {selection.beardStyleId === id && (
                    <Check size={12} className="style-check" />
                  )}
                </span>
                <span>{t(labelKey)}</span>
              </button>
            ))}
      </div>
      <div className="style-current" aria-live="polite">
        <span>{t("hero.selected")}</span>
        <strong>
          {t(selectedHair.labelKey)}
          <span className="combination-plus"> + </span>
          {t(`hero.beard.${selection.beardStyleId}`)}
        </strong>
      </div>
      <Link
        href={discoveryStyleHref(selection.hairStyleId)}
        className="style-cta"
        onClick={() => {
          commitVisiblePair();
          submitSelection();
        }}
      >
        {t("hero.find")}
        <ArrowRight size={18} />
      </Link>
      {!selection.isExactMatch && (
        <p className="style-availability-note">{t("hero.supportedNotice")}</p>
      )}
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
