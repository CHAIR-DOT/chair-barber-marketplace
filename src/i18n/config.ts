export const SUPPORTED_LOCALES = ["ka", "en", "ru"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ka";
export const LOCALE_STORAGE_KEY = "chair.locale.v1";
export const LOCALE_NAMES: Record<Locale, string> = {
  ka: "ქართული",
  en: "English",
  ru: "Русский",
};
export const INTL_LOCALES: Record<Locale, string> = {
  ka: "ka-GE",
  en: "en-GB",
  ru: "ru-RU",
};
export type Values = Record<string, string | number>;
export type Messages = Record<Locale, Record<string, string>>;
export function isLocale(value: unknown): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}
export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
// Each semantic key has English, Georgian, Russian; tuples require all three.
export function defineMessages(
  rows: Record<string, readonly [string, string, string]>,
): Messages {
  const result: Messages = { en: {}, ka: {}, ru: {} };
  for (const [key, values] of Object.entries(rows)) {
    result.en[key] = values[0];
    result.ka[key] = values[1];
    result.ru[key] = values[2];
  }
  return result;
}
