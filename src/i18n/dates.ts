import { TIME_ZONE } from "../lib/dates";
import { INTL_LOCALES, type Locale } from "./config";
import { translate } from "./translate";

function georgianDate(
  value: Date,
  options: Intl.DateTimeFormatOptions,
): string {
  let { day, month, year, weekday } = options;
  // Match Intl's date-only default when callers explicitly omit every component.
  if (!day && !month && !year && !weekday) {
    day = "numeric";
    month = "numeric";
    year = "numeric";
  }
  const numeric = (number: number, width: "numeric" | "2-digit") =>
    width === "2-digit" ? String(number).padStart(2, "0") : String(number);
  const dayText = day ? numeric(value.getUTCDate(), day) : "";
  const yearText = year
    ? year === "2-digit"
      ? String(value.getUTCFullYear()).slice(-2).padStart(2, "0")
      : String(value.getUTCFullYear())
    : "";
  const numericMonth = month === "numeric" || month === "2-digit";
  const monthText = month
    ? month === "numeric" || month === "2-digit"
      ? numeric(value.getUTCMonth() + 1, month)
      : translate("ka", `calendar.month.${month}.${value.getUTCMonth() + 1}`)
    : "";
  let dateText: string;
  if (numericMonth) {
    dateText = [dayText, monthText, yearText].filter(Boolean).join(".");
  } else {
    const namedMonth =
      month === "short" && yearText ? `${monthText}.` : monthText;
    dateText = [dayText, namedMonth].filter(Boolean).join(" ");
    if (yearText)
      dateText += `${dateText ? (month === "long" ? ", " : " ") : ""}${yearText}`;
  }
  const weekdayText = weekday
    ? translate("ka", `calendar.weekday.${weekday}.${value.getUTCDay()}`)
    : "";
  return [weekdayText, dateText].filter(Boolean).join(", ");
}

/** Presentation for canonical YYYY-MM-DD values; never changes stored dates. */
export function formatLocalizedDate(
  locale: Locale,
  value: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const settings: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    ...options,
    timeZone: TIME_ZONE,
  };
  const date = new Date(`${value}T12:00:00Z`);
  const formatter = new Intl.DateTimeFormat(INTL_LOCALES[locale], settings);
  const resolvedLanguage = formatter.resolvedOptions().locale.split("-")[0];
  if (
    locale !== "ka" ||
    resolvedLanguage === "ka" ||
    !Number.isFinite(date.valueOf())
  )
    return formatter.format(date);
  // UTC noon has the same calendar date in Asia/Tbilisi. Read its UTC fields,
  // so unsupported Intl locale data cannot leak the device language into the UI.
  return georgianDate(date, settings);
}
