# CHAIR. — Project Memory

## Project Overview

CHAIR. is a premium barber marketplace in Tbilisi, Georgia. Customers discover shops and individual barbers, compare portfolios/reputation/prices, choose a specialist, and book a service. Individual barber reputation is central to the product. The original specification is preserved in [PROJECT_BRIEF.md](PROJECT_BRIEF.md).

ChatGPT project: **BARBER**. Current local workspace:

```text
/Users/macuser/.codex/.chatgpt-projects/g-p-6aa958719c2081918e959be626523117
```

Continue the existing application; do not create a new scaffold. Root `AGENTS.md` and synced `sources/` material are read-only. Do not edit, rename, move, or delete them.

## Current Development Phase

**Frontend prototype using local mock data.** Discovery, profiles, booking, customer accounts and barber management work within the prototype's limits. Local preview: `http://127.0.0.1:3000`. The user authorized GitHub Pages publication on 2026-09-16 and explicitly approved making this repository public after GitHub rejected private-repository Pages on the current plan. Backend work remains deferred.

**Hero status — 2026-09-16:** The user abandoned the mannequin direction. The homepage now uses a noninteractive **cinematic CSS motion poster**: a leather/bronze barber chair, arched mirror and arranged grooming tools, slow camera drift and warm light. All mannequin controls, scene logic, GLB/preview assets, registry and authoring pipeline are removed. The improved flag language dropdown and lower homepage are preserved. `HERO_VISUAL_GUIDE.md` records the current approach; do not resume retired 3D work from historical notes.

Current deployment checks: 30 tests, TypeScript, normal and static production builds pass. The public Pages site is live and verified; see Deployment and Verification below. Historical hero checks covered 36 layout cases, 18 language-menu cases, real image-load failure, emulated reduced motion, offscreen pause and navigation. The original localhost-3000 browser data is preserved. This is decorative generated artwork with CSS motion, not an object-assembly simulation or live video.

## Mandatory Development Workflow

The user requires these rules even without a reminder:

1. Read this file and project instructions before code changes; inspect relevant existing files. Actual code is authoritative. Correct stale memory when found.
2. Implement requested changes, test appropriately, and fix errors caused by them.
3. Update existing sections to reflect current architecture, routes, models, feature statuses, issues, and next steps. Keep Recent Changes concise; this is current truth plus important history, not an infinite chat log.
4. For each meaningful development task, review `git diff`, `git status`, and staged content for secrets/generated files; make a descriptive commit and push to the established repository. Include code and memory in the same commit whenever practical.
5. Preserve unrelated user edits and existing history. No force-push/history rewriting without explicit approval. Do not create a new repository per task. Use secure browser/device authentication; never request secrets in chat or store them in project files.
6. Verify push/upstream and expected working-tree state. If user authentication is needed, preserve local progress, record the exact blocker, and request only the required action.
7. Update memory on every project work turn, including decisions/investigations, and at major checkpoints. The main agent owns memory updates during parallel work.

Before finishing: **Could another AI with only this repository and this file continue safely?** If not, improve the handoff. Distinguish fresh checks from historical results.

For a new chat, use this folder or provide the repository and say: **“Read PROJECT_MEMORY.md and continue development.”** `AGENTS.override.md` supplies the read/update/Git rules while preserving the original synced instructions. The chat needs access to these files; memory alone cannot restore source files or browser storage.

## Tech Stack

| Technology                    | Version / role                            |
| ----------------------------- | ----------------------------------------- |
| Next.js                       | 16.3.5, App Router                        |
| React / React DOM             | 19.3.0                                    |
| TypeScript                    | 7.0.2                                     |
| Tailwind CSS / PostCSS plugin | 4.3.3                                     |
| Lucide React                  | 1.46.0                                    |
| DM Sans / DM Serif Display    | 5.3.0 packages, original Latin typography |
| Noto Sans / Serif Georgian    | 5.3.0 packages, local Georgian fallbacks  |
| CSS keyframes / local WebP    | Decorative hero; no Three.js or animation library |
| tsx / Prettier                | 4.23.13 / 3.9.6                           |

`package.json` and `package-lock.json` are authoritative. Documented minimum: Node >=20.9; current machine: Node 25.2.1/npm 11.6.2. Do not upgrade just to resume work.

```bash
npm ci
npm run dev
```

Install only when dependencies are missing or a clean install is needed. Checks: `npm run typecheck` (Next type generation then TypeScript), `npm test`, `npm run build`. No lint script is configured. Production check example: start `npm start -- --port 3001` in a separate terminal, then `npm run check:routes -- http://127.0.0.1:3001` from the project root. Verify port/process ownership and preserve the user's preview.

## Project Structure

