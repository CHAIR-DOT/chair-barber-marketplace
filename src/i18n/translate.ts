import { INTL_LOCALES, type Locale, type Values } from "./config";
import { messages } from "./messages";
import { formatLocalizedNumber } from "./numbers";
const missing = new Set<string>();
export function hasTranslation(key: string) {
  return Object.hasOwn(messages.en, key);
}
export function translate(
  locale: Locale,
  key: string,
  values: Values = {},
  fallback?: string,
): string {
  const category =
    typeof values.count === "number"
      ? new Intl.PluralRules(INTL_LOCALES[locale]).select(values.count)
      : "";
  const pluralKey = category ? `${key}.${category}` : key;
  const selected = Object.hasOwn(messages[locale], pluralKey) ? pluralKey : key;
  const value =
    messages[locale][selected] ??
    messages.en[selected] ??
    messages.en[key] ??
    fallback ??
    key;
  if (
    process.env.NODE_ENV !== "production" &&
    !messages[locale][selected] &&
    fallback === undefined &&
    !missing.has(`${locale}:${selected}`)
  ) {
    missing.add(`${locale}:${selected}`);
    console.warn(`[i18n] Missing translation ${locale}:${selected}`);
  }
  return value.replace(/\{(\w+)\}/g, (token, name) =>
    values[name] === undefined
      ? token
      : typeof values[name] === "number"
        ? formatLocalizedNumber(locale, values[name])
        : String(values[name]),
  );
}
