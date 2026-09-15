# CHAIR. — Project Memory

## Project Overview

CHAIR. is a premium barber marketplace in Tbilisi, Georgia. Customers discover shops and individual barbers, compare portfolios/reputation/prices, choose a specialist, and book a service. Individual barber reputation is central to the product. The original specification is preserved in [PROJECT_BRIEF.md](PROJECT_BRIEF.md).

ChatGPT project: **BARBER**. Current local workspace:

```text
/Users/macuser/.codex/.chatgpt-projects/g-p-6aa958719c2081918e959be626523117
```

Continue the existing application; do not create a new scaffold. Root `AGENTS.md` and synced `sources/` material are read-only. Do not edit, rename, move, or delete them.

## Current Development Phase

**Frontend prototype using local mock data.** Discovery, profiles, booking, customer accounts, and barber management work within the prototype's limits. Preview: `http://127.0.0.1:3000`. No public site deployment or backend implementation is authorized by the current task.

**Current status:** Complete Georgian/English/Russian frontend localization is implemented and verified. Georgian is the first-visit default. Language selection, metadata, app-controlled dates/numbers and UI feedback update immediately; the separate local preference survives navigation and refresh. All 22 main screens were checked in all three languages and at 375/768/1024/1440px. TypeScript, 26 tests, production build and route/image checks pass. Existing routes, design, canonical entities, booking rules and the user’s port-3000 browser data are preserved. Continue with the next user-requested improvement using the existing private repository; Git state is authoritative for the latest commit/upstream.

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
| `public/images/`, `public/favicon.svg`             | 25 local stock JPGs and brand icon                                                                    |
| `tests/domain.test.ts`, `tests/i18n.test.ts`       | Domain/fixtures, locale defaults/catalog parity, formatting, preservation and route-title regressions |
| `scripts/check-routes.ts`                          | Valid/invalid-route and image HTTP checks                                                             |
| `PROJECT_MEMORY.md`, `AGENTS.override.md`          | Current project truth and mandatory workflow                                                          |
| `PROJECT_BRIEF.md`                                 | Verbatim original product brief                                                                       |
| `README.md`, `DESIGN_SYSTEM.md`, `VERIFICATION.md` | Setup, visual conventions, validation evidence                                                        |
| `ASSET-SOURCES.md`, `BACKEND_PLAN.md`              | Photography credits and future integration plan                                                       |

Dependencies, build output, generated `next-env.d.ts`, caches, local configuration and synced reference material are ignored by Git. Empty `sources/` is not application source; preserve local synced references without uploading them automatically.

## Architecture

- `LocaleProvider` wraps `MockProvider` and supplies language/display helpers without remounting the store. `MockProvider` in `provider.tsx` owns shared state and mutations. Screens consume common entities/actions; this is the future asynchronous repository/API boundary.
- Storage key: **`chair.prototype.v1`**, shape `{version: 1, data: MockState}`. Persistent collections: favorites, appointments, reviews, barbers, services, portfolio, availability, user. Comparison is temporary in-memory state, capped at 3 barbers.
- Preserve the provider's `ready` gate and synchronous `stateRef`; they prevent hydration problems and stale editor defaults overwriting saved details. Mount dependent editors after hydration.
- Services have global definitions and barber eligibility/price relationships. Appointments snapshot price/duration; reviews link a completed visit, customer, and barber.
- Date/money helpers use **Asia/Tbilisi** and GEL. Seed dates are generated when modules initialize; persisted visits retain their dates and may later become overdue.
- All photos/fonts are local. Portfolio seed images and their correction migration follow style tags while preserving added items.
- Detail/section routes use static parameters and `dynamicParams = false` for correct unknown-path 404s.
- Preserve **`agentRules: false`** in `next.config.ts`: Next otherwise tried to append generated instructions to the protected `AGENTS.md` and failed with EACCES. `poweredByHeader` and `devIndicators` are also disabled.
- The route checker wraps work in `async main()` for the installed tsx execution mode and reads images relative to the project root.

## Localization Architecture

