# CHAIR. design system

## Direction

A contemporary editorial marketplace with the warmth of a neighborhood barber. Cream paper, charcoal ink, considered copper accents, and large illustrative photography. Flat sections and fine rules provide structure; contained surfaces are reserved for search, booking summaries, selections, and dashboard data.

## Tokens

Defined in `src/app/globals.css`.

| Token  | Value / use                                                     |
| ------ | --------------------------------------------------------------- |
| Paper  | `#f8f7f3` — page background                                     |
| Ink    | `#262821` — headings, primary buttons                           |
| Muted  | `#75766e` — secondary copy                                      |
| Line   | `#dedfd7` — separators and light borders                        |
| Accent | `#a56041` — copper emphasis                                     |
| Soft   | `#eeeee6` — subtle inset surfaces                               |
| Green  | `#537452` — available/selected status                           |
| Serif  | DM Serif Display → Noto Serif Georgian → Georgia → system serif |
| Sans   | DM Sans → Noto Sans Georgian → Arial → system sans              |

## Typography and spacing

- Editorial display headings use the serif. Controls, cards, and data use the sans.
- DM fonts and Noto Georgian fonts are bundled locally. Georgian characters use the Noto faces; Cyrillic falls back to system Georgia/Arial as needed. Keep the original serif/sans distinction across all three scripts. Georgian headings have a slightly taller line height for legibility.
- Desktop hero: 70px maximum; mobile hero: 48px. Route headings scale from 38px to 55px. Body: 16px; supporting descriptions and controls: generally 12–14px; smaller text is secondary metadata.
- Main layout: maximum 1280px with responsive side gutters of 48px, 28px, 20px, and 18px.
- Section rhythm: 30–60px; internal groups: 12–28px. Use consistent spaces between labels, fields, and actions.

## Components

- Buttons: dark primary, bordered secondary, copper emphasis, light on dark. Text links use Lucide directional icons.
- Inputs: native accessible controls with explicit labels, subtle borders, clear selected/disabled/error states.
- Cards: images with modest 5–6px corner rounding, details underneath, divider before secondary actions.
- Badges: quiet rectangular labels. Verification badges are explicitly demo concepts.
- Ratings: star plus numeric value and review count; breakdowns derive from reviews.
- Dialogs: native `<dialog>` for focus containment, Escape dismissal, and focus restoration. Background scrolling locks while open.
- Favorites: immediate pressed state, accessible save/unsave labels, local persistence.
- Motion: short transform/color transitions; reduced-motion preferences suppress animation.
- Keyboard: visible focus rings, skip link, labeled controls, accessible gallery and review rating controls.
- Language selector: globe, current endonym and chevron with a viewport-clamped custom listbox. Local SVG GE/GB/RU flags, selected check and visible focus; arrows/Home/End/typeahead, Enter, Escape and Tab. Dark glass on the home hero, light on other routes; mobile remains inside the navigation menu.

## Language and content

- Georgian (`ka`) is the default. English (`en`) and Russian (`ru`) are available immediately through the selector. The preference uses the separate `chair.locale.v1` localStorage key; it does not change the prototype data in `chair.prototype.v1` or introduce locale-prefixed URLs.
- **Every newly introduced user-facing UI string must be added to the localization system in Georgian, English, and Russian. Do not introduce new hardcoded interface text.** This includes invisible accessibility labels, placeholders, validation, notices, dialogs, and empty states.
- Use semantic messages under `src/i18n/messages/` and the shared `useI18n()` display helpers. Keep placeholders identical across languages; keep numeric counts numeric so plural selection works. See [README.md](README.md#localization) for the authoring workflow.
- Keep barber/shop/customer/brand names, intentionally named portfolio works, and authored reviews unchanged. Generic service/style names and original fixture descriptions localize at display time. Custom edits remain verbatim; do not overwrite saved records with translated text.
- Format numbers and dates for the selected language while retaining GEL `₾`, `Asia/Tbilisi`, and the same underlying dates, prices, and availability. Native date/time picker panels and browser-owned controls can follow browser/OS language; application labels and validation remain localized.

## Responsive behavior

- Full navigation transitions to a compact menu.
- Discovery uses a desktop sidebar and the existing native dialog styled as a mobile bottom sheet.
- Four-column barber grids reduce to two compact columns; shop listings reduce to one.
- Booking summaries move below the flow on tablets and phones; the review step always shows the full summary.
- Profile booking actions become a fixed bottom bar on narrow screens.
- Dashboard side navigation becomes a horizontal compact navigation row; data tables scroll within their own region.
- Use 375, 768, 1024, and 1440px as review widths in all three languages. Check long Georgian and Russian labels, buttons, profile tabs, and navigation. Allow wrapping or contained tab scrolling while preserving the existing composition; avoid horizontal page overflow. Actual check results belong in `VERIFICATION.md`.

## Interactive homepage studio

The top hero uses charcoal `#171b18`, warm gold `#e2bf85`, cream typography and a restrained translucent configurator. The existing navigation keeps its structure and changes color only on the homepage. The lower marketplace keeps its original sections/cards and light palette.

Desktop: copy, central 3D portrait, panel. Tablet: copy above portrait with adjacent panel. At ≤650px the portrait and panel stack, with all three choices visible in a compact grid. Use translated labels and visible focus on all category, rotation, thumbnail and CTA controls. The real category controls duplicate the hotspots for accessibility. Avoid continuous animation; respect reduced motion and never lock hero scrolling.

Hair and beard choices toggle three independently authored groups per category on one CC0 human. A shared registry drives labels and same-human render thumbnails. Preserve the illustrative-style note: this temporary asset does not yet meet the photographic reference. Matching Photo View appears during loading and on failure, and is also a manual option. Keep camera framing stable across the nine combinations, and use the same portrait in every preview. See `STYLE_ASSET_GUIDE.md`. The hero grows with content; model tools and credits remain in normal flow.

`PremiumSelect` uses a labeled combobox/listbox with keyboard navigation, selected checks and outside dismissal. All filter chips and counts derive from real state. GEL max-price remains 15–100 / step 5; resetting filters keeps the selected sort. Use scoped component CSS instead of changing marketplace cards.
