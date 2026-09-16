import { defineMessages } from "../config";

export const filtersMessages = defineMessages({
  "filters.active": ["Active filters", "აქტიური ფილტრები", "Активные фильтры"],
  "filters.remove": [
    "Remove filter: {name}",
    "ფილტრის მოხსნა: {name}",
    "Убрать фильтр: {name}",
  ],
  "filters.clearAll": ["Clear all", "ყველას გასუფთავება", "Сбросить всё"],
  "filters.resetPrice": ["Reset price", "ფასის განულება", "Сбросить цену"],
  "filters.search": ["Search: {query}", "ძებნა: {query}", "Поиск: {query}"],
  "filters.price": ["Up to {price}", "{price}-მდე", "До {price}"],
  "filters.rating": [
    "Rating: {rating}+",
    "შეფასება: {rating}+",
    "Оценка: {rating}+",
  ],
  "filters.experience": [
    "Experience: {count}+ years",
    "გამოცდილება: {count}+ წელი",
    "Опыт: от {count} лет",
  ],
  "filters.distance": [
    "Within {count} km",
    "{count} კმ-ის ფარგლებში",
    "В пределах {count} км",
  ],
});
