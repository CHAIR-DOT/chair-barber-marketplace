// Keep locale selection separate from domain IDs and repository data.
export const defaultLocale = "en";
export type Locale = "en" | "ka";
export const messages = {
  en: {
    discover: "Discover",
    shops: "Barber shops",
    barbers: "Barbers",
    book: "Book appointment",
    save: "Save",
    cancel: "Cancel",
    currency: "GEL",
  },
  ka: {
    discover: "აღმოაჩინე",
    shops: "ბარბერშოპები",
    barbers: "ბარბერები",
    book: "დაჯავშნა",
    save: "შენახვა",
    cancel: "გაუქმება",
    currency: "GEL",
  },
};
export const t = (
  key: keyof typeof messages.en,
  locale: Locale = defaultLocale,
) => messages[locale][key];
