# Verification record

Latest checks: the cinematic motion-poster replacement, 16 September 2026. Sections below that task are historical evidence for retired/earlier implementations.

## Cinematic motion-poster replacement — 16 September 2026

### Automated and preservation checks

- **29/29 tests pass**, including 9 domain, 17 localization and 3 persisted-style validation tests. Obsolete model/asset tests removed; remaining state tests preserve valid canonical IDs and old saved briefs.
- **TypeScript and production build pass**, 57 generated pages. No lint script configured. Initial restricted compiler stalled; stopped it and the approved build passed.
- Production HTTP checks pass **55 valid routes, 5 expected unknown-route 404s, 31 local images** (25 existing photos, 3 flags, 3 hero renditions). Expected invalid static routes still emit the pre-existing Next `NoFallbackError` diagnostics.
- New hero images: 1536×1024 /171,316 B; 960×640 /60,692 B; 480×320 /14,518 B. Same image/aspect ratio, total246,526 B; actual chosen rendition depends on width. Hashes/provenance in HERO_VISUAL_GUIDE.md. No new dependencies; removed Three.js/types, glTF Transform and Meshoptimizer; retained sharp.
- Lower JSX from `<PremiumFilterBar />` onward is byte-identical. All31 lower-filter rules/declarations/media contexts are identical after extraction. Language selector TSX/CSS and three flag files unchanged. Mock data/provider, booking logic, discovery, cards, routes, original AGENTS and synced material unchanged. Only now-unused style-provider APIs/hero URL helper removed; saved beard/submitted fields remain.

### Browser checks

- Hero measured in **36 cases**: KA/EN/RU ×375/430/768/1024/1440/1920 ×667/800. No horizontal page overflow or clipped tested heading/intro/CTA/footer/signature; main image ready in all, zero canvas. Phone and desktop screenshots reviewed; full-chair desktop framing and mobile portrait crop refined. Final desktop edge fade addresses visible source-image seam.
- Language menus checked in **18 cases**: three locales ×six widths at667px height. Correct loaded GE/GB/RU flags, selected language, no offscreen popup and working Escape dismissal. Mobile menu opened/closed correctly. Old Giorgi favorite stayed saved through language changes and discovery; no user data was reset.
- CSS camera transform sampled during repeated visual checks spanning over100seconds; observed scale/drift progression. CSS uses continuous alternate20s endpoints (40s full camera/light cycle), so there is no timeline reset jump. This is subtle camera/light treatment, not independently moving tools or chair assembly.
- Scrolled hero completely offscreen: `data-motion=paused` and CSS animation play state paused. Returned to top: running. Document-hidden pause is source-reviewed; the in-app background tab reports itself visible, so no OS-level hidden-tab claim.
- Temporary localhost503 proxy failed both main rendition URLs while allowing the480px poster. Foreground image was hidden, motion paused and matching static artwork visibly remained. Hero discovery link reached `/discover`. A later successful responsive image load resets the failure flag (reviewed fix).
- Temporary reduced-motion proxy activated the actual CSS media rules and returned a matching media condition to JS. Camera animation/transform were `none`, light/dust `display:none`, main image visible and fade0s. Hero salon link reached `/shops`. This is emulated response testing, not a change to the user's macOS accessibility settings.
- Final production recheck at 1024/768/1920 confirmed the desktop edge fade and matching `contain/right center` main/poster framing; the deliberately failed image still showed the same composition. Fresh normal production console warnings/errors: **[]**. Failure-origin503s are intentional. No technical failure message, player controls, mannequin UI, sound or canvas remains.

### Limits and cleanup

Physical phones, real FPS/power/memory, formal screen-reader acceptance and native OS reduced-motion settings are not measured. Total-image failure and no-JS poster paths are source-reviewed. New hero links/navigation and existing domain tests passed; this task did not submit bookings or rerun every dashboard mutation. Earlier detailed booking/native-picker evidence below remains historical.

Temporary verification proxies/listeners/tabs are cleaned up after final validation. Original localhost3000 preview and user storage stay intact. No raw generated PNG, test proxy, source cache, installer or credential is included. See HERO_VISUAL_GUIDE.md for the current source/prompt/fallback contract.