- **Locales:** `ka` / ქართული (default), `en` / English, `ru` / Русский. Never choose the first-visit language from browser settings. Invalid/unavailable saved preferences resolve to Georgian.
- **Preference:** `chair.locale.v1` stores only the selected locale in localStorage; storage events synchronize tabs. It is independent of `chair.prototype.v1` and survives the demo-data reset. Storage failure keeps the chosen language for the session and shows localized feedback.
- **Provider/control:** `src/i18n/provider.tsx` exports `LocaleProvider` / `useI18n()` (`locale`, `setLocale`, `t`, display helpers). `src/components/language-selector.tsx` supplies the labeled native select/Languages icon in `shell.tsx`, including the existing mobile menu. Keyboard focus, native selection and document `lang` follow the selected language.
- **Catalogs:** `src/i18n/messages/{core,entities,discovery,journey,workspace,calendar}.ts`, merged in `messages/index.ts`. Semantic namespaces cover navigation/shared UI/home/about/errors/toasts, canonical-entity display fields, marketplace/profiles, booking/auth/account, barber/reviews/portfolio and calendar labels. `defineMessages` rows are `[English, Georgian, Russian]`; explicit locale maps are also used. Add the same keys and placeholders in all three languages.
- **Interpolation/plurals:** `translate.ts` supports `{name}` values, numeric count/plural variants through Intl, English fallback, and development warnings for missing keys. Pass raw numeric counts so plural selection works; do not concatenate English nouns. Error/toast state stores semantic keys, so already-visible feedback updates when language changes.
- **Canonical content:** one fixture/state entity per shop/barber/service/style. `display.ts` translates generic seed fields only when the ID and original field still match. Names, brands, addresses, emails, URLs, IDs/slugs, prices, relationships and stored dates are untouched. Seed portfolio titles matching a generic style are translated; intentionally named works and user-edited/custom fields remain verbatim.
- **Reviews:** customer-written text is user content and never automatically translated. Labels, dimensions, dates, service display and verification messages translate around it. No translate-review feature exists.
- **Formatting:** display helpers use `ka-GE`, `en-GB`, `ru-RU`, preserve GEL `₾`, and display dates in `Asia/Tbilisi` without changing stored `YYYY-MM-DD` values. Lightweight Georgian calendar/number fallbacks cover browsers missing Georgian Intl data. Shared booking date arithmetic remains in `src/lib/dates.ts`.
- **Metadata/validation:** server titles start in Georgian; a cleaned-up, idempotent head observer preserves selected-language titles/descriptions after Next streams metadata. Exact route checks retain localized 404 titles. Native form constraints stay intact; their validation messages are localized. Native date/time picker chrome and OS file-selection dialogs follow browser/OS language; app-owned labels, calendar buttons and chosen-file text are localized.
- **Fonts/layout:** original DM fonts remain for Latin. Local Noto Sans/Serif Georgian render Georgian; Arial/Georgia system fallback supplies Cyrillic. Only required spacing/font fallback and contained profile-tab scrolling changed; routes and page composition stay intact.
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

Examples: `/shops/gentlemans-corner`, `/barbers/giorgi-kapanadze`, `/styles/skin-fade`. Booking query parameters use IDs: `shop`, `barber`, `service`, `reschedule`. Discovery accepts `q`, `location`, `service`, `style`, `date`, `availability`.

## Implemented Features

- Complete Georgian/English/Russian interface localization, native header/mobile language selector, persistent independent locale preference, localized metadata and form feedback.
- Responsive editorial home, shop/barber/style directories and profiles; discovery filters (location/distance, service/style, price/rating, date/availability/experience), sorting, mobile filters and empty-state recovery.
- Locally persistent favorites, up-to-3 barber comparison, portfolio tag filters/lightbox, review/rating breakdowns.
- Booking: shop → specific/any barber → service → date → time → review → local confirmation. Customer history, repeat booking, cancellation and same-ID rescheduling.
- One review per eligible completed visit, with stars, optional dimension ratings and text.
- Customer settings/phone persistence; barber profile/photo edits, service creation/prices, portfolio add/remove, hours/days off, appointment completion actions.
- Loading/error/empty states, toasts, keyboard-operable native dialogs, mobile booking controls. Optional WebMCP `set_saved_barber` shares the visible favorite action and rejects unknown IDs.

