"use client";
import { Languages } from "lucide-react";
import { useId } from "react";
import { useI18n } from "@/i18n/provider";
import { isLocale, LOCALE_NAMES, SUPPORTED_LOCALES } from "@/i18n/config";
export function LanguageSelector({ mobile = false }: { mobile?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const id = useId();
  return (
    <div
      className={`language-selector ${mobile ? "language-selector-mobile" : ""}`}
    >
      <Languages size={17} aria-hidden="true" />
      <label className="sr-only" htmlFor={id}>
        {t("common.language")}
      </label>
      <select
        id={id}
        value={locale}
        onChange={(event) => {
          if (isLocale(event.target.value)) setLocale(event.target.value);
        }}
      >
        {SUPPORTED_LOCALES.map((value) => (
          <option key={value} value={value} lang={value}>
            {LOCALE_NAMES[value]}
          </option>
        ))}
      </select>
    </div>
  );
}
