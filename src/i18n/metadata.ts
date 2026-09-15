import { DEFAULT_LOCALE, type Locale } from "./config";
import { createDisplay } from "./display";
import { shops, barbers, styles } from "../lib/data";

const topLevelPages = [
  "discover",
  "shops",
  "barbers",
  "styles",
  "booking",
  "login",
  "register",
  "account",
  "about",
];
const accountSections = ["appointments", "favorites", "reviews", "settings"];
const barberSections = [
  "dashboard",
  "profile",
  "portfolio",
  "services",
  "schedule",
];

export function localizedPageTitle(
  path: string,
  locale: Locale = DEFAULT_LOCALE,
) {
  const { t, styleName } = createDisplay(locale);
  const parts = path.split("/").filter(Boolean);
  const notFound = `${t("metadata.notFound")} | CHAIR.`;
  if (parts.length === 0) return `CHAIR. — ${t("metadata.home")}`;
  if (parts.length === 1)
    return topLevelPages.includes(parts[0])
      ? `${t(`metadata.${parts[0]}`)} | CHAIR.`
      : notFound;
  if (parts.length !== 2) return notFound;

  const [section, slug] = parts;
  if (section === "barbers") {
    const barber = barbers.find((b) => b.slug === slug);
    return barber ? `${barber.name} | CHAIR.` : notFound;
  }
  if (section === "shops") {
    const shop = shops.find((s) => s.slug === slug);
    return shop ? `${shop.name} | CHAIR.` : notFound;
  }
  if (section === "styles") {
    const style = styles.find((s) => s.slug === slug);
    return style
      ? `${t("metadata.style", { style: styleName(style) })} | CHAIR.`
      : notFound;
  }
  if (
    (section === "account" && accountSections.includes(slug)) ||
    (section === "barber" && barberSections.includes(slug))
  )
    return `${t(`metadata.${slug}`)} | CHAIR.`;
  return notFound;
}