## Partially Implemented Features

- Account onboarding and role UI; independent account provisioning, shop ownership and production permissions are absent.
- Local JPG/PNG/WebP uploads up to **600 KB** as data URLs; remote storage/image processing is absent.
- Responsive and keyboard behavior tested; no comprehensive automated visual regression suite or formal accessibility audit.

## Mocked Features

All shops, barbers, reviews and appointments are fictional/demo state. Profile-view metrics are illustrative; other dashboard metrics derive from sample visits. Authentication/authorization and verified-review eligibility are local simulations. Customer actions target the demo customer; barber editing targets `barber-1`. Availability is local and does not reserve real slots across devices/users. Stock photos illustrate fictional people, premises and portfolio work; preserve disclosures and [asset credits](ASSET-SOURCES.md).

## Not Implemented Yet

Real database/API storage, secure authentication/server permissions, concurrent booking protection, remote uploads, payment collection/refunds/payouts, email/SMS, analytics and production hosting. The original brief defers backend work. **Private GitHub source upload is authorized; public website deployment is not part of this request.**

## Known Issues

- Intentional unknown static routes correctly return 404 but print Next's internal **`NoFallbackError`** in the server terminal. Valid routes and observed interactions are unaffected; do not claim all server logs are error-free.
- Browser storage is origin-specific: `127.0.0.1:3000`, `localhost`, and other ports have separate data. Preserve the original origin and user edits. This file does not back up browser state; do not reset automatically.
- Earlier QA left a Giorgi favorite, a review of a completed Sandro visit, a cancelled test booking, and **Hot towel finish (₾25/30min)** on Giorgi's menu. Existing unrelated appointments were preserved. Temporary price/name/schedule changes were restored and a test portfolio item removed. Current counts can differ from pristine fixtures.
- Restricted builds/listeners have stalled or returned permission errors; approved escalation passed. Do not alter protected files or stop arbitrary port owners to work around this.
- `npm ls --depth=0` reports optional Sharp/WASM entries `@emnapi/runtime` and `@img/sharp-wasm32` as extraneous. Both appear in the lockfile; all declared packages match, check exits 0, and build passes. No reinstall was needed.
- No lint script configured. Available checks are TypeScript, domain tests, build and HTTP verification.

## UI / Design System

Premium editorial barber culture: cream `#f8f7f3`, charcoal `#262821`, copper `#a56041`, availability green `#537452`, muted gray `#75766e`, borders `#dedfd7`, soft fill `#eeeee6`. DM Sans interface text, DM Serif Display/italic display accents, local Noto Georgian fallbacks and system Cyrillic fallbacks, Lucide icons, generous spacing, restrained borders and clear hierarchy.

Emphasize individual reputation and portfolios alongside shop identity. Georgian names/neighborhoods, GEL `₾`, Tbilisi dates. Local images: 1 hero, 4 shops, 8 portraits, 12 haircuts. Preserve correspondence between style tags/photos; buzz cut, French crop, long hair and mid fade imagery was refined after review. Maintain illustrative-use disclosures. Main surfaces were checked at **375/768/1024/1440px**. See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Important Components

| Files in `src/components/`                       | Responsibility                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
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

## Repository / Version Control