| Path                                               | Responsibility                                                                                        |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/app/`                                         | Routes, metadata, layout, loading/error/not-found boundaries                                          |
| `src/app/globals.css`                              | Theme, component styles, responsive layouts                                                           |
| `src/components/`                                  | Shared UI and marketplace/customer/barber surfaces                                                    |
| `src/lib/types.ts`, `data.ts`                      | Domain contracts and interconnected fixtures                                                          |
| `src/lib/booking.ts`                               | Availability, price, ratings, booking/review rules                                                    |
| `src/lib/dates.ts`                                 | Canonical Tbilisi date arithmetic and time helpers                                                    |
| `src/i18n/`                                        | Three-language catalogs, context, date/number/entity display and metadata helpers                     |
| `src/lib/i18n.ts`                                  | Compatibility exports for the localization boundary                                                   |
| `public/images/hero/` | Three compressed renditions of the generated barber-chair artwork |
| `src/lib/style-selection.ts`, `tests/style-selection.test.ts` | Canonical temporary inspiration state, validation and tests |
| `HERO_VISUAL_GUIDE.md`, `docs/hero-artwork-prompt.md` | Current hero pipeline, hashes, prompt and replacement workflow |
| `public/images/`, `public/favicon.svg`             | 25 local stock JPGs, three hero WebPs, three project-authored SVG flags and brand icon                                                                    |
| `tests/domain.test.ts`, `tests/i18n.test.ts`       | Domain/fixtures, locale defaults/catalog parity, formatting, preservation and route-title regressions |
| `.github/workflows/deploy-pages.yml`, `src/lib/public-path.ts` | Pages CI deployment and native URL prefix handling |
| `src/app/{discover,booking,register}/query-client.tsx` | Static-compatible query readers under Suspense |
| `scripts/check-routes.ts`                          | Valid/invalid-route and image HTTP checks                                                             |
| `PROJECT_MEMORY.md`, `AGENTS.override.md`          | Current project truth and mandatory workflow                                                          |
| `PROJECT_BRIEF.md`                                 | Verbatim original product brief                                                                       |
| `README.md`, `DESIGN_SYSTEM.md`, `VERIFICATION.md` | Setup, visual conventions, validation evidence                                                        |
| `ASSET-SOURCES.md`, `BACKEND_PLAN.md`              | Photography credits and future integration plan                                                       |

Dependencies, build output, generated `next-env.d.ts`, caches, local configuration and synced reference material are ignored by Git. Empty `sources/` is not application source; preserve local synced references without uploading them automatically.

## Architecture

- `LocaleProvider` wraps `StyleSelectionProvider`, which wraps `MockProvider` and supplies language/display helpers without remounting the store. `MockProvider` in `provider.tsx` owns shared state and mutations. Screens consume common entities/actions; this is the future asynchronous repository/API boundary.
- Storage key: **`chair.prototype.v1`**, shape `{version: 1, data: MockState}`. Persistent collections: favorites, appointments, reviews, barbers, services, portfolio, availability, user. Comparison is temporary in-memory state, capped at 3 barbers.
- Preserve the provider's `ready` gate and synchronous `stateRef`; they prevent hydration problems and stale editor defaults overwriting saved details. Mount dependent editors after hydration.
- Services have global definitions and barber eligibility/price relationships. Appointments snapshot price/duration; reviews link a completed visit, customer, and barber.
- Date/money helpers use **Asia/Tbilisi** and GEL. Seed dates are generated when modules initialize; persisted visits retain their dates and may later become overdue.
- All photos/fonts are local. Portfolio seed images and their correction migration follow style tags while preserving added items.
- Detail/section routes use static parameters and `dynamicParams = false` for correct unknown-path 404s.
- Preserve **`agentRules: false`** in `next.config.ts`: Next otherwise tried to append generated instructions to the protected `AGENTS.md` and failed with EACCES. `poweredByHeader` and `devIndicators` are also disabled.
- The route checker wraps work in `async main()` for the installed tsx execution mode and reads images relative to the project root.

## Homepage Hero and Filter Architecture

- **Components:** `src/components/barber-hero.tsx` and `barber-hero.css`; `app/page.tsx` only swaps the hero import/component. Copy, two CTAs and footer captions are ordinary localized HTML. Desktop has left copy and right cinematic artwork; mobile stacks text above a portrait crop. No canvas, mannequin selectors, hotspots, rotation or Photo View state remain. The noninteractive artwork is `aria-hidden` and does not intercept clicks/touch scrolling.
- **Artwork:** `public/images/hero/barber-atelier.webp` (1536×1024, 171,316 bytes), `barber-atelier-mobile.webp` (960×640, 60,692 bytes) and `barber-atelier-poster.webp` (480×320, 14,518 bytes). All share the same 3:2 generated scene. Main picture uses the smaller rendition at ≤800px. The 246,526-byte total is checked-in size, not per-visitor transfer. Desktop contains the chair and tools with an edge fade; mobile uses centered 64% horizontal cropping. No hotlinks.
- **Provenance:** Built-in image generation created the fictional interior for this project. `docs/hero-artwork-prompt.md` stores the exact prompt; `HERO_VISUAL_GUIDE.md` stores source details, output hashes and replacement instructions. This is not a photograph of a listed salon; former human asset licenses do not apply. Existing marketplace stock credits are unchanged.
- **Animation:** CSS transform/opacity only. Camera scales 1→1.035 and drifts −0.6% horizontally / 0.2% vertically over 20 seconds, then reverses over 20 seconds; warm light follows the same 40-second full cycle. Three subtle dust points alternate every 10 seconds. Identical turn-around endpoints avoid loop resets. No animation library, video, audio, autoplay controls or per-frame JavaScript. IntersectionObserver, document visibility and matchMedia control pause state; effects clean up on unmount.
- **Loading/recovery:** A 480px CSS poster sits beneath the main picture. Main image fades in for 700ms only after successful load. Before load, with no JS, or after failure, the still remains and motion is paused. A later healthy responsive source clears the error. If all images fail, charcoal/bronze gradients and an architectural arch remain behind the copy; no broken foreground image is shown.
- **Reduced motion:** `prefers-reduced-motion: reduce` removes camera motion, light/dust and fade while retaining the artwork and all content. Offscreen/document-hidden states pause running CSS animations. Real-phone performance and formal accessibility are not measured.
- **Navigation/state:** CTAs go directly to `/discover` and `/shops`. They do not create or clear inspiration. Existing `chair.style.v1` data is retained for earlier submitted discovery/booking briefs; `setHairStyle` and `clearSelection` remain used outside the hero. Removed only unused `setBeardStyle`, `submitSelection` and former hero URL helper. Preserve existing beard/submitted fields and the six shared beard labels. New visitors cannot create a mannequin brief because that UI is retired.
- **Cleanup/dependencies:** Removed `interactive-style-hero.*`, `style-scene.ts`, `style-assets.ts`, model/report, nine combination previews, old authoring scripts/docs and two model-specific tests. Three.js/types, glTF Transform and Meshoptimizer are removed from package/lock. No dependency added; `sharp` remains for image optimization. Historical 3D assets can be found in commit `aed398e` if needed for archaeology, not as the continuation plan.
- **Lower search preservation:** All 31 lower home-filter CSS rules/declarations/media contexts were extracted unchanged into `premium-home-filter.css`, imported by `premium-filter-bar.tsx`. Lower JSX from `<PremiumFilterBar />` onward is byte-identical to the previous commit. Language selector TSX/CSS and all three flag SVGs are unchanged; `.style-hero` remains solely a compatible home-theme hook for that CSS.
- **Premium filters:** `premium-select.tsx` is a labeled select-only combobox with selected check, active descendant, arrows/Home/End/typeahead, Enter/Space, Escape/Tab and outside dismissal. `premium-filters.css` scopes desktop sidebar, filled GEL slider, sort, badges and removable chips. Price remains max-price 15–100 in steps of 5, default 100; sorting and the full filtering predicate remain unchanged. Actual state supplies all chips/counts/reset. Mobile uses the existing native dialog styled as a bottom sheet; dropdown Escape closes the dropdown first. Options now portal into the nearest native dialog or body with viewport-clamped fixed positioning, avoiding sheet overflow clipping. Internal scrolling stays active; outside scroll/resize dismisses the list. Trigger heights grow with wrapped text, and slider price badges stay on one line. The home More filters button submits current location/service/date plus UI-only `filters=open`, opening the sheet at ≤800px and retaining the desktop sidebar above that width.

## Localization Architecture

- **Locales:** `ka` / ქართული (default), `en` / English, `ru` / Русский. Never choose the first-visit language from browser settings. Invalid/unavailable saved preferences resolve to Georgian.
- **Preference:** `chair.locale.v1` stores only the selected locale in localStorage; storage events synchronize tabs. It is independent of `chair.prototype.v1` and survives the demo-data reset. Storage failure keeps the chosen language for the session and shows localized feedback.
- **Provider/control:** `src/i18n/provider.tsx` exports `LocaleProvider` / `useI18n()` (`locale`, `setLocale`, `t`, display helpers). `src/components/language-selector.tsx` supplies a globe/endonym/chevron combobox with local SVG GE/GB/RU flags and an active check. Its fixed viewport-clamped dropdown remains within the header DOM for correct mobile outside-click behavior. Dark home/light other-route themes; arrows, Home/End, typeahead, Enter, Escape, Tab and focus restoration. Mobile placement remains within the existing menu. Document `lang` follows selection.
- **Catalogs:** `src/i18n/messages/{core,entities,discovery,journey,workspace,calendar,style-hero,filters}.ts`, merged in `messages/index.ts`. Semantic namespaces cover navigation/shared UI/home/about/errors/toasts, canonical-entity display fields, marketplace/profiles, booking/auth/account, barber/reviews/portfolio and calendar labels. `defineMessages` rows are `[English, Georgian, Russian]`; explicit locale maps are also used. Add the same keys and placeholders in all three languages.
- **Interpolation/plurals:** `translate.ts` supports `{name}` values, numeric count/plural variants through Intl, English fallback, and development warnings for missing keys. Pass raw numeric counts so plural selection works; do not concatenate English nouns. Error/toast state stores semantic keys, so already-visible feedback updates when language changes.
- **Canonical content:** one fixture/state entity per shop/barber/service/style. `display.ts` translates generic seed fields only when the ID and original field still match. Names, brands, addresses, emails, URLs, IDs/slugs, prices, relationships and stored dates are untouched. Seed portfolio titles matching a generic style are translated; intentionally named works and user-edited/custom fields remain verbatim.
- **Reviews:** customer-written text is user content and never automatically translated. Labels, dimensions, dates, service display and verification messages translate around it. No translate-review feature exists.
- **Formatting:** display helpers use `ka-GE`, `en-GB`, `ru-RU`, preserve GEL `₾`, and display dates in `Asia/Tbilisi` without changing stored `YYYY-MM-DD` values. Lightweight Georgian calendar/number fallbacks cover browsers missing Georgian Intl data. Shared booking date arithmetic remains in `src/lib/dates.ts`.
- **Metadata/validation:** server titles start in Georgian; a cleaned-up, idempotent head observer preserves selected-language titles/descriptions after Next streams metadata. Exact route checks retain localized 404 titles. Native form constraints stay intact; their validation messages are localized. Native date/time picker chrome and OS file-selection dialogs follow browser/OS language; app-owned labels, calendar buttons and chosen-file text are localized.
- **Fonts/layout:** original DM fonts remain for Latin. Local Noto Sans/Serif Georgian render Georgian; Arial/Georgia system fallback supplies Cyrillic. Only required spacing/font fallback and contained profile-tab scrolling changed; routes and page composition stay intact.
- **Hero/filter keys:** `style-hero.ts` contains `homeHero.*`, six shared `hero.beard.<id>` labels, `styleBrief.*` and `homeFilters.*`; `filters.ts` contains `filters.*`. Mannequin-only messages are removed. All three locales have matching keys, and existing entity helpers preserve canonical IDs and names.
- **Development rule:** Every newly introduced user-facing UI string must be added to the localization system in Georgian, English, and Russian. Do not introduce new hardcoded interface text.

## Data Models

Entities: `User`, `Customer`, `Barber`, `BarberShop`, `Service`, `Appointment`, `Review`, `PortfolioItem`, `HaircutStyle`, `Favorite`, `Availability`, `MockState`.

- **8 shops, 16 barbers, 45 seed reviews, 12 styles**, 5 base services, portfolios and schedules. Preserve relational IDs (`shop-1..8`, `barber-1..16`); public detail routes use slugs.
- Demo customer: Alex Chikovani, `customer-1`, `alex@example.test`. Barber workspace: Giorgi Kapanadze, `barber-1`, `shop-1`. Role selection does not create separately secured identities.
- Barber 16, Ilia Kereselidze, intentionally has no portfolio/reviews and a smaller service menu for empty states.
- Base price/duration: haircut ₾35/45min; skin fade ₾40/50min; haircut+beard ₾55/60min; beard trim ₾20/25min; scissor cut ₾45/60min. Individual barber prices can differ.
- Reviews derive individual reputation and shop aggregates through related barbers. Completed-visit verification is enforced only in local prototype actions.

## Routes

| Routes                                                      | Purpose                                                         |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| `/`, `/discover`                                            | Home and filtered/sorted discovery                              |
| `/shops`, `/shops/[slug]`                                   | Shop directory and profiles                                     |
| `/barbers`, `/barbers/[slug]`                               | Barber directory, portfolio, services, reputation, availability |
| `/styles`, `/styles/[slug]`                                 | Haircut inspiration and matching specialists                    |
| `/booking`                                                  | Selection flow, review, confirmation, rescheduling              |
| `/login`, `/register`                                       | Mock sign-in and role onboarding                                |
| `/account`                                                  | Customer overview                                               |
| `/account/appointments`, `/account/favorites`               | Appointments/actions and saved entities                         |
| `/account/reviews`, `/account/settings`                     | Reviews and customer settings                                   |
| `/barber/dashboard`, `/barber/profile`                      | Appointment overview and profile editor                         |
| `/barber/portfolio`, `/barber/services`, `/barber/schedule` | Portfolio, menus/prices, hours/days off                         |
| `/about`                                                    | Prototype explanation and confirmed local reset                 |

Examples: `/shops/gentlemans-corner`, `/barbers/giorgi-kapanadze`, `/styles/skin-fade`. Booking query parameters use IDs: `shop`, `barber`, `service`, `reschedule`. Discovery accepts `q`, `location`, `service`, `style`, `date`, `availability`; `filters=open` is a UI hint for the mobile filter sheet.

## Implemented Features

- Premium dark homepage with generated barber-chair/tool artwork, seamless CSS camera/light motion, responsive local images, static recovery, reduced motion, offscreen pause and direct discovery/salon CTAs. The mannequin direction is fully retired.
- Premium accessible selects, viewport-safe dropdowns, filled price slider/reset, real chips/counts, sorting and mobile sheet. Lower homepage sections and filter semantics preserved; long card CTAs wrap and comparison targets are 44px. Mobile navigation closes correctly on resize/Escape/outside action and shares the correct role-based account route. All booking progress buttons retain translated accessible names on mobile.
- Complete Georgian/English/Russian interface localization, accessible flag header/mobile language selector, persistent independent locale preference, localized metadata and form feedback.
- Responsive editorial home, shop/barber/style directories and profiles; discovery filters (location/distance, service/style, price/rating, date/availability/experience), sorting, mobile filters and empty-state recovery.
- Locally persistent favorites, up-to-3 barber comparison, portfolio tag filters/lightbox, review/rating breakdowns.
- Booking: shop → specific/any barber → service → date → time → review → local confirmation. Customer history, repeat booking, cancellation and same-ID rescheduling.
- One review per eligible completed visit, with stars, optional dimension ratings and text.
- Customer settings/phone persistence; barber profile/photo edits, service creation/prices, portfolio add/remove, hours/days off, appointment completion actions.
- Loading/error/empty states, toasts, keyboard-operable native dialogs, mobile booking controls. Optional WebMCP `set_saved_barber` shares the visible favorite action and rejects unknown IDs.

## Partially Implemented Features

- Earlier submitted style inspiration remains temporary per-tab state, not a persisted appointment field. Existing discovery/booking briefs remain readable/clearable; the retired hero can no longer create new grooming combinations.
- Account onboarding and role UI; independent account provisioning, shop ownership and production permissions are absent.
- Local JPG/PNG/WebP uploads up to **600 KB** as data URLs; remote storage/image processing is absent.
- Responsive and keyboard behavior tested; no comprehensive automated visual regression suite or formal accessibility audit.

## Mocked Features

All shops, barbers, reviews and appointments are fictional/demo state. Profile-view metrics are illustrative; other dashboard metrics derive from sample visits. Authentication/authorization and verified-review eligibility are local simulations. Customer actions target the demo customer; barber editing targets `barber-1`. Availability is local and does not reserve real slots across devices/users. Stock photos illustrate fictional people, premises and portfolio work; preserve disclosures and [asset credits](ASSET-SOURCES.md).

## Not Implemented Yet

Real database/API storage, secure authentication/server permissions, concurrent booking protection, remote uploads, payment collection/refunds/payouts, email/SMS and analytics remain unimplemented. Public static prototype hosting is authorized; real production booking infrastructure is not.

## Known Issues

- Hero is a generated-image motion composition, not physically assembling chair parts or live footage. Phone/GPU performance and formal screen-reader acceptance remain unmeasured. Reduced motion was tested with an isolated response proxy emulating the media condition; OS settings were not changed. Document-hidden and total-image-failure paths are source-reviewed, not separately exercised.
- During the earlier studio task, the in-app test tab crashed when opening the browser-owned native date popup; automated filling did not commit a date there. Date URL preselection/chip removal and existing date rules passed, and the unchanged native picker should be retested in an ordinary browser. Do not claim a complete native-picker interaction pass.
- Historical normal Next server checks returned correct unknown-route 404s while logging internal **`NoFallbackError`** diagnostics. GitHub Pages has no running Next server; its 5 unknown-route checks return real static 404s. Do not generalize past server logs into a live Pages failure.
- Browser storage is origin-specific: `127.0.0.1:3000`, `localhost`, and other ports have separate data. Preserve the original origin and user edits. This file does not back up browser state; do not reset automatically.
- Earlier QA left a Giorgi favorite, a review of a completed Sandro visit, a cancelled test booking, and **Hot towel finish (₾25/30min)** on Giorgi's menu. Existing unrelated appointments were preserved. Temporary price/name/schedule changes were restored and a test portfolio item removed. Current counts can differ from pristine fixtures.
- Restricted builds/listeners have stalled or returned permission errors; approved escalation passed. Do not alter protected files or stop arbitrary port owners to work around this.
- No lint script configured. Available checks are TypeScript, domain tests, build and HTTP verification.

## UI / Design System

The motion-poster hero uses charcoal `#151816`, warm gold `#e0be85`, cream type and restrained light. Hero styles live in `barber-hero.css`; unchanged lower search styles are isolated in `premium-home-filter.css`, with discovery controls in `premium-filters.css`. The flag language dropdown keeps its existing styling.

