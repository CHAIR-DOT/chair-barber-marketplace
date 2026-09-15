# Verification record

Checked on 15 September 2026 against the local development app and the production build.

## Automated checks

- `npm run typecheck` — passed.
- `npm test` — 9 domain tests passed: related fixtures, valid shop days and service snapshots, overlapping durations, reschedule exclusion, cancellation release, invalid/past dates, service eligibility, closing hours, 30-day availability horizon, and review eligibility.
- `npm run build` — passed with Next.js 16.3.5, React 19.3.0, and TypeScript 7.0.2.
- `npm run check:routes -- http://127.0.0.1:3001` against `npm start -- --port 3001` — **55 valid routes returned 200, 5 invalid dynamic routes returned 404, and all 25 local JPG images returned image responses**.
- Production homepage and barber profile loaded in the browser with correct page titles, no broken loaded images, and no production console errors/warnings in the observed run.
- The five intentional unknown-route requests returned the expected 404 pages. Next.js printed its internal `NoFallbackError` diagnostic for these rejected static paths in the server terminal; valid route rendering and browser interactions were unaffected.

## Browser interactions checked

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

## Responsive checks

The homepage, discovery, barber profile, shop profile, booking, customer appointments, and barber dashboard were checked at **375, 768, 1024, and 1440 pixels** using browser viewport and rendered-document measurements. The dashboard’s mobile table overflow was corrected; its table now scrolls inside a 339px container at a 375px viewport.

The mobile discovery filter dialog was exercised: changing the neighborhood and applying filters updates the result count. Main page surfaces have no horizontal page overflow at the tested widths. The native preview was visually inspected for typography, imagery, search layout, and profile structure.

## Prototype limits

These checks validate a frontend prototype, not a production booking service. Authentication and authorization are simulated, local storage is device/browser-specific, and stock photographs are illustrative. Multi-user booking conflicts, payments, notifications, uploads to remote storage, and server-enforced review permissions require the backend described in `BACKEND_PLAN.md`.

Browser testing creates local demo activity. To start fresh, use **About this preview → Reset demo data**; this is optional and explicitly confirms removal of local demo changes.
