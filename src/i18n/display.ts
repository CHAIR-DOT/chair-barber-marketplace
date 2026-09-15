import * as fixtures from "../lib/data";
import { addDays, today } from "../lib/dates";
import type {
  Barber,
  BarberShop,
  HaircutStyle,
  PortfolioItem,
  Service,
} from "../lib/types";
import type { Locale, Values } from "./config";
import { labelKeys } from "./messages/entities";
import { hasTranslation, translate } from "./translate";
import { formatLocalizedDate } from "./dates";
import { formatLocalizedNumber } from "./numbers";
export function createDisplay(locale: Locale) {
  const t = (key: string, values?: Values, fallback?: string) =>
    translate(locale, key, values, fallback);
  const number = (value: number, options?: Intl.NumberFormatOptions) =>
    formatLocalizedNumber(locale, value, options);
  const date = (value: string, options?: Intl.DateTimeFormatOptions) =>
    formatLocalizedDate(locale, value, options);
  function unchanged<T extends { id: string }>(
    items: T[],
    entity: T,
    field: keyof T,
    key: string,
  ): string {
    const original = items.find((item) => item.id === entity.id);
    const raw = String(entity[field] ?? "");
    return original && original[field] === entity[field] && hasTranslation(key)
      ? t(key)
      : raw;
  }
  const label = (value: string) =>
    labelKeys[value] ? t(labelKeys[value]) : value;
  const styleName = (style: HaircutStyle) =>
    unchanged(fixtures.styles, style, "name", `data.styles.${style.id}.name`);
  return {
    t,
    number,
    date,
    money: (value: number) => `₾${number(value)}`,
    relativeDate: (value: string) =>
      value === today()
        ? t("common.today")
        : value === addDays(1)
          ? t("common.tomorrow")
          : date(value, { weekday: "short" }),
    label,
    styleName,
    styleDescription: (style: HaircutStyle) =>
      unchanged(
        fixtures.styles,
        style,
        "description",
        `data.styles.${style.id}.description`,
      ),
    serviceName: (service: Service) =>
      unchanged(
        fixtures.services,
        service,
        "name",
        `data.services.${service.id}.name`,
      ),
    serviceDescription: (service: Service) =>
      unchanged(
        fixtures.services,
        service,
        "description",
        `data.services.${service.id}.description`,
      ),
    shopDescription: (shop: BarberShop) =>
      unchanged(
        fixtures.shops,
        shop,
        "description",
        `data.shops.${shop.id}.description`,
      ),
    barberTitle: (barber: Barber) => label(barber.role),
    barberBio: (barber: Barber) =>
      unchanged(
        fixtures.barbers,
        barber,
        "bio",
        `data.barbers.${barber.id}.bio`,
      ),
    portfolioTitle: (item: PortfolioItem) => {
      const original = fixtures.portfolio.find((p) => p.id === item.id);
      const style = fixtures.styles.find((s) => s.id === item.styleIds[0]);
      return original &&
        item.title === original.title &&
        style?.name === item.title
        ? styleName(style)
        : item.title;
    },
    portfolioDescription: (item: PortfolioItem) => {
      if (item.description === "A new look from your local demo portfolio.")
        return t("data.portfolio.newDescription");
      const original = fixtures.portfolio.find((p) => p.id === item.id);
      const index = [
        ...new Set(fixtures.portfolio.map((p) => p.description)),
      ].indexOf(item.description);
      return original?.description === item.description && index >= 0
        ? t(`data.portfolio.description${index}`)
        : item.description;
    },
    errorText: (error: unknown) => {
      const key =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "";
      return hasTranslation(key) ? t(key) : t("errors.unexpected");
    },
  };
}