Premium editorial barber culture: cream `#f8f7f3`, charcoal `#262821`, copper `#a56041`, availability green `#537452`, muted gray `#75766e`, borders `#dedfd7`, soft fill `#eeeee6`. DM Sans interface text, DM Serif Display/italic display accents, local Noto Georgian fallbacks and system Cyrillic fallbacks, Lucide icons, generous spacing, restrained borders and clear hierarchy.

Emphasize individual reputation and portfolios alongside shop identity. Georgian names/neighborhoods, GEL `₾`, Tbilisi dates. Local images: 25 existing stock photos (1 original hero, 4 shops, 8 portraits, 12 haircuts), 3 new chair-artwork renditions and 3 flag SVGs. Preserve correspondence between style tags/photos; buzz cut, French crop, long hair and mid fade imagery was refined after review. Maintain illustrative-use disclosures. Main surfaces were checked at **375/768/1024/1440px**. See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Important Components

| Files in `src/components/`                       | Responsibility                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| `barber-hero.tsx`, `barber-hero.css` | Localized hero / CSS motion poster, lifecycle and recovery |
| `style-selection-provider.tsx`, `style-selection-brief.tsx` | Validated session inspiration and shared journey summary |
| `premium-filter-bar.tsx`, `premium-select.tsx` | Home search and reusable accessible premium dropdowns |
| `provider.tsx`                                   | Shared persistence/actions, hydration gate, synchronous state reference |
| `language-selector.tsx`, `about-preview.tsx`     | Header/mobile locale control and localized About client content         |
| `shell.tsx`, `ui.tsx`, `cards.tsx`               | Navigation/footer, shared controls/dialogs/states, marketplace cards    |
| `discovery.tsx`, `compare.tsx`, `style-page.tsx` | Filters/sorts, comparison, style matching                               |
| `profiles.tsx`, `portfolio.tsx`, `reviews.tsx`   | Profiles/booking panels, tagged lightbox, ratings/review form           |
| `booking-flow.tsx`                               | Selections/validation and saved-appointment confirmation                |
| `auth.tsx`, `account.tsx`, `dashboard-shell.tsx` | Mock roles and customer workspace                                       |
| `barber-workspace.tsx`                           | Barber appointments/profile/services/portfolio/schedule                 |
| `webmcp.tsx`, `reset-demo.tsx`                   | Optional favorite integration and confirmed reset                       |

