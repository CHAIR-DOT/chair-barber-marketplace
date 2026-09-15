# Backend integration plan

CHAIR. currently runs with local fixture data and browser state. No database, API routes, authentication provider, payments, email, SMS, or analytics are connected.

## Boundaries

- `src/lib/types.ts` defines the domain entities. IDs link shops, barbers, services, customers, appointments, reviews, and portfolio items.
- `src/lib/data.ts` contains fixtures; `src/lib/booking.ts` owns pure booking rules.
- `src/components/provider.tsx` is the local state/action boundary. Replace these actions with an async repository without changing page composition.
- User-visible language can move into locale dictionaries. Preserve stable IDs; localize labels and route-independent service/style descriptions. Format GEL and dates through shared helpers. Booking dates use `Asia/Tbilisi`.

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
