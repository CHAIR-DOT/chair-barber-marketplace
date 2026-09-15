# Backend integration plan

CHAIR. currently runs with local fixture data and browser state. No database, API routes, authentication provider, payments, email, SMS, or analytics are connected.

## Boundaries

- `src/lib/types.ts` defines the domain entities. IDs link shops, barbers, services, customers, appointments, reviews, and portfolio items.
- `src/lib/data.ts` contains fixtures; `src/lib/booking.ts` owns pure booking rules.
- `src/components/provider.tsx` is the local state/action boundary. Replace these actions with an async repository without changing page composition.
- Frontend localization is implemented in `src/i18n/`: Georgian (`ka`) is the first-visit default, with English (`en`) and Russian (`ru`). Locale selection is independent of the data/action boundary and does not change routes or canonical records.

## Existing localization boundary

`LocaleProvider` supplies semantic translations and display helpers. Dictionaries live in `src/i18n/messages/`; configuration, interpolation/plurals, fixture display rules, and metadata live beside them. Language preference is browser-local under `chair.locale.v1`, separately from mock application data under `chair.prototype.v1`. No backend locale storage or translation service is connected.

Keep this presentation boundary when replacing mock repositories. Barber/shop/customer names, IDs, slugs, prices, relationship keys, and authored review text remain canonical. Generic service/style names and original fixture descriptions translate for display; ID/original-value matching preserves edits and custom content. Generic seed portfolio category titles can translate, while intentionally named works stay unchanged. Any later replacement for fixture translations must preserve that distinction rather than translating or duplicating entire domain records.

Shared `Intl` helpers use `ka-GE`, `en-GB`, and `ru-RU`, retain GEL **₾**, and display booking dates in **Asia/Tbilisi**. Language selection must not alter date/time values, prices, slot eligibility, identity, or booking ownership. Stable error codes cross the domain boundary and become localized messages in the UI; a future API should retain that separation.

**Every newly introduced user-facing UI string must be added to the localization system in Georgian, English, and Russian. Do not introduce new hardcoded interface text.** Add semantic keys to the appropriate message group, provide all three translations with matching interpolation fields, and use the existing display helpers. [README.md](README.md#localization) documents the full workflow. Native picker and browser chrome language remains browser/OS-controlled; server integration does not require replacing those controls.

The current interface retains DM Sans/DM Serif Display, with locally bundled Noto Sans/Serif Georgian and system Arial/Georgia Cyrillic fallbacks. Backend migration should preserve these assets and the existing visual design. Backend translation storage, account-level locale preferences, and localized outbound notifications are future work only when authorized.

## PostgreSQL / Supabase

Create tables for users, customers, barber_shops, barbers, services, barber_services (price and duration overrides), haircut_styles, barber_styles, portfolio_items, portfolio_styles, working_hours, availability_exceptions, appointments, reviews, and favorites. Use UUIDs and foreign keys. Distinguish a shop owner from an individual barber using a shop_memberships table with explicit roles.

Store appointments as timestamp ranges in UTC with the IANA shop timezone. Keep quoted price, currency, and duration snapshots on each appointment. Use a transaction and a PostgreSQL exclusion constraint on active appointment ranges per barber to prevent double booking. Confirmation must revalidate availability, service eligibility, working hours, and price on the server. Use idempotency keys for retries. Rescheduling should atomically release the original interval and claim the replacement.

## Authentication and permissions

Integrate Supabase Auth or another provider with server-verified sessions. Treat the current role selection as onboarding preference only. Enforce customer ownership and barber/shop membership with row-level security. Customers can read public profiles and manage their own appointments and favorites; barbers can edit only their own profiles and view appointments assigned to them. Appointment completion and cancellation transitions need server-side authorization. Never trust localStorage, UI guards, or client-supplied customer IDs.

## Reviews

Create reviews only for a completed appointment belonging to the signed-in customer. Enforce one review per appointment with a unique constraint. Resolve the reviewed barber from the appointment, not a submitted barber ID. Aggregate ratings from eligible reviews and support moderation and reporting. Current verification badges illustrate this relationship and are not actual identity verification.

## Images

Move portfolio and profile uploads to object storage (Supabase Storage or S3 compatible). Authorize signed upload URLs, validate MIME type, size, and file content, strip metadata, resize images, and record storage keys and ownership. Obtain image and model consent before replacing illustrative stock imagery with real portfolio work.

## Payments

Select a provider supporting the business and GEL settlement. Create payment intents on the server; never store card details. Verify webhooks and reconcile idempotently. Decide deposit, refund, cancellation, and marketplace payout policy before implementation. Current prices are fixture amounts and no payment is collected.

## Notifications

Use an outbox/job queue for confirmation, cancellation, and reminder messages after the booking transaction commits. Add consent, timezone-aware delivery, retries, deduplication, and template localization. No messages are sent by this prototype.

## Suggested delivery order

1. Finalize schema and authorization tests; import real consented shop/barber data.
2. Add authentication and read-only profile/search repositories.
3. Add transactional booking and barber availability management.
4. Add verified reviews, favorites, and secure image storage.
5. Integrate payments and notifications, then observability and production security review.