## Important Product Rules

- Barbers have individual ratings, specialties, portfolios, prices and availability; shop profiles aggregate related reputation. Allow a specific barber or an eligible available barber.
- Portfolios are categorized by style and should eventually represent real consented work; current stock imagery is illustrative.
- Distinct customer/barber roles eventually require server permissions. Reviews belong to the customer/barber of a completed appointment, once per visit.
- Booking has one **30-day horizon**, Tbilisi current-time cutoff, valid shop/barber/service relationships, finite nonnegative price, positive duration, work/closed days, blocked starts/dates, closing hours and full-duration overlap checks.
- Confirmation must use the **saved appointment's barber and price**; recomputing “any barber” after booking previously changed them. Rescheduling retains the ID and excludes that appointment from conflicts. Cancellation rejects invalid/foreign/completed records.
- Preserve eligible preselected services when changing barber. Key profile booking panels/galleries by profile ID to reset on navigation.
- Preserve hydration-gated editors, trimmed-field validation, safe single-word names, customer phone persistence and overdue appointment completion controls.
- Mobile dashboard tables scroll internally (`min-width: 0` on dashboard main); keep the root smooth-scroll attribute and Sololaki's Tuesday–Saturday hours.
- Future backend integration should retain reusable UI and stable relationships; do not implement it without a user request.