- **Status:** Git initialized, committed, connected to GitHub, and uploaded successfully. Initial baseline `f3e9dc2` (`chore: establish project baseline`) contains 85 audited files; later commits record the handoff and setup. Use `git log -1` for the current latest commit rather than storing a commit’s own hash inside itself.
- **Authenticated GitHub username:** `CHAIR-DOT`, verified with the authenticated GitHub API after official browser/device authorization.
- **Repository:** `CHAIR-DOT/chair-barber-marketplace`.
- **URL:** [https://github.com/CHAIR-DOT/chair-barber-marketplace](https://github.com/CHAIR-DOT/chair-barber-marketplace).
- **Visibility:** **Private**, verified from GitHub repository metadata. This is source-code hosting; the application still runs only on localhost.
- **Remote:** `origin` → `https://github.com/CHAIR-DOT/chair-barber-marketplace.git`.
- **Primary branch / upstream:** `main` → `origin/main`. Normal push: `git push`; inspect fetch/status before incorporating remote changes. Preserve existing history and unrelated edits.
- **CLI:** GitHub CLI 2.101.0 at `/Users/macuser/.local/bin/gh` (use the full path if needed). Its official release archive matched the published SHA-256. Secure browser authorization succeeded; no tokens/device codes were stored in project files. The stalled Homebrew install was stopped and no shell-profile changes were made.
- **Commit identity:** Existing global name/email remain unchanged. Repository-local author name preserves the existing valid name; repository-local email uses the address the user supplied. Git author name and GitHub account name need not be identical.
- **Tracked content:** Source/config, lockfile, licensed assets, tests, brief, memory and docs. Dependencies/builds/caches, env files, private-key/credential formats, logs/temp files, OS/editor metadata, assistant-local state and synced references are ignored. `.env.example` is allowed only with verified placeholders; none exists. Never delete real local env files just because they are ignored.
- **Workflow:** Read memory/code → implement → test → update current memory sections → inspect diff/status/staged content for secrets → descriptive commit → push to this same repository → verify remote commit/upstream and expected clean tree. Keep memory and code in the same commit whenever practical. No force-push/history rewriting without explicit approval; no new repository per task.
- **Next action:** Continue the existing frontend when the user requests a change. GitHub setup has no remaining authentication blocker.

## Verification

**Fresh for localization, 2026-09-16:** TypeScript passed; **26/26 tests** (9 domain + 17 localization/formatting/metadata checks) passed; production build passed with 57 generated pages. Production HTTP checks passed for **55 valid routes, 5 expected 404s and 25 images**. Initial restricted HTTP access failed with EPERM; the approved run passed. No lint script is configured. The known Next `NoFallbackError` diagnostics still accompany intentionally invalid static routes.

Browser QA on isolated `127.0.0.1:3011`: Georgian first visit; all 22 page surfaces in KA/EN/RU; 264 route/locale/width measurements at 375/768/1024/1440, with the sole discovered profile overflow fixed and retested. Sixteen additional date-heavy final-build responsive checks passed. Visual inspections covered desktop/tablet/home/profile/dashboard/mobile navigation and Cyrillic/Georgian fonts. English/Russian persisted across navigation and refresh; localized page titles remained correct after the streaming fix. Favorites and four Skin Fade specialists remained unchanged through all locale switches. A new test booking (Giorgi, haircut, 17 September 10:45, ₾35/45min) remained identical across switching, confirmation, account navigation and refresh. Registration, localized native validation, comparison, review/portfolio dialogs, empty states and cross-tab locale changes with an open review/error/draft were checked. Customer review text stayed verbatim. Final observed browser console had no errors/warnings. Georgian review dates/calendar labels and decimal separators were confirmed after the Intl fallbacks.

Only isolated QA-origin demo data was changed; the user’s existing port-3000 data and preview were preserved. Browser viewport overrides and temporary tabs were cleaned up. The separate production listener was stopped. See [VERIFICATION.md](VERIFICATION.md) for scope and native-browser-control limits.

**Fresh during Git preparation, 2026-09-15:** dependency consistency passed; TypeScript passed; **9/9 tests**; production build passed (57 generated pages); HTTP checks passed for **55 valid routes, 5 expected 404s, 25 images**. Own test server on 3011 was stopped; existing development server on 3000 preserved. No lint command exists. The updated `next typegen && tsc --noEmit` command also passed after the baseline checks. All 20 required memory sections and local documentation links were checked. A clean `git archive` of the committed sources (reusing installed dependencies) successfully generated Next declarations and passed typechecking without pre-existing build output.

Upload audit: no real credential candidates/URLs, env files, private keys/certificates, source symlinks or sensitive JPG metadata found. Stock credit tags are expected. `.DS_Store` is now ignored. Original `AGENTS.md` remains mode 444. The staged audit passed for all 85 files: memory included, 25 images included, no forbidden/generated/env files or credential signatures found. `git diff --cached --check` passed. The local baseline commit succeeded. GitHub upload verification confirmed matching branch commit IDs and all 85 file paths, modes and content hashes, including memory and 25 images; no forbidden generated/environment paths were present. Private visibility and `origin/main` tracking were also confirmed. Application tests were not repeated for this authentication/documentation-only completion.

**Earlier browser checks, 2026-09-15:** filters/reset/no-results, favorites after refresh, comparison/lightbox Escape, mobile filters, any-barber booking → same-ID reschedule → cancel, one eligible review, price/service/schedule/portfolio/profile edits, role navigation/sign-out and optional WebMCP. Seven main surfaces measured at 375/768/1024/1440px without page overflow after the mobile table fix. Production home/profile had no observed browser console errors/warnings. These interaction checks were not rerun for Git preparation. See [VERIFICATION.md](VERIFICATION.md) for details and limits.

## Recent Changes

### 2026-09-16

- Implemented complete Georgian-default / English / Russian frontend localization with semantic catalogs, independent locale persistence, header/mobile selector, interpolation/plural variants, entity display helpers, translated metadata and native form validation messages.
- Preserved canonical names, IDs/slugs, prices, bookings and user-written reviews/custom content. Translated generic services/styles/descriptions without duplicating entities. Added local Georgian fonts while retaining the visual identity.
- Browser QA caught and fixed streamed metadata reverting after refresh, Georgian profile overflow at 375px, and browsers missing Georgian Intl date/number data. A search-scope regression found during review was corrected; 55 original canonical queries retain their original result IDs.
- Verified 22 main screens × 3 languages × 4 widths, then retested affected date-heavy views on the final build. Confirmed keyboard/mobile selector, preferences after refresh, favorites, preserved form/review drafts, comparison, booking selections/confirmation/saved appointment, dialogs and empty states.
- Final checks: TypeScript, 26/26 tests, production build (57 generated pages), 55 valid routes, 5 expected 404s and 25 images all pass. No missing translation calls or secret/generated-file candidates found. Updated memory, README, design/backend docs and the mandatory three-language authoring rule for the existing repository workflow.

### 2026-09-15

- Built CHAIR.'s frontend, related fixtures, reusable UI, local assets, customer/barber workflows, validation and documentation.
- Fixed any-barber confirmation, hydration/editor persistence, booking horizon/eligibility, mobile table overflow and invalid-route status handling.
- Created project memory/read-update instructions, preserved the original brief and documented the project location.
- Reorganized memory around current truth and concise history; established mandatory ongoing commit/push workflow.
- Committed baseline `f3e9dc2` on `main`, expanded ignores, audited 85 tracked files and reran baseline checks. Installed verified official GitHub CLI.
- Updated typechecking to generate ignored Next declarations before checking fresh checkouts.
- Completed secure GitHub sign-in as `CHAIR-DOT` after a device-code retry; created the private `chair-barber-marketplace` repository, pushed `main`, and verified visibility, upstream, commit and all 85 remote files. Added repository details to memory and README.

## Next Recommended Steps

1. Localization is complete. Continue the user’s next requested improvement in the existing repository; maintain memory and commit/push meaningful reviewed changes together.
2. For future UI changes, add Georgian/English/Russian semantic messages together and rerun relevant checks. Preserve the current design and state.
3. When requested, expand accessibility/interaction coverage or begin backend schema/permissions/authentication and transactional bookings. Payments/notifications/public deployment remain deferred.

## Last Updated

**2026-09-16 (Asia/Tbilisi)** — Georgian-default, English and Russian frontend localization is complete and verified. All 26 tests, TypeScript, production build and HTTP checks pass; multilingual/responsive/persistence/booking checks passed. Memory and translation-authoring rules are current. Use the existing `main` / `origin/main` workflow and preserve port-3000 browser data.