---

## Human asset replacement — 16 September 2026

### Automated and source checks

- **36/36 tests pass**. Registry/build-contract parity; decoded compressed GLB group/material/shared-human/texture contracts; nine distinct same-human preview files and exact output hashes; model/preview/texture/triangle budgets; existing domain, localization and style-state regressions.
- **TypeScript passes. Production build passes**, with 57 generated pages. No lint script is configured. Formatting and diff whitespace checks pass.
- Production HTTP checks on 3011 pass: **55 valid routes, 5 expected unknown-route 404 responses, 37 local images and the human GLB**. The image set is 25 existing photos, 3 flags and 9 new previews. Intentional invalid static routes still cause the known Next `NoFallbackError` diagnostics; these are not valid-route failures.
- Final GLB: **7,556,172 bytes**, 239,004 cached triangles, **133,528 maximum visible** for one pair; all embedded textures decode and are ≤2K. Nine transparent 640×800 WebPs total **225,666 bytes**. Model has no external URI or machine path. Local Meshopt decoder; WebP color and lossless WebP normal.
- Verified pinned addon and all **31 selected CC0 source files** from a fresh cache. Base, hair and beard repository builders reproduce reviewed geometry; assembled raw GLB is byte-identical to the reviewed export. A fresh nine-preview assembler smoke run succeeds. The final 40-sample render set was individually inspected. Optimizer source contract and final assets pass validation.
- Original read-only AGENTS.md is unchanged. No source caches, installers, Blender files, environment files or credential candidates are included. Largest pending file is the intended GLB. Removed the obsolete scan/assets/procedural modules and their tests. Existing app/page.tsx, fixtures, provider, booking rules, prices and lower marketplace source are unchanged.

### Browser checks

- Inspected all nine live 3D pairs, confirming distinct visible hair/beard geometry, retained identity and fixed camera/lighting. Full beard remained while hair changed; hair remained while beard changed. Examined angled views and rotation/reset. Face and groom boundaries still look synthetic; these visual limits are recorded below.
- Exercised **all nine Photo View pairs**: correct filenames, decoded images, matching labels, and no retained canvas. Static renders are from the same exported human/grooms. Corrected poster sizing so stage-height framing matches the orthographic viewer. Offline shading is visibly different from WebGL; no pixel-identical claim.
- Hero and open language dropdown measured across **36 combinations**: KA/EN/RU × widths **375, 430, 768, 1024, 1440, 1920** × heights **667, 800**. No horizontal page overflow, clipped tested labels/controls, or offscreen listbox. Correct selected endonym, loaded local flags, and unchanged selected pair throughout. Screenshots inspected on desktop and mobile in all three languages.
- Six additional live-3D width checks stayed ready, with canvas and hotspots within the stage. Earlier language-only checks this same task covered keyboard arrows/Home/End/typeahead, Enter/Escape/Tab, mobile Escape/focus behavior, light header and 375×360 short menu. Those checks preceded the completed asset integration.
- Reload preserved **Taper Fade + Full beard**. CTA produced four matching specialists and the submitted style brief. Existing favorite remained saved. Continued via Giorgi's profile to booking review: Signature haircut, 17 September 2026 10:00, **₾35 / 45 minutes**. No new booking or product record was submitted.
- Fresh production tab loaded the actual GLB with one ready canvas, hidden matching poster and equal poster/stage heights; observed console warnings/errors **[]**. Main development tab also showed no warnings/errors after the final runtime fixes.

### Failure checks and limits

A temporary loopback-only proxy on 3012 deliberately returned 503 for the GLB and the first default preview request. Automatic fallback removed the canvas and showed the localized preview error. Clicking Retry loaded the exact matching image with its retry query and removed the error. Changing to Taper Fade + Full beard loaded its correct photo and the CTA opened the matching discovery result. No test-failure switch or proxy endpoint is in production code.