## Backend / Database Migration Plan

Replace provider actions with asynchronous repositories gradually. [BACKEND_PLAN.md](BACKEND_PLAN.md) details:

1. PostgreSQL/Supabase relational schema for identities, shops/memberships, services/styles, portfolios, availability, appointments, reviews, favorites.
2. Server-verified sessions and ownership/membership permissions; role selection is only onboarding preference.
3. UTC appointment intervals plus shop IANA timezone, transactions/exclusion constraints, idempotency, price/duration snapshots, atomic rescheduling.
4. Completed-appointment ownership and unique review constraints; authorized object storage, validation/resizing/metadata removal and real image consent.
5. Payment/webhook/refund/payout policy and opt-in outbox notifications once authorized.

No backend provider/account is connected. Browser localStorage remains prototype storage.

## Deployment

- **Provider / public URL:** GitHub Pages, `https://chair-dot.github.io/chair-barber-marketplace/` (returned by authenticated Pages creation API).
- **Status:** **Live and verified on 2026-09-16.** Pages source is GitHub Actions (`build_type: workflow`), HTTPS enforced, repository public as explicitly authorized. Deployment setup commit `e4729e7af5b9c134aba40650cf9d13d1bafba00a` passed build and deploy in [Actions run 35104430569](https://github.com/CHAIR-DOT/chair-barber-marketplace/actions/runs/35104430569). Successful API and browser/HTTP checks confirm the public URL. Use the latest Actions run and Git HEAD for later documentation-only pushes.
- **Workflow:** `.github/workflows/deploy-pages.yml`, pushes to `main` and `workflow_dispatch`. npm lockfile / Node 22; install → tests → Next static export → upload `out/` → deploy. **Pushing to main automatically deploys after successful checks.** No generated output is committed.
- **Export:** `npm run build:pages` gates `output: "export"`, `trailingSlash: true`, and `basePath` behind `GITHUB_PAGES=true`. `actions/configure-pages` supplies `NEXT_PUBLIC_BASE_PATH` (currently `/chair-barber-marketplace`). `src/lib/public-path.ts` applies that prefix at native image/form rendering, preserving canonical fixture/storage values and uploaded data URLs. Next Link/router/bundled assets handle the prefix themselves.
- **Compatibility:** Discover/booking/register page wrappers retain metadata and render client query adapters under existing localized Suspense fallback. All profile/section slugs already have `generateStaticParams` and `dynamicParams=false`. No server APIs, actions, middleware, request cookies/headers or image optimization need replacing. Dashboard active links accept trailing slashes.
- **Local development:** Normal dev/build/start have no Pages prefix. After a Pages build, run `npm run build` before `npm start`. Do not use `next start` for the exported `out/`; mount it under the repository path using a static server.
- **Limits:** JavaScript is required for the interactive prototype; only built profile/section slugs exist, unknown paths 404. Accounts, bookings and uploads stay browser/origin-local mock data, with no real backend/auth/payments/shared reservations. Localhost browser data is not migrated or cleared when opening the public origin.
- **Security review:** Baseline 9 commits / 272 unique historical blobs reviewed before public visibility; no detected secrets or tracked env/build/dependency/synced-reference files. Existing author metadata/history visibility explicitly approved. Export audit: 429 files, no detected secrets/env/config/docs/maps/local-user paths. Only static website artifacts are deployed.
- **Next action:** Continue the next user-requested frontend change, preserving the Pages workflow and public-path helper. For future releases, run tests/typecheck/static build, commit and push to the same main branch, then verify Actions and the public site. No deployment/authentication/plan blocker remains. User approval for public visibility is already recorded; do not ask again.

## Repository / Version Control

- **Status:** Git initialized, committed, connected to GitHub, and uploaded successfully. Initial baseline `f3e9dc2` (`chore: establish project baseline`) contains 85 audited files; later commits record the handoff and setup. Use `git log -1` for the current latest commit rather than storing a commit’s own hash inside itself.
- **Authenticated GitHub username:** `CHAIR-DOT`, verified with the authenticated GitHub API after official browser/device authorization.
- **Repository:** `CHAIR-DOT/chair-barber-marketplace`.
- **URL:** [https://github.com/CHAIR-DOT/chair-barber-marketplace](https://github.com/CHAIR-DOT/chair-barber-marketplace).
- **Visibility:** **Public**, changed on 2026-09-16 with explicit user authorization after GitHub rejected Pages for the private repository under the current account plan. Existing source and Git history are now public.
- **Remote:** `origin` → `https://github.com/CHAIR-DOT/chair-barber-marketplace.git`.
- **Primary branch / upstream:** `main` → `origin/main`. Normal push: `git push`; inspect fetch/status before incorporating remote changes. Preserve existing history and unrelated edits.
- **CLI:** GitHub CLI 2.101.0 at `/Users/macuser/.local/bin/gh` (use the full path if needed). Its official release archive matched the published SHA-256. Secure browser authorization succeeded; no tokens/device codes were stored in project files. The stalled Homebrew install was stopped and no shell-profile changes were made.
- **Commit identity:** Existing global name/email remain unchanged. Repository-local author name preserves the existing valid name; repository-local email uses the address the user supplied. Git author name and GitHub account name need not be identical.
- **Tracked content:** Source/config, lockfile, licensed assets, tests, brief, memory and docs. Dependencies/builds/caches, env files, private-key/credential formats, logs/temp files, OS/editor metadata, assistant-local state and synced references are ignored. `.env.example` is allowed only with verified placeholders; none exists. Never delete real local env files just because they are ignored.
- **Workflow:** Read memory/code → implement → test → update current memory sections → inspect diff/status/staged content for secrets → descriptive commit → push to this same repository → verify remote commit/upstream and expected clean tree. Keep memory and code in the same commit whenever practical. No force-push/history rewriting without explicit approval; no new repository per task.
- **Next action:** Continue the existing frontend when the user requests a change. GitHub setup has no remaining authentication blocker.

## Verification

**Fresh deployment verification, 2026-09-16:** 30 tests and TypeScript pass; Pages export builds all 57 generated pages. Local static HTTP checks under `/chair-barber-marketplace` pass 55 routes, 5 unknown-route 404s and 31 images. All 113 referenced scripts/styles/icons/font files across 57 directory pages return valid responses. An initial concurrent check hit the temporary Python server’s small connection queue; restarting that QA server with a larger queue resolved it without application changes. Georgian first visit, English/Russian switching, native Vake search (4 barbers / 2 shops), client profile navigation, preselected booking (Giorgi / haircut / ₾35), barber registration role and dashboard active navigation checked. Normal production build also passes (57 pages), and existing localhost preview returns HTTP 200 without a base path. Exported homepage at 375/768/1440px has no horizontal overflow, loads the correct responsive hero and bundled fonts. Dashboard survives a direct reload. No warning/error logs in the clean QA tab. Live HTTPS checks repeat all 55 valid routes, 5 expected 404s, 31 images and 113 referenced CSS/JS/icon/font files across 57 page paths, with both commands exiting 0. Fresh public-origin browser opens Georgian; English/Russian switching updates content/metadata and loads all flags. Verified 1440px Georgian layout, 375px Russian layout and Georgian mobile menu, native Vake search through the GitHub directory redirect, profile navigation/direct reload and active barber dashboard. No tested overflow, missing images or live warning/error logs. The original localhost page still uses root asset/form paths, stays Georgian and retains the saved Giorgi favorite. No storage reset or booking/product record was created. Temporary static QA server/tab are closed; original local preview and public site tab remain.

**Historical motion-poster replacement checks, 2026-09-16:** 29 tests pass (9 domain, 17 localization, 3 style-state); TypeScript and production build pass, 57 generated pages. Production HTTP checks: 55 valid routes, 5 expected unknown-route 404s and 31 local images. No lint configured. Restricted build stalled; it was stopped and the approved local build passed.

Browser: 36 hero cases (KA/EN/RU × 375/430/768/1024/1440/1920 × 667/800) have no horizontal overflow or clipped tested titles/CTAs/captions and all images load; no canvas remains. 18 translated language-menu cases have correct loaded flags/active locale, viewport bounds and Escape dismissal. Screenshots inspected at desktop and phone widths, with full-chair desktop framing and mobile portrait crop refined. CSS transforms progress over repeated observations spanning more than a full cycle; alternate endpoints are continuous. Actual offscreen scroll pauses animation, returning resumes it. Main-image 503 leaves the matching static poster and usable discovery CTA. Isolated reduced-motion response emulation produces paused/none camera, hidden effects and zero fade; salon CTA still works. Existing Giorgi favorite remains after language changes and discovery. Fresh production browser warnings/errors were empty. No storage reset or new booking/product record.

Source review confirms all 31 extracted lower-filter rules and lower homepage JSX unchanged; language TSX/CSS/flags and mock provider/fixtures/booking/discovery/cards unchanged. Only unused inspiration setter/submit/URL-helper APIs removed; parsing and old submitted data preserved. `VERIFICATION.md` contains detailed evidence and limits. Final production visual recheck at 1024/768/1920 passed after matching still/main framing and desktop edge fade. Own temporary QA tabs/listeners are stopped and viewport overrides reset; original Georgian 3000 preview remains ready with zero mannequin elements.

**Historical:** The previous 3×3 asset task passed 36 tests and extensive combination/fallback/browser checks, but its visual quality was rejected and all mannequin functionality is now retired. Earlier localization task passed 26 tests, 264 route/locale/width checks and preserved stored state; initial Git setup verified private repo upload and secure auth. Earlier booking/domain/browser checks remain recorded in `VERIFICATION.md`; do not present them as repeated by this hero-only task.

## Recent Changes

### 2026-09-16 — GitHub Pages publication

- User requested publishing the existing site only, with no redesign/product changes. Verified account/repository/main and static compatibility. After a Pages plan rejection, user explicitly authorized public source/history visibility; changed repository to public and enabled Pages Actions successfully.
- Added gated static export, deployment workflow, native public-path rendering and three client query adapters; dashboard active link accepts directory trailing slash. All fixture/store/catalog/product logic, visual design and dependency lock remain unchanged. Setup committed/pushed as `e4729e7`; first Actions build/deploy succeeded.
- Public URL is live: `https://chair-dot.github.io/chair-barber-marketplace/`. Verified 30 tests, TypeScript, normal/static builds, local/live routes/assets and desktop/mobile language/navigation/query behavior. Updated Deployment, README, scoped project instructions and verification evidence. Future main pushes automatically deploy; original localhost data is preserved.

### 2026-09-16 — Current motion-poster direction

- User explicitly rejected and retired the mannequin. Replaced hero with generated barber-chair/tool artwork and quiet CSS camera/light motion; kept multilingual copy/CTAs, improved flag dropdown and all lower marketplace content.
- Removed model/configurator/runtime/asset pipeline/tests and unused dependencies/APIs. Preserved existing submitted style data and discovery/booking brief behavior. Extracted lower search CSS unchanged.
- Added responsive WebP assets, static/no-JS recovery, reduced-motion/offscreen handling, current visual guide and exact generation prompt. Fixed responsive-image error recovery and accessible heading spacing; refined phone framing and desktop image-edge blending.
- Verified 29 tests, TypeScript/build, 55/5/31 HTTP checks, translated responsive/menu cases, fallback and navigation. Current handoff accompanies the reviewed implementation commit; use Git for hash/upstream.

### Earlier milestones

- 2026-09-16: Implemented full KA-default/EN/RU localization, independent saved preference, semantic catalogs, local Georgian fonts and responsive text/form fixes. Added premium discovery filters and preserved booking/data rules.
- 2026-09-16: Explored an interactive 3D human and then a legal 3×3 asset pipeline with same-human previews. These were superseded by the user's motion-poster decision; historical implementation is in Git through `aed398e`.
- 2026-09-15: Built CHAIR.'s mock frontend and customer/barber workflows; fixed booking horizon/eligibility, hydration/persistence and mobile issues. Established project memory and ongoing private GitHub commit/push workflow. Baseline `f3e9dc2`; private repository/auth setup succeeded without stored secrets.

## Next Recommended Steps

1. Read this memory and actual Git status; the public deployment is complete. Continue the user's next requested frontend change. Verify upstream before editing. Update memory and commit/push meaningful work.
2. For hero revisions, use `HERO_VISUAL_GUIDE.md`, `barber-hero.tsx/css` and the documented artwork prompt. Preserve the decorative direction; do not restore mannequin selectors or 3D assets unless explicitly requested.
3. Validate physical phones, animation performance, native date picker and formal accessibility before production use. Existing browser results are not hardware certification.
4. Backend, real auth, payments and messaging remain deferred until requested. Preserve the public static deployment workflow for future frontend changes.

## Last Updated

**2026-09-16 (Asia/Tbilisi)** — Published and verified the existing prototype on GitHub Pages after the user explicitly authorized public repository visibility. Setup commit `e4729e7` deployed successfully; final documentation accompanies this verification record. Public URL, workflow, automatic main deployments, static compatibility changes, limits and current/historical tests are documented above. Original localhost data is preserved. Continue the next requested change and keep memory current; no deployment blocker remains.
