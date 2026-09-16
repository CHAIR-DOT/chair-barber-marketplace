"use client";
import { publicPath } from "@/lib/public-path";

import { Check, ChevronDown, Globe2 } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useI18n } from "@/i18n/provider";
import { LOCALE_NAMES, SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import "./language-selector.css";

const FLAGS: Record<Locale, string> = {
  ka: "/images/flags/ge.svg",
  en: "/images/flags/gb.svg",
  ru: "/images/flags/ru.svg",
};

/** Focus stays on the trigger; the list remains inside the mobile header. */
export function LanguageSelector({ mobile = false }: { mobile?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef({ text: "", time: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [placement, setPlacement] = useState({
    top: 0,
    left: 0,
    width: 188,
    maxHeight: 160,
  });
  const selected = SUPPORTED_LOCALES.indexOf(locale);

  function show(index = selected) {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewport = window.visualViewport;
    const left = (viewport?.offsetLeft ?? 0) + 8;
    const top = (viewport?.offsetTop ?? 0) + 8;
    const right = left + (viewport?.width ?? window.innerWidth) - 16;
    const bottom = top + (viewport?.height ?? window.innerHeight) - 16;
    const below = bottom - rect.bottom - 8;
    const above = rect.top - top - 8;
    const useAbove = below < 160 && above > below;
    const height = Math.max(0, Math.min(160, useAbove ? above : below));
    const width = Math.min(Math.max(188, rect.width), right - left);
    setPlacement({
      top: Math.max(top, useAbove ? rect.top - height - 8 : rect.bottom + 8),
      left: Math.max(
        left,
        Math.min(mobile ? rect.left : rect.right - width, right - width),
      ),
      width,
      maxHeight: height,
    });
    setActive(index);
    setOpen(true);
  }

  function choose(index: number) {
    const next = SUPPORTED_LOCALES[index];
    if (next) setLocale(next);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  useEffect(() => setOpen(false), [locale]);

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent | FocusEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      )
        setOpen(false);
    }
    function close() {
      setOpen(false);
    }
    function onScroll(event: Event) {
      if (
        !(event.target instanceof Node) ||
        !listRef.current?.contains(event.target)
      )
        close();
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", onScroll, true);
    window.visualViewport?.addEventListener("resize", close);
    window.visualViewport?.addEventListener("scroll", close);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", onScroll, true);
      window.visualViewport?.removeEventListener("resize", close);
      window.visualViewport?.removeEventListener("scroll", close);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const option = list?.children[active] as HTMLElement | undefined;
    if (!list || !option) return;
    // Reveal the active item without scrolling the page or its mobile menu.
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    if (
      option.offsetTop + option.offsetHeight >
      list.scrollTop + list.clientHeight
    )
      list.scrollTop =
        option.offsetTop + option.offsetHeight - list.clientHeight;
  }, [active, open]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) show();
      else
        setActive(
          (index) =>
            (index +
              (event.key === "ArrowDown" ? 1 : SUPPORTED_LOCALES.length - 1)) %
            SUPPORTED_LOCALES.length,
        );
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const index = event.key === "Home" ? 0 : SUPPORTED_LOCALES.length - 1;
      if (!open) show(index);
      else setActive(index);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(active);
      else show();
      return;
    }
    if (
      event.key.length === 1 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {
      const now = Date.now();
      const prefix =
        (now - searchRef.current.time < 700 ? searchRef.current.text : "") +
        event.key.toLocaleLowerCase();
      searchRef.current = { text: prefix, time: now };
      const match = SUPPORTED_LOCALES.findIndex((value) =>
        LOCALE_NAMES[value].toLocaleLowerCase().startsWith(prefix),
      );
      if (match !== -1) {
        event.preventDefault();
        if (!open) show(match);
        else setActive(match);
      }
    }
  }

  return (
    <div
      ref={rootRef}
      className={`language-selector ${mobile ? "language-selector-mobile" : ""}`}
    >
      <button
        ref={triggerRef}
        type="button"
        className="language-trigger"
        role="combobox"
        aria-label={`${t("common.language")}: ${LOCALE_NAMES[locale]}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-activedescendant={
          open ? `${id}-${SUPPORTED_LOCALES[active]}` : undefined
        }
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
      >
        <Globe2 size={19} aria-hidden="true" />
        <span lang={locale}>{LOCALE_NAMES[locale]}</span>
        <ChevronDown
          className="language-chevron"
          size={14}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-label={t("common.language")}
          className="language-options"
          style={placement}
        >
          {SUPPORTED_LOCALES.map((value, index) => (
            <li
              id={`${id}-${value}`}
              key={value}
              role="option"
              aria-selected={value === locale}
              className={`language-option ${index === active ? "is-active" : ""}`}
              onPointerMove={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              <img
                src={publicPath(FLAGS[value])}
                width={22}
                height={16}
                alt=""
                aria-hidden="true"
              />
              <span lang={value}>{LOCALE_NAMES[value]}</span>
              {value === locale && (
                <Check
                  size={15}
                  className="language-check"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
