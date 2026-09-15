"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { createDisplay } from "./display";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  isLocale,
  resolveLocale,
  type Locale,
} from "./config";
import { localizedPageTitle } from "./metadata";
type ContextValue = ReturnType<typeof createDisplay> & {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};
const Context = createContext<ContextValue | null>(null);
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [storageFailed, setStorageFailed] = useState(false);
  const pathname = usePathname();
  const display = useMemo(() => createDisplay(locale), [locale]);
  useEffect(() => {
    try {
      updateLocale(resolveLocale(localStorage.getItem(LOCALE_STORAGE_KEY)));
    } catch {
      /* Georgian remains the first-visit default when storage is unavailable. */
    }
    const sync = (event: StorageEvent) => {
      if (event.key === LOCALE_STORAGE_KEY)
        updateLocale(resolveLocale(event.newValue));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    updateLocale(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
      setStorageFailed(false);
    } catch {
      setStorageFailed(true);
    }
  }, []);
  useEffect(() => {
    const title = localizedPageTitle(pathname, locale);
    const description = display.t("metadata.description");
    const syncMetadata = () => {
      if (document.documentElement.lang !== locale)
        document.documentElement.lang = locale;
      if (document.title !== title) document.title = title;
      const meta = document.head.querySelector<HTMLMetaElement>(
        'meta[name="description"]',
      );
      if (meta && meta.content !== description) meta.content = description;
    };
    syncMetadata();
    // Next can finish streaming Georgian server metadata after locale hydration.
    // Idempotent writes keep the selected language without observer loops.
    const observer = new MutationObserver(syncMetadata);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["content", "name"],
    });
    return () => observer.disconnect();
  }, [locale, pathname, display]);
  useEffect(() => {
    // Preserve native constraints and submission behavior, localize only their messages.
    const field = (target: EventTarget | null) =>
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
        ? target
        : null;
    const localize = (
      element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    ) => {
      element.setCustomValidity("");
      const validity = element.validity;
      if (validity.valid) {
        delete element.dataset.localizedValidation;
        return;
      }
      let key = "validation.invalid";
      if (validity.valueMissing) key = "validation.required";
      else if (
        validity.typeMismatch &&
        element instanceof HTMLInputElement &&
        element.type === "email"
      )
        key = "validation.email";
      else if (validity.tooShort) key = "validation.short";
      else if (validity.tooLong) key = "validation.long";
      else if (
        validity.rangeOverflow ||
        validity.rangeUnderflow ||
        validity.stepMismatch
      )
        key = "validation.range";
      const textField = element instanceof HTMLSelectElement ? null : element;
      element.setCustomValidity(
        display.t(key, {
          min: textField?.minLength ?? 0,
          max: textField?.maxLength ?? 0,
        }),
      );
      element.dataset.localizedValidation = "true";
    };
    const invalid = (event: Event) => {
      const element = field(event.target);
      if (element) localize(element);
    };
    const input = (event: Event) => {
      const element = field(event.target);
      if (element?.dataset.localizedValidation) {
        element.setCustomValidity("");
        delete element.dataset.localizedValidation;
      }
    };
    document
      .querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("[data-localized-validation]")
      .forEach(localize);
    document.addEventListener("invalid", invalid, true);
    document.addEventListener("input", input, true);
    document.addEventListener("change", input, true);
    return () => {
      document.removeEventListener("invalid", invalid, true);
      document.removeEventListener("input", input, true);
      document.removeEventListener("change", input, true);
    };
  }, [display]);
  const value = useMemo(
    () => ({ ...display, locale, setLocale }),
    [display, locale, setLocale],
  );
  return (
    <Context.Provider value={value}>
      {children}
      {storageFailed && (
        <div className="locale-storage-notice" role="status">
          {display.t("common.languageSession")}
        </div>
      )}
    </Context.Provider>
  );
}
export function useI18n() {
  const context = useContext(Context);
  if (!context) throw new Error("LocaleProvider is required");
  return context;
}
