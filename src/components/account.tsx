"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Heart,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { customer, shops, styles } from "@/lib/data";
import { formatDate, money, relativeDate, today } from "@/lib/dates";
import { canReview } from "@/lib/booking";
import type { Appointment } from "@/lib/types";
import { useMock } from "./provider";
import { Badge, EmptyState, Modal, PageHeader, SkeletonCard } from "./ui";
import { BarberCard, ShopCard, StyleCard } from "./cards";
import { ReviewCard, ReviewDialog } from "./reviews";
import { DashboardShell } from "./dashboard-shell";
function AppointmentCard({
  appointment,
  onView,
  onCancel,
  onReview,
}: {
  appointment: Appointment;
  onView: (id: string) => void;
  onCancel: (id: string) => void;
  onReview: (id: string) => void;
}) {
  const { state } = useMock(),
    b = state.barbers.find((b) => b.id === appointment.barberId)!,
    s = shops.find((s) => s.id === appointment.shopId)!,
    service = state.services.find((s) => s.id === appointment.serviceId),
    upcoming = appointment.status === "upcoming" && appointment.date >= today();
  return (
    <article className="appointment-card">
      <div className="appointment-date">
        <strong>
          {formatDate(appointment.date, { day: "numeric", month: undefined })}
        </strong>
        <span>
          {formatDate(appointment.date, { month: "short", day: undefined })}
        </span>
      </div>
      <img src={b.image} alt={b.name} />
      <div className="appointment-info">
        <Badge
          tone={
            upcoming
              ? "green"
              : appointment.status === "cancelled"
                ? ""
                : "copper"
          }
        >
          {upcoming
            ? "Upcoming"
            : appointment.status === "upcoming"
              ? "Visit date passed"
              : appointment.status}
        </Badge>
        <h3>{service?.name}</h3>
        <Link href={`/barbers/${b.slug}`}>
          {b.name} · {s.name}
        </Link>
        <span>
          <Clock3 size={12} />
          {appointment.time} · {appointment.duration} min{" "}
          <strong>{money(appointment.price)}</strong>
        </span>
      </div>
      <div className="appointment-actions">
        <button
          className="button button-outline"
          onClick={() => onView(appointment.id)}
        >
          View appointment
        </button>
        {upcoming ? (
          <>
            <Link
              className="text-link"
              href={`/booking?reschedule=${appointment.id}`}
            >
              Reschedule
            </Link>
            <button
              className="link-button"
              onClick={() => onCancel(appointment.id)}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <Link
              className="text-link"
              href={`/booking?barber=${b.id}&shop=${s.id}&service=${appointment.serviceId}`}
            >
              Book again <ArrowUpRight size={13} />
            </Link>
            {canReview(state, appointment.id, customer.id) && (
              <button
                className="link-button"
                onClick={() => onReview(appointment.id)}
              >
                Leave a review
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
export function AccountPage({ section = "overview" }: { section?: string }) {
  const { ready } = useMock();
  return ready ? (
    <AccountContent key={section} section={section} />
  ) : (
    <div className="container">
      <SkeletonCard />
    </div>
  );
}
function AccountContent({ section = "overview" }: { section?: string }) {
  const { state, cancel, update, notify } = useMock(),
    [tab, setTab] = useState("upcoming"),
    [favoriteTab, setFavoriteTab] = useState("barber"),
    [viewId, setView] = useState<string | null>(null),
    [cancelId, setCancel] = useState<string | null>(null),
    [reviewId, setReview] = useState<string | null>(null),
    appointments = state.appointments.filter(
      (a) => a.customerId === customer.id,
    ),
    upcoming = appointments
      .filter((a) => a.status === "upcoming" && a.date >= today())
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    past = appointments
      .filter(
        (a) =>
          a.status === "completed" ||
          (a.status === "upcoming" && a.date < today()),
      )
      .sort((a, b) => b.date.localeCompare(a.date)),
    cancelled = appointments.filter((a) => a.status === "cancelled"),
    reviews = state.reviews.filter((r) => r.customerId === customer.id),
    view = state.appointments.find((a) => a.id === viewId),
    [name, setName] = useState(
      state.user?.role === "customer" ? state.user.name : customer.name,
    ),
    [email, setEmail] = useState(
      state.user?.role === "customer" ? state.user.email : customer.email,
    ),
    [phone, setPhone] = useState(state.user?.phone ?? customer.phone ?? "");
  const cards = (list: Appointment[]) =>
    list.map((a) => (
      <AppointmentCard
        appointment={a}
        key={a.id}
        onView={setView}
        onCancel={setCancel}
        onReview={setReview}
      />
    ));
  return (
    <DashboardShell>
      <PageHeader
        eyebrow={
          section === "overview"
            ? "MAKE YOURSELF AT HOME"
            : "YOUR PERSONAL CORNER"
        }
        title={
          {
            overview: `Good to see you, ${(state.user?.role === "customer" ? state.user.name : customer.name).split(" ")[0]}`,
            appointments: "Your appointments",
            favorites: "The ones worth saving",
            reviews: "Your words matter",
            settings: "Make it personal",
          }[section] ?? "Your account"
        }
        description={
          {
            overview: "Your next cut, your favorite people, all in one place.",
            appointments: "A little time set aside for yourself.",
            favorites: "Great barbers, good spaces, and looks you love.",
            reviews: "Good feedback helps the next person find their barber.",
            settings: "Keep your demo profile up to date.",
          }[section]
        }
      />
      {section === "overview" && (
        <>
          <div className="metric-grid customer-metrics">
            {[
              [CalendarDays, upcoming.length, "Upcoming appointments"],
              [Heart, state.favorites.length, "Saved favorites"],
              [MessageSquare, reviews.length, "Your reviews"],
            ].map(([Icon, value, label]) => {
              const I = Icon as typeof CalendarDays;
              return (
                <div className="metric" key={String(label)}>
                  <I size={18} />
                  <strong>{String(value)}</strong>
                  <span>{String(label)}</span>
                </div>
              );
            })}
          </div>
          <div className="dashboard-section-title">
            <h2>Your next good hair day.</h2>
            <Link href="/account/appointments" className="text-link">
              All appointments <ArrowUpRight size={15} />
            </Link>
          </div>
          {upcoming.length ? (
            cards(upcoming.slice(0, 1))
          ) : (
            <EmptyState
              title="Your next chapter is a fresh cut"
              text="No upcoming appointments. Find a barber who gets your style."
              action="Find a barber"
              href="/discover"
            />
          )}
          <div className="dashboard-section-title">
            <h2>A familiar chair.</h2>
            <span className="muted small-text">Book again</span>
          </div>
          {cards(past.slice(0, 2))}
          <div className="notice">
            This is Alex’s sample customer account. Bookings and reviews are
            stored only in this browser.
          </div>
        </>
      )}
      {section === "appointments" && (
        <>
          <div className="tabs" role="tablist" aria-label="Appointment status">
            {[
              ["upcoming", upcoming.length],
              ["past", past.length],
              ["cancelled", cancelled.length],
            ].map(([label, count]) => (
              <button
                key={label}
                role="tab"
                aria-selected={tab === label}
                className={tab === label ? "active" : ""}
                onClick={() => setTab(String(label))}
              >
                {String(label)} <span className="count">{count}</span>
              </button>
            ))}
          </div>
          {(tab === "upcoming" ? upcoming : tab === "past" ? past : cancelled)
            .length ? (
            cards(
              tab === "upcoming" ? upcoming : tab === "past" ? past : cancelled,
            )
          ) : (
            <EmptyState
              title={
                tab === "upcoming"
                  ? "Your calendar has room for a good cut"
                  : `No ${tab} appointments`
              }
              text="Your appointments will appear here when you make a booking."
              action="Explore barbers"
              href="/discover"
            />
          )}
        </>
      )}
      {section === "favorites" && (
        <>
          <div className="tabs" role="tablist" aria-label="Favorite type">
            {[
              ["barber", "Barbers"],
              ["shop", "Barber shops"],
              ["style", "Haircut styles"],
            ].map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={favoriteTab === id}
                className={favoriteTab === id ? "active" : ""}
                onClick={() => setFavoriteTab(id)}
              >
                {label}
                <span className="count">
                  {state.favorites.filter((f) => f.type === id).length}
                </span>
              </button>
            ))}
          </div>
          {state.favorites.some((f) => f.type === favoriteTab) ? (
            <div
              className={
                favoriteTab === "barber"
                  ? "account-favorite-barbers"
                  : favoriteTab === "shop"
                    ? "discovery-shop-grid"
                    : "account-favorite-styles"
              }
            >
              {favoriteTab === "barber"
                ? state.barbers
                    .filter((b) =>
                      state.favorites.some(
                        (f) => f.type === "barber" && f.entityId === b.id,
                      ),
                    )
                    .map((b) => <BarberCard barber={b} key={b.id} />)
                : favoriteTab === "shop"
                  ? shops
                      .filter((s) =>
                        state.favorites.some(
                          (f) => f.type === "shop" && f.entityId === s.id,
                        ),
                      )
                      .map((s) => <ShopCard shop={s} key={s.id} />)
                  : styles
                      .filter((s) =>
                        state.favorites.some(
                          (f) => f.type === "style" && f.entityId === s.id,
                        ),
                      )
                      .map((s) => <StyleCard style={s} key={s.id} />)}
            </div>
          ) : (
            <EmptyState
              title="Keep the good ones close"
              text="Tap a heart on a barber, shop, or style to save it here for your next visit."
              action={
                favoriteTab === "style"
                  ? "Explore haircut styles"
                  : "Find your favorites"
              }
              href={favoriteTab === "style" ? "/styles" : "/discover"}
            />
          )}
        </>
      )}
      {section === "reviews" && (
        <>
          {appointments.filter((a) => canReview(state, a.id, customer.id))
            .length > 0 && (
            <div className="review-prompt">
              <MessageSquare size={26} />
              <div>
                <h3>How was your last visit?</h3>
                <p>Share your experience after a completed haircut.</p>
              </div>
              <button
                className="button button-dark"
                onClick={() =>
                  setReview(
                    appointments.find((a) =>
                      canReview(state, a.id, customer.id),
                    )!.id,
                  )
                }
              >
                Write a review
              </button>
            </div>
          )}
          {reviews.length ? (
            reviews.map((r) => <ReviewCard review={r} key={r.id} />)
          ) : (
            <EmptyState
              title="The first word is yours"
              text="After a completed appointment, your review can help someone find their next barber."
            />
          )}
          <p className="notice">
            “Verified appointment” means the review is linked to a completed
            sample booking. It does not represent real verification.
          </p>
        </>
      )}
      {section === "settings" && (
        <form
          className="settings-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim().length < 2) {
              notify("Please enter a name with at least two characters.");
              return;
            }
            update({
              user: {
                ...customer,
                name: name.trim(),
                email,
                phone,
                role: "customer",
              },
            });
            notify("Your demo profile has been updated.");
          }}
        >
          <div className="settings-person">
            <span className="initial-avatar">
              {name
                .split(" ")
                .map((x) => x[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div>
              <h3>Your personal details</h3>
              <p>Only saved on this device.</p>
            </div>
          </div>
          <label className="field">
            Full name
            <input
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="field">
            Email address
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field">
            Phone number
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <span className="hint">No calls or messages are sent.</span>
          </label>
          <button className="button button-dark">
            Save changes <Check size={15} />
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => {
              update({ user: null });
              notify("Signed out of the demo.");
            }}
          >
            Sign out of demo
          </button>
        </form>
      )}
      <Modal
        open={!!view}
        onClose={() => setView(null)}
        title="Your appointment"
      >
        {view && (
          <>
            <Badge tone={view.status === "upcoming" ? "green" : ""}>
              {view.status}
            </Badge>
            <dl className="booking-summary appointment-detail">
              {[
                [
                  "Barber",
                  state.barbers.find((b) => b.id === view.barberId)?.name,
                ],
                ["Shop", shops.find((s) => s.id === view.shopId)?.name],
                [
                  "Service",
                  state.services.find((s) => s.id === view.serviceId)?.name,
                ],
                [
                  "Date",
                  formatDate(view.date, { weekday: "long", year: "numeric" }),
                ],
                ["Time", `${view.time} · Tbilisi time`],
                ["Duration", `${view.duration} minutes`],
                ["Price", money(view.price)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="notice">
              Demo appointment · No real booking or payment. Reference{" "}
              {view.id.slice(-8).toUpperCase()}.
            </p>
          </>
        )}
      </Modal>
      <Modal
        open={!!cancelId}
        onClose={() => setCancel(null)}
        title="A change of plans?"
      >
        <p className="small-text muted">
          Cancel this demo appointment? You can always come back and find
          another time.
        </p>
        <div className="modal-actions">
          <button
            className="button button-outline"
            onClick={() => setCancel(null)}
          >
            Keep appointment
          </button>
          <button
            className="button button-dark"
            onClick={() => {
              if (cancelId) cancel(cancelId);
              setCancel(null);
            }}
          >
            Cancel appointment
          </button>
        </div>
      </Modal>
      {reviewId && (
        <ReviewDialog
          key={reviewId}
          appointmentId={reviewId}
          onClose={() => setReview(null)}
        />
      )}
    </DashboardShell>
  );
}
