# CHAIR. — Barber marketplace prototype

A photography-led marketplace for finding a barber in Tbilisi. Built with Next.js App Router, React, TypeScript, Tailwind CSS, Lucide, and small reusable UI components. Everything is local and mocked.

## Continue in a new chat

Read [PROJECT_MEMORY.md](PROJECT_MEMORY.md) first. It records the current stopping point, completed work, important decisions, test results, known limitations, and the next action. [PROJECT_BRIEF.md](PROJECT_BRIEF.md) preserves the original request.

The user requires the memory file to be updated after every project-related work turn. [AGENTS.override.md](AGENTS.override.md) provides this standing project instruction while preserving the original read-only `AGENTS.md`.

For meaningful development tasks, test the changes, update the relevant memory sections, review the diff and staged files for secrets, then commit and push to the established GitHub repository. Keep code and memory together in the same commit whenever practical. Repository details and setup status are in `PROJECT_MEMORY.md`. Do not force-push or create a new repository for each task.

Start a new task in this same folder with: **“Read PROJECT_MEMORY.md and continue from the current stopping point. Keep it updated after every work turn.”** If the chat cannot access this folder, attach the memory file and provide the source project when editing or running it is needed.

## Run locally

Requires Node.js 20.9 or newer and npm. Dependencies are pinned in `package-lock.json`.

```bash
cd /Users/macuser/.codex/.chatgpt-projects/g-p-6aa958719c2081918e959be626523117
npm ci
npm run dev
```

Open **http://127.0.0.1:3000**. The development server binds only to this computer. Photos and fonts are included locally, so the running app does not depend on external asset services.

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
src/lib/dates.ts         Shared Asia/Tbilisi date and GEL formatting helpers
src/lib/i18n.ts          Initial English/Georgian navigation dictionary and locale boundary
public/images/           Local licensed illustrative photography
tests/domain.test.ts     Data relationships and booking/review domain checks
```

The store owns mutations; screens consume shared entities and actions. Services have global definitions and per-barber price/eligibility relationships. Appointments snapshot price and duration. Reviews reference the customer, barber, and a completed appointment. The UI mounts after local storage is read, avoiding stale editor values and time-dependent server/client hydration differences.

Future Georgian localization can extend `i18n.ts` and move the remaining English page copy into dictionaries without changing entity IDs or relationships. Localization is prepared, not complete.

## What is mocked

- 8 fictional shops, 16 barbers, 45 reviews, 12 haircut styles, service menus, portfolios, and schedules.
- The customer workspace represents Alex Chikovani. The barber workspace represents Giorgi Kapanadze. Sign-in and registration are UI demonstrations of these roles, not separate real accounts.
- Bookings, favorites, reviews, profiles, prices, uploaded images, and schedules persist in this browser under `chair.prototype.v1`. Browser storage errors show a message and retain session state.
- Slot rules use Tbilisi time, working hours, days off, blocked start times, service eligibility/duration, and overlapping local appointments. “Any barber” resolves to a named eligible barber. Booking dates extend 30 days ahead.
- Review eligibility is simulated: only a completed appointment for the demo customer can receive a review, once. Optional dimension ratings are separate from overall rating.
- Profile views are explicitly illustrative. Other dashboard booking/revenue totals derive from sample appointments; no money is collected.
- Photos are illustrative stock images. They are not the work, identities, or premises of the fictional profiles. Sources and credits are in `ASSET-SOURCES.md`.
- No backend, database, production API, real authentication, payment processing, SMS, email, analytics, or remote uploads exist.

Photo uploads accept JPG, PNG, or WebP up to 600 KB and are saved as local data URLs. This is appropriate only for a small prototype. Booking availability is not coordinated across users or devices; backend transactions are needed before real reservations.

The optional, feature-detected WebMCP `set_saved_barber` tool uses the same favorites action as the visible heart buttons. It makes no external calls. Unsupported browsers retain all normal UI functionality.

## Verification

`npm test` covers fixture relationships, schedule validity, overlapping durations, rescheduling, cancellation release, invalid and past dates, service eligibility, closing hours, the availability horizon, and completed-booking review eligibility.

The browser verification log is in `VERIFICATION.md`. The design tokens and component conventions are in `DESIGN_SYSTEM.md`.

## Backend next steps

See `BACKEND_PLAN.md`: PostgreSQL/Supabase schema, server-enforced permissions, transactional bookings, verified reviews, object storage, payments, and notification jobs. Replace the local action boundary gradually while retaining the UI components.

Framework references: [Next.js documentation](https://nextjs.org/docs), [Tailwind CSS for Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs).
