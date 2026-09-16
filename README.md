# CHAIR. — Barber marketplace prototype

A premium barber marketplace in Tbilisi, with a cinematic animated homepage poster and photography-led discovery. Built with Next.js App Router, React, TypeScript, Tailwind CSS, Lucide, and small reusable UI components. Everything is local and mocked.

Private source repository: [CHAIR-DOT/chair-barber-marketplace](https://github.com/CHAIR-DOT/chair-barber-marketplace). Primary branch: `main`; remote: `origin`.

## Continue in a new chat

Read [PROJECT_MEMORY.md](PROJECT_MEMORY.md) first. It records the current stopping point, completed work, important decisions, test results, known limitations, and the next action. [PROJECT_BRIEF.md](PROJECT_BRIEF.md) preserves the original request.

The user requires the memory file to be updated after every project-related work turn. [AGENTS.override.md](AGENTS.override.md) provides this standing project instruction while preserving the original read-only `AGENTS.md`.

For meaningful development tasks, test the changes, update the relevant memory sections, review the diff and staged files for secrets, then commit and push to the established GitHub repository. Keep code and memory together in the same commit whenever practical. Repository details and setup status are in `PROJECT_MEMORY.md`. Do not force-push or create a new repository for each task.

Start a new task in this same folder with: **“Read PROJECT_MEMORY.md and continue from the current stopping point. Keep it updated after every work turn.”** If the chat cannot access this folder, attach the memory file and provide the source project when editing or running it is needed.

## Run locally

Requires Node.js 20.9 or newer and npm. Dependencies are pinned in `package-lock.json`. The path below is this machine’s project folder; after cloning elsewhere, use your clone folder instead.

```bash
cd /Users/macuser/.codex/.chatgpt-projects/g-p-6aa958719c2081918e959be626523117
npm ci
npm run dev
```

Open **http://127.0.0.1:3000**. The development server binds only to this computer. Hero artwork, marketplace photos, flags, and fonts are included locally, so the running app does not depend on external asset services.

```bash
npm run typecheck
npm test
npm run build
npm start
```

Stop the development server before `npm start`, or use `npm start -- --port 3001` to run the production build separately. On this protected workspace, Next.js automatic instruction-file generation is disabled so it does not modify the read-only `AGENTS.md`.

`npm run typecheck` generates Next.js route declarations first, so it also works on a fresh checkout. Generated `next-env.d.ts`, `.next/`, dependencies, local environment files, logs, and editor/OS metadata are ignored by Git. An `.env.example` may be committed only with placeholder values; none is currently required.

## Explore

| Route                                   | What you can do                                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `/`                                     | Search, discover shops, explore styles and barbers                                                         |
| `/discover`                             | Filter location, distance, service, style, price, rating, date, availability, and experience; sort results |
| `/shops`, `/shops/[slug]`               | Shop discovery, galleries, services, team, and reviews                                                     |
| `/barbers`, `/barbers/[slug]`           | Barber discovery, portfolio lightbox, ratings, services, availability, and comparison                      |
| `/styles`, `/styles/[slug]`             | Visual style discovery and matching specialists                                                            |
| `/booking`                              | Shop → barber (or any) → service → date → time → review → confirmation                                     |
| `/login`, `/register`                   | Mock sign-in and customer/barber onboarding                                                                |
| `/account`                              | Sample customer overview                                                                                   |
| `/account/appointments`                 | View, cancel, reschedule, repeat a booking, review completed visits                                        |
| `/account/favorites`                    | Saved barbers, shops, and haircut styles                                                                   |
| `/account/reviews`, `/account/settings` | Local reviews and profile settings                                                                         |
| `/barber/dashboard`                     | Appointment overview, ratings, business metric concepts                                                    |
| `/barber/profile`                       | Edit name, bio, experience, specialties, and photo                                                         |
| `/barber/portfolio`                     | Add sample/local photos and remove portfolio items                                                         |
| `/barber/services`                      | Add a service and edit individual barber prices                                                            |
| `/barber/schedule`                      | Working days, hours, blocked starts, and days off                                                          |
| `/about`                                | Prototype details and an optional reset of local demo data                                                 |

Examples: `/barbers/giorgi-kapanadze`, `/shops/gentlemans-corner`, `/styles/skin-fade`.

Booking links accept `shop`, `barber`, and `service` IDs. Rescheduling uses `reschedule=<appointment-id>` and updates the existing appointment. Search links accept `location`, `service`, `style`, `date`, `availability`, and `q`.

## Architecture

```text
src/app/                 Route entry points, metadata, loading/error/not-found boundaries
src/components/          Marketplace, shared UI, profiles, booking, and dashboard surfaces
src/components/provider.tsx   Local state and domain actions; future repository boundary
src/lib/types.ts         Related domain entity interfaces
src/lib/data.ts          Shops, barbers, services, styles, appointments, reviews, portfolio, schedules
src/lib/booking.ts       Pure availability, overlap, price, and review-eligibility rules
src/lib/dates.ts         Internal calendar/date helpers using Asia/Tbilisi
src/i18n/                KA/EN/RU locale context, translation, display helpers, and metadata
src/i18n/messages/       Semantic dictionaries grouped by interface area and fixture content
src/components/language-selector.tsx   Accessible desktop/mobile language selector
src/lib/i18n.ts          Compatibility exports for the active localization system
public/images/           Local hero artwork, licensed illustrative photography, and SVG flags
public/images/hero/      Responsive cinematic poster images
src/components/barber-hero.tsx   Decorative hero composition and motion lifecycle
tests/domain.test.ts     Data relationships and booking/review domain checks
tests/i18n.test.ts       Dictionary coverage, formatting, fallback, and canonical-data preservation
```

The store owns mutations; screens consume shared entities and actions. Services have global definitions and per-barber price/eligibility relationships. Appointments snapshot price and duration. Reviews reference the customer, barber, and a completed appointment. The UI mounts after local storage is read, avoiding stale editor values and time-dependent server/client hydration differences.

## Cinematic homepage hero

The top homepage is a decorative motion poster: a black quilted leather barber chair, bronze metalwork, an arched mirror and an orderly grooming station in warm light. Local generated artwork provides the composition; restrained CSS movement adds a slow camera drift, light and atmosphere. It is part of the layout, with localized copy and links to barber discovery and salons.

`src/components/barber-hero.tsx` and its scoped CSS own the hero. No video player, canvas renderer or animation library is needed. The image remains visible with reduced motion, and animation pauses while the hero is offscreen or the document is hidden. Local static artwork supplies loading and media-failure fallbacks. Asset provenance, replacement instructions and the precise motion/fallback behavior are documented in [HERO_VISUAL_GUIDE.md](HERO_VISUAL_GUIDE.md).

The mannequin, grooming selectors, hotspots, rotation controls, Photo View and their renderer/assets/authoring pipeline have been removed. Three.js, its types, glTF Transform and Meshoptimizer dependencies are removed. The existing style inspiration provider/brief and `chair.style.v1` sessionStorage are retained for previously selected inspiration in discovery and booking. The hero does not create or change that state.

The improved flag language selector and existing light marketplace content remain intact. `PremiumSelect` and scoped filter CSS retain keyboard-accessible dropdowns, price fill/reset, real-state chips/counts and a mobile bottom sheet. The home More filters button passes current search fields plus `filters=open` to open that sheet on mobile. Existing filter meanings and sorting are unchanged.

## Localization

The frontend supports **ქართული (`ka`), English (`en`), and Русский (`ru`)**. Georgian is the first-visit default, including server-rendered text and metadata. Browser language does not select the initial language. After hydration, a valid saved preference is applied; switching language updates the interface immediately and keeps the existing URLs.

`LocaleProvider` and `useI18n()` in `src/i18n/provider.tsx` supply the selected locale, setter, translation function, and display helpers. `LanguageSelector` in `src/components/language-selector.tsx` is a labeled custom combobox with a globe, local SVG flags and selected check; the header includes it on desktop and within the mobile menu. The provider updates `<html lang>`, page titles, and the description to match the selected language.

The preference is stored under **`chair.locale.v1`**, separately from application data under **`chair.prototype.v1`**. Choosing a language changes presentation; it does not change prices, selected entities, booking state, favorites, account identity, or stored records. Invalid or absent preferences resolve to Georgian. If storage is unavailable, the selected language remains usable for the current session and a localized notice explains that it could not be saved.

### Translation and display files

| File                             | Responsibility                                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/i18n/config.ts`             | Supported locales, Georgian default, storage key, locale names, `Intl` locales, dictionary types     |
| `src/i18n/translate.ts`          | Semantic-key lookup, interpolation, numeric plural selection, English fallback, development warnings |
| `src/i18n/display.ts`            | Localized dates/numbers/GEL, safe fixture display helpers, localized error display                   |
| `src/i18n/metadata.ts`           | Route-aware client page titles while preserving canonical profile names                              |
| `src/i18n/messages/core.ts`      | Navigation, homepage, shared actions, notifications, validation, errors, metadata                    |
| `src/i18n/messages/discovery.ts` | Discovery, cards, profiles, styles, comparison                                                       |
| `src/i18n/messages/journey.ts`   | Booking, authentication, customer accounts, shared dashboard navigation                              |
| `src/i18n/messages/workspace.ts` | Barber management, reviews, portfolio                                                                |
| `src/i18n/messages/entities.ts`  | Generic service/style names, fixture descriptions, known role/location/status labels                 |
| `src/i18n/messages/style-hero.ts` | Current `homeHero` copy, shared legacy beard/inspiration labels and lower homepage filters          |
| `src/i18n/messages/index.ts`     | Combines all message groups for each locale                                                          |

Display uses `Intl` with `ka-GE`, `en-GB`, and `ru-RU`. If a browser lacks Georgian locale data, `src/i18n/dates.ts` uses the bundled month and weekday names in `messages/calendar.ts`, while `src/i18n/numbers.ts` preserves numeric precision, signs, and percentages with Georgian separators and grouping. The number helper is shared by display values, GEL amounts, and translation interpolation; it does not import dictionaries. Supported native locale formatting stays unchanged. Currency remains GEL with **₾** in every language. Dates remain in **Asia/Tbilisi**; stored `YYYY-MM-DD` dates and time values are unchanged. Native date/time picker panels and other browser-owned controls may follow browser or operating-system language. App labels, validation messages, date cards, and formatted date text use the selected app language.

The original locally bundled DM Sans and DM Serif Display remain the primary fonts. Locally bundled Noto Sans Georgian and Noto Serif Georgian supply Georgian characters. Arial and Georgia, followed by generic system fonts, supply Cyrillic fallback. Font rendering can vary slightly across operating systems; the app makes no remote font requests.

### Canonical content and future changes

Barber, shop, brand, and customer names remain canonical, as do IDs, slugs, URLs, relationships, prices, and account values. Customer-written reviews remain in their original language. Intentionally named portfolio works and user-authored descriptions are preserved. Generic seeded portfolio titles that equal their haircut category use the localized style name.

Entity display helpers translate supported fixture fields only when the entity ID and original field value still match the seed. Edited fields and new custom entities display their own text. Known generic role/location/status tokens and the system-generated default portfolio description have explicit mappings. Do not translate an entire record or write localized display text back into the mock store.

**Every newly introduced user-facing UI string must be added to the localization system in Georgian, English, and Russian. Do not introduce new hardcoded interface text.**

1. Add a semantic key to the appropriate message group. `defineMessages` rows use `[English, Georgian, Russian]`; groups declared as locale records require the same key in all three records. Keep keys unique across groups and interpolation fields identical across languages.
2. Render with `useI18n().t(key, values)` in client components; use `translate("ka", key, values)` for default server text. Pass numeric `count` values as numbers for `Intl.PluralRules`; add matching `.one` or other variants across dictionaries when needed, with grammatical base wording for fallback.
3. Use the shared `date`, `relativeDate`, `number`, and `money` helpers for display. Keep internal dates, route/query values, IDs, and selection state canonical. Store error/toast keys and interpolation values so open messages can change language too.
4. For new generic seed content, add entity translations and preserve the helper's ID/original-value checks. Render authored reviews, custom fields, and intentional work titles verbatim.
5. Run TypeScript and tests, build, inspect the affected interactions in all three languages, and check long copy at 375/768/1024/1440px. Update project memory with actual results before committing and pushing.

## What is mocked

- 8 fictional shops, 16 barbers, 45 reviews, 12 haircut styles, service menus, portfolios, and schedules.
- The customer workspace represents Alex Chikovani. The barber workspace represents Giorgi Kapanadze. Sign-in and registration are UI demonstrations of these roles, not separate real accounts.
- Bookings, favorites, reviews, profiles, prices, uploaded images, and schedules persist in this browser under `chair.prototype.v1`. Browser storage errors show a message and retain session state.
- Slot rules use Tbilisi time, working hours, days off, blocked start times, service eligibility/duration, and overlapping local appointments. “Any barber” resolves to a named eligible barber. Booking dates extend 30 days ahead.
- Review eligibility is simulated: only a completed appointment for the demo customer can receive a review, once. Optional dimension ratings are separate from overall rating.
- Profile views are explicitly illustrative. Other dashboard booking/revenue totals derive from sample appointments; no money is collected.
- Marketplace photos are illustrative stock images. The hero is a generated decorative scene. Neither establishes the real work, identities, premises or endorsement of fictional profiles. Sources and credits are in `ASSET-SOURCES.md`.
- No backend, database, production API, real authentication, payment processing, SMS, email, analytics, or remote uploads exist.

Photo uploads accept JPG, PNG, or WebP up to 600 KB and are saved as local data URLs. This is appropriate only for a small prototype. Booking availability is not coordinated across users or devices; backend transactions are needed before real reservations.

The optional, feature-detected WebMCP `set_saved_barber` tool uses the same favorites action as the visible heart buttons. It makes no external calls. Unsupported browsers retain all normal UI functionality.

## Verification

`npm test` includes domain and localization checks, canonical style IDs, temporary persistence validation and safe corrupt-state handling. It covers fixture relationships, schedule validity, overlapping durations, rescheduling, cancellation release, invalid and past dates, service eligibility, closing hours, the availability horizon, and completed-booking review eligibility.

Localization tests also cover dictionary parity and placeholders, default/fallback behavior, critical translated actions, plural and numeric formatting, unchanged canonical records, custom content, portfolio title rules, dates/GEL, and localized domain errors.

The browser verification log is in `VERIFICATION.md`. The design tokens and component conventions are in `DESIGN_SYSTEM.md`.

## Backend next steps

See `BACKEND_PLAN.md`: PostgreSQL/Supabase schema, server-enforced permissions, transactional bookings, verified reviews, object storage, payments, and notification jobs. Replace the local action boundary gradually while retaining the UI components.

Framework references: [Next.js documentation](https://nextjs.org/docs), [Tailwind CSS for Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs).