**The photographic target is not achieved.** The new legal temporary model has open eyes and credible anatomy, but skin is generic, pore detail is authored noise, hairlines can look geometric, and beard cards are coarse. There was no gross detached groom or displaced identity in inspected views, but this is not professional groom/skin acceptance. Those now-retired guides and assets are archived in commit `aed398e`; the current direction is HERO_VISUAL_GUIDE.md.

Physical phones, hardware WebGL loss, reduced-memory hardware, real FPS/GPU-memory measurements and a formal screen-reader audit were not available. Save-Data/device-memory and texture-decode failure paths were code-reviewed; the deliberate network failure was exercised. The older native date-picker tool limitation remains. No Lighthouse or real-device performance score is claimed.

The Mac/app restart left the agent's old 3011 development process unresponsive; it was identified and stopped, and testing resumed with fresh tabs. No unrelated server or browser storage was reset. Temporary QA listeners were stopped; the normal localhost preview is restored on 3000. Temporary browser overrides are reset. Error tabs created during the server switch are left to normal temporary-tab cleanup if the browser URL policy prevents explicit closure.

## Real 3D style switching and focused UI fixes — 16 September 2026

### Automated and source verification

- TypeScript and production build pass (57 generated pages); 31/31 tests pass. Two new tests use the bundled GLB to check every hair/beard ID, distinct finite geometry, cached switching, mouth clearance, unchanged source vertices, bounded hair geometry and disposal. Package ESM mode resolves the Three.js CommonJS test warning; no warning suppression is used. No lint is configured.
- Local production HTTP check passes: 55 valid routes, 5 expected unknown-route 404 responses, 25 images. Expected Next `NoFallbackError` logs for intentionally invalid static routes remain unchanged.
- The original three model files still match the documented SHA-256 values; no new downloaded or large binary assets. Existing data, prices, provider, filter predicates and lower homepage JSX are unchanged. The one booking-flow edit adds localized progress-button accessible names. The hero heading also has a correctly spaced localized accessible name across its styled text segments.
- Reviewed async selection retention, visibility-only switching, child transforms, renderer disposal, late-load failure handling, idle/offscreen rendering and touch intent. Each visible hairstyle uses one or two merged meshes; beard shells/instanced strands share resources. Setup timings from local geometry tests are not device performance benchmarks.

### Browser checks on isolated localhost 3011

- Visually selected all eleven hair styles and all six beard choices. Compared actual silhouettes/surfaces, not only labels. Repeated hair changes retained full beard; repeated beard changes retained long hair; then changed hair with defined beard. No scene reset, loading flash or repeated asset load is introduced by the selection path.
- Refined coarse hair grooves/hairline/fades and jagged beard lip boundaries after browser inspection. Stubble now uses fitted strands only. Clean-shaven removes added geometry; residual scanned stubble and closed eyes remain asset limitations.
- Refresh and KA/EN/RU changes retained the canonical selection. Selected cards reveal within their own scroll container on hydration/category/locale/viewport changes, without scrolling the page.
- Hero measured in **96 combinations**: KA/EN/RU × widths 375, 390, 430, 768, 1024, 1280, 1440, 1920 × heights 667, 800, 900, 1080. No horizontal page overflow, caption/configurator overflow, hero-bottom clipping or out-of-bounds main panels after the fixes. Visual inspections covered every width across representative languages/heights.
- Discovery, barber directory, shop directory, Giorgi profile and booking measured in **120 combinations**: all three languages × all eight widths. No page overflow, broken loaded images, overflowing barber action rows or comparison targets smaller than 44px.
- Root cause of missing text reproduced before edits: Georgian step row bottom 822px versus fixed hero bottom 807px at 1280×667. Removed that redundant strip intentionally. Useful rotation guidance and attribution now occupy normal flow below a dedicated model stage; hero height grows with text. No Photo View control/state/keys/styles remain.
- Mobile dialog style dropdown at 375×667 stayed inside the viewport (bottom 659px), portaled inside its native dialog. End scrolled the options internally; Escape closed only the list, then Escape closed the sheet. Trigger retained keyboard focus. Desktop/home controls use the same portal/keyboard behavior.
- Keyboard rotation and bounded mouse drag worked at desktop and 375px. The final angled view revealed a beard anchor outside the jaw; anchors now use nearest actual scan vertices before projection. Percentage positions avoid stale pixel overflow during resize.
- Mobile menu opened with readable language/account links, Escape returned focus to its toggle, and crossing to desktop removed the menu. Shared account routing and active navigation semantics were source-reviewed.
- Russian mobile profile and booking review remained usable. Profile service CTA opened Giorgi's Signature haircut; selected 17 September / 10:00 and reached review with unchanged **₾35 / 45 minutes**. No new booking was submitted and no product records were changed.
- Fonts use local DM Sans/Serif for Latin and local Noto Georgian for Georgian. Ordinary Russian uses the existing Arial/Georgia system fallback (the bundled Noto Cyrillic-ext subset does not cover basic Russian). Actual visual checks found no missing glyphs; typography can vary by operating system.
- Main production browser console showed no observed errors/warnings. The isolated fallback proxy intentionally produces a GLB 503; that expected failure is separate from production checks.

