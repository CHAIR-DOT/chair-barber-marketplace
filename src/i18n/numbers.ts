import { INTL_LOCALES, type Locale } from "./config";

/** Locale-aware numeric presentation, including browsers without Georgian Intl data. */
export function formatLocalizedNumber(
  locale: Locale,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  const formatter = new Intl.NumberFormat(INTL_LOCALES[locale], options);
  if (
    locale !== "ka" ||
    formatter.resolvedOptions().locale.split("-")[0] === "ka"
  )
    return formatter.format(value);

  // Keep Intl's rounding, precision, sign, and percent handling. Substitute only
  // Georgian separators and its default grouping threshold (five integer digits).
  const parts = new Intl.NumberFormat("en-GB", options).formatToParts(value);
  const integerDigits = parts
    .filter((part) => part.type === "integer")
    .reduce((length, part) => length + [...part.value].length, 0);
  const forcedGrouping =
    options?.useGrouping === true || options?.useGrouping === "always";
  return parts
    .map((part) => {
      if (part.type === "decimal") return ",";
      if (part.type === "group")
        return forcedGrouping || integerDigits >= 5 ? "\u00a0" : "";
      return part.value;
    })
    .join("");
}
