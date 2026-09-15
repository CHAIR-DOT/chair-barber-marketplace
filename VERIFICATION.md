# Verification record

Latest localization checks: 16 September 2026. Earlier baseline checks below are retained as historical evidence.

## Historical automated checks — 15 September 2026

- `npm run typecheck` — passed.
- `npm test` — 9 domain tests passed: related fixtures, valid shop days and service snapshots, overlapping durations, reschedule exclusion, cancellation release, invalid/past dates, service eligibility, closing hours, 30-day availability horizon, and review eligibility.
- `npm run build` — passed with Next.js 16.3.5, React 19.3.0, and TypeScript 7.0.2.
- `npm run check:routes -- http://127.0.0.1:3001` against `npm start -- --port 3001` — **55 valid routes returned 200, 5 invalid dynamic routes returned 404, and all 25 local JPG images returned image responses**.
- Production homepage and barber profile loaded in the browser with correct page titles, no broken loaded images, and no production console errors/warnings in the observed run.
- The five intentional unknown-route requests returned the expected 404 pages. Next.js printed its internal `NoFallbackError` diagnostic for these rejected static paths in the server terminal; valid route rendering and browser interactions were unaffected.

## Historical browser interactions — 15 September 2026

- Navigation from homepage to discovery, barber profile, booking, and account.
- Neighborhood and style filters narrow results; clearing filters restores them.
- An unmatched query displays the no-results state and a recovery action.
- Barber favorites update immediately and survive navigation and refresh.
- Comparing two barbers displays prices, experience, specialties, locations, and next availability. Escape closes the native dialog.
- Portfolio filtering changes visible work; selecting a photo opens the lightbox; Escape closes it.
- A new barber displays both empty portfolio and no-review states.
- Booking requires a selection before continuing. Shop, any-barber, service, date, and time selections reach review and local confirmation.
- “Any available barber” confirms the same named barber, service, date, time, duration, and price shown during review.
- The new appointment appears in the customer list and survives refresh.
- Rescheduling updates the same reference and keeps appointment count unchanged.
- Cancellation removes the test booking from upcoming appointments.
- A completed sample visit accepts a star rating, optional dimension, and written review; the review appears in My reviews and cannot be submitted twice.
- Barber price edits persist after refresh and update the public service price. The original test price was restored.
- Adding a service updates the barber’s menu.
- Blocking a daily start time persists after refresh and disables that slot in booking. The temporary test block was restored.
- Adding and removing a portfolio look both update the workspace.
- A saved single-word barber name survives refresh and renders safely in cards. The original name was restored.
- Barber registration opens the barber workspace; customer sign-in opens the customer account. Sign-out restores the logged-out navigation.
- The optional WebMCP favorite tool registers with its schema, updates the same visible favorites, and rejects an unknown barber ID without changing state.

## Historical responsive checks — 15 September 2026

The homepage, discovery, barber profile, shop profile, booking, customer appointments, and barber dashboard were checked at **375, 768, 1024, and 1440 pixels** using browser viewport and rendered-document measurements. The dashboard’s mobile table overflow was corrected; its table now scrolls inside a 339px container at a 375px viewport.

The mobile discovery filter dialog was exercised: changing the neighborhood and applying filters updates the result count. Main page surfaces have no horizontal page overflow at the tested widths. The native preview was visually inspected for typography, imagery, search layout, and profile structure.

## Prototype limits

These checks validate a frontend prototype, not a production booking service. Authentication and authorization are simulated, local storage is device/browser-specific, and stock photographs are illustrative. Multi-user booking conflicts, payments, notifications, uploads to remote storage, and server-enforced review permissions require the backend described in `BACKEND_PLAN.md`.

Browser testing creates local demo activity. To start fresh, use **About this preview → Reset demo data**; this is optional and explicitly confirms removal of local demo changes.

## Git baseline preparation — 15 September 2026

- Reran dependency consistency, TypeScript, all 9 domain tests, production build, and production HTTP checks: 55 valid routes, 5 expected invalid-route 404s, and 25 images passed. No lint script is configured.
- Updated typechecking to generate ignored Next declarations first; verified it both in the workspace and a clean archive of committed sources using existing installed dependencies.
- Audited project candidates and staged content: 85 files including memory and 25 images; no real credential candidates or forbidden generated/environment files found. Tested ignore rules; preserved the original read-only instructions and local browser data.
- Two optional Sharp/WASM packages appear as extraneous in the local install but are present in the lockfile; all declared dependencies match and checks passed.
- Stopped only the separate production test server on port 3011. The existing development preview on port 3000 was preserved.
- Full earlier browser interaction/responsive checks were not repeated for these Git/documentation changes.

## GitHub upload verification — 15 September 2026