### Automatic fallback and boundaries

A loopback-only QA proxy on 3012 returned 503 for the GLB. The canvas was disposed, automatic existing photo appeared, no Photo View control or inactive hotspots were exposed, and both style categories remained usable. Taper Fade + Defined beard reached four matching barbers. This tests asset-load failure, not a physical GPU failure.

Real touch hardware, hardware WebGL context loss, slow-device performance and a formal screen-reader audit were not available. Pointer interaction and `pan-y`/capture cleanup were checked; do not call narrow desktop viewports real-device touch testing. The earlier native date-popup tool crash remains untested in an ordinary browser. App-owned booking date/time controls passed this task.

Temporary QA tabs/server/proxy are cleaned up after verification; the original port-3000 preview and data remain intact.

## Interactive 3D studio and premium filters — 16 September 2026

- TypeScript passed; 29/29 tests passed (9 domain, 17 localization, 3 new canonical style/persistence/corruption checks); final production build passed with 57 generated pages. No lint script is configured.
- Final production route checks on isolated `127.0.0.1:3011` passed: 55 valid routes, 5 expected 404s, 25 local images. Model/texture assets also loaded successfully in the real scene. Intentional invalid static routes still emit the known Next `NoFallbackError` logs.
- Model load/short entrance, bounded pointer drag, keyboard rotation, Hair/Beard hotspots, both category panels, hair/beard selections and existing discovery CTA worked. Low Fade + Goatee survived same-tab refresh; choices stayed unchanged across language changes.
- Textured Crop + Short beard opened the real style filter with four matches, then Giorgi's profile and existing booking. Demo confirmation retained Signature haircut, ₾35 / 45 min, 18 September 2026, 11:30, reference EDF66FB2. Only the isolated QA origin was changed.
- Homepage and discovery each measured at 375/768/1024/1440 in KA/EN/RU: 24 combinations, no horizontal page overflow. Visually inspected desktop/tablet/mobile portrait/configuration/filter layouts. Geometry's existing shoulders made the initial procedural base redundant; it was removed, lighting softened and final desktop rendering rechecked.
- Verified keyboard location dropdown selection, service/rating/experience/distance/availability controls, max-price Home/ArrowRight → ₾20 / no results, price reset, real chips/counts, chip removal, Clear all restoring 16 barbers / 8 shops and retaining Lowest price sorting. Full filter predicate/sort block remains identical to the preceding commit. Lower homepage is byte-identical from quick-discovery onward; fixtures and cards are unchanged.
- Home More filters navigates with current form values and `filters=open`. On mobile this opens the bottom sheet; choosing Vera produces 4 barbers / 2 shops. Dropdown Escape closes only the dropdown; Show results closes the sheet. Desktop remains a sidebar.
- Photo mode disposes the scene, resets hotspot positions and keeps choices. A temporary loopback proxy on 3012 returned 503 only for the GLB. The automatic fallback showed the local photo, removed the canvas, kept both selectors and navigated Taper Fade + Defined beard to four matching specialists. The intentional 503 is expected test output, not a production asset failure.
- Audit confirmed all three runtime model files match upstream hashes (700,038 bytes total), source/license/attribution are included, no unnecessary large assets or secret/generated paths. Separate async Three.js chunk is approximately 621 KB raw / 153 KB gzip and absent from initial HTML scripts. No FPS or Lighthouse score is claimed.