- Authenticated GitHub API identified `CHAIR-DOT`; repository metadata confirmed `CHAIR-DOT/chair-barber-marketplace` is private with default branch `main`.
- First push succeeded and established `main` tracking `origin/main`. The remote branch commit matched the local commit.
- Compared every remote file path, mode and content hash against the local Git tree: all 85 files matched, including `PROJECT_MEMORY.md` and 25 images; no ignored dependency/build/environment/credential paths were uploaded.
- Updated repository details in memory and README. No application code changed; the preceding successful build, type, domain and HTTP checks remain the relevant validation.

## Full frontend localization — 16 September 2026

### Final automated validation

- TypeScript passed. `npm test`: **26/26**, covering the original 9 domain cases plus 17 localization/formatting/metadata cases. Added checks include dictionary key/placeholder parity and collisions, Georgian defaults/invalid preferences, interpolation/plurals/fallback, canonical and user-content preservation, GEL/date invariance, exact route-title handling and simulated missing Georgian Intl data.
- Production build passed: **57 generated pages**. No lint command is configured.
- Final production HTTP check: **55 valid routes, 5 expected unknown-route 404s, 25 local JPGs** passed. Restricted-network EPERM required the approved local-network run. Known Next internal `NoFallbackError` diagnostics still appear for rejected static paths.
- Read-only source audit found no missing UI translation keys or unintended English interface copy. Canonical fixture/type/date-domain files, assets and route structure remain unchanged. Booking rules only changed from English error strings to semantic error codes.
- Search review caught and removed service-name expansion that had widened style queries. Comparing 55 canonical queries against the original implementation returned identical barber IDs; all 12 styles and Vake match equivalent IDs across languages. Skin Fade retains its original four specialists.

### Browser coverage

Used the isolated production origin `http://127.0.0.1:3011`, preserving the user's existing data and preview on port 3000.

All **22 surfaces** were inspected in Georgian, English and Russian:

- Home, discovery, barber list, Giorgi profile, shop list, Gentleman's Corner profile.
- Booking, login, registration (role selection and details).
- Customer overview, appointments, favorites, reviews, settings.
- Barber dashboard, profile, portfolio, services and schedule.
- Styles, Skin Fade detail and About.

At **375/768/1024/1440px**, checked rendered page widths for each surface in each language (**264 combinations**). A Georgian profile grid expanded to 416px at 375px; `min-width: 0` on its content and contained profile-tab scrolling fixed it. Retest passed. The final Georgian date/number fallback build passed **16 additional checks** across booking calendar, barber profile, customer appointments and barber dashboard at all four widths. Representative screenshots were visually inspected for header/card/button typography, Georgian/Cyrillic glyphs, mobile navigation and dashboard layout.

### Behavioral checks

- A fresh locale preference opens Georgian despite the browser's English native controls. The provider does not consult browser language.
- English and Russian both persist after navigation and reload. HTML language updates. A production refresh exposed late server metadata overwriting translated titles; an idempotent head observer fixes the race, and reload verification passed.
- Tab focus reaches the labeled native language select; Space, arrow selection and Enter changed the mobile menu to English. Mobile menus were inspected in all three languages.
- Favorites, original four-specialist search results, current query and comparison selections survive language switching. Saved favorites remain after refresh.
- Booking state retains shop, named barber, service, selected date/time, duration and GEL price across KA→EN→RU. Confirmed isolated demo visit for Giorgi Kapanadze: haircut, 17 September at 10:45, 45 minutes, ₾35. Confirmation and customer history retain these details after locale changes and refresh.
- Customer settings draft text remains while switching language; the draft was restored without saving. Cross-tab language changes translate an open review dialog and rating error while preserving the written draft. Escape closes dialogs.
- Login native required-field feedback was visually verified in Russian; valid dummy demo input still opens the customer account with a localized toast. No real authentication or messages were sent.
- Registration detail form, review dialog, portfolio-add dialog, file chooser label/status, comparison dialog and search/profile empty states were checked in all three languages. Actual review paragraphs and names remain verbatim.
- This browser falls back to English when Georgian Intl data is unavailable. Added lightweight calendar and numeric fallbacks; final browser verification displays Georgian weekday/month labels, `12 სექ. 2026`, and rating `5,0`. Native locale formatting remains in use when supported.
- Final observed production browser console: no warnings/errors. Temporary tabs and viewport overrides were cleaned up and only the separate QA listener was stopped.

### Remaining language boundaries

No known untranslated app-owned UI remains from this audit. Canonical names, addresses, identifiers, custom/user-created text and customer-written review paragraphs intentionally stay as authored. Native date/time picker subcontrols and the OS file-selection dialog follow browser/OS language; app-owned labels, date buttons and chosen-file status are localized. No automatic review translation or backend locale persistence was introduced. This is focused multilingual QA, not a formal assistive-technology or visual-regression certification.