### Test boundaries

Pointer drag was exercised at desktop and narrow viewport sizes. Physical touch hardware, hardware WebGL context loss and a complete screen-reader audit were not available; code paths for touch intent, pan-y, reduced motion, hidden/offscreen rendering and cleanup were reviewed. The failure proxy tests asset-load failure and shared fallback behavior, not GPU failure itself.

The existing native date input accepted URL preselection and its date chip removed correctly. Automated fill did not commit a native date in the in-app browser, and opening its OS/browser-owned date popup crashed the isolated test tab. Do not claim that picker interaction passed; retest it in an ordinary browser. Application date handlers/rules were not changed. The crashed temporary tab is left for automatic tool cleanup because the browser tool's URL policy rejects actions on its generated crash page; no security bypass was attempted.

Temporary successful QA tabs/server/proxy are closed after checks and viewport overrides reset. The user's original port 3000 preview/data remain intact. Broader dashboard/profile/account regression results below belong to prior turns.

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


## GitHub Pages publication — 16 September 2026

Deployment-only task; no redesign or product change. User explicitly authorized making `CHAIR-DOT/chair-barber-marketplace` public after GitHub rejected private Pages under the current plan. Pages source is Actions, HTTPS enforced.

- Setup commit: `e4729e7af5b9c134aba40650cf9d13d1bafba00a`.
- [First successful build and deployment](https://github.com/CHAIR-DOT/chair-barber-marketplace/actions/runs/35104430569).
- [Verified public site](https://chair-dot.github.io/chair-barber-marketplace/).
- 30 tests passed, TypeScript passed, normal and Pages builds each generated all 57 Next pages. The three request-query pages now use client readers under Suspense. Existing static profile/section parameters remain unchanged.
- Both local static and live HTTPS checks passed: 55 valid routes, 5 unknown-route 404s, 31 images; 57 directory page paths and 113 referenced files (22 JS, 4 CSS, 1 SVG icon, 43 WOFF, 43 WOFF2). Both live commands exited 0; no bundles/fonts were replaced by HTML responses.
- Artifact review covered 429 output files. No detected secrets, env/config/docs/Git/source-map files or local-user paths. Before public visibility, 9 commits / 272 historical blobs were reviewed, with no concrete secret blocker; existing author metadata/history disclosure was explicitly authorized.
- Static preview browser: Georgian first visit; English/Russian content and metadata; native Vake search (4 barbers / 2 shops); profile navigation; booking link preselection retaining shop-1/barber-1/haircut, 45 minutes/₾35; barber registration role; active dashboard and direct reload. Homepage at 375/768/1440px had no horizontal overflow, correct responsive hero images and loaded fonts.
- Live browser: Georgian default, EN/RU switching and loaded flag images; 1440px Georgian screenshot and 375px Russian screenshot; Georgian mobile menu/language switching; native search retains query through GitHub Pages directory redirect; profile navigation and direct reload; active barber dashboard. No observed missing images, horizontal overflow or warning/error console messages.
- Existing localhost preview still returns HTTP 200, root `/discover` and `/images` paths, Georgian content and the previously saved Giorgi favorite. No browser data was cleared or new booking/product record added. Normal development build remains available.
- Temporary Python static preview initially hit its default connection backlog during concurrent requests. Increasing only that temporary server queue fixed the check; application code required no change. Own QA server/tab closed after checks; public site and original localhost tabs retained.

Limitations remain those of the existing prototype: JavaScript is required; only generated profile/section slugs exist; unknown routes return 404. All accounts/bookings/uploads are browser-local mock state. Public hosting adds no real backend/auth/payment/shared reservation service. Localhost and the public origin keep separate storage. Physical-device performance and formal accessibility were not tested in this deployment task.
