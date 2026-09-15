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
import { today } from "@/lib/dates";
import { useI18n } from "@/i18n/provider";
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
  const { t: tr, date: formatDate, money, label, serviceName } = useI18n();
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
            ? tr("account.upcoming")
            : appointment.status === "upcoming"
              ? tr("account.visitPassed")
              : label(appointment.status)}
        </Badge>
        <h3>{service ? serviceName(service) : ""}</h3>
        <Link href={`/barbers/${b.slug}`}>
          {b.name} · {s.name}
        </Link>
        <span>
          <Clock3 size={12} />
          {appointment.time} ·{" "}
          {tr("account.minutesShort", { count: appointment.duration })}{" "}
          <strong>{money(appointment.price)}</strong>
        </span>
      </div>
      <div className="appointment-actions">
        <button
          className="button button-outline"
          onClick={() => onView(appointment.id)}
        >
          {tr("account.viewAppointment")}
        </button>
        {upcoming ? (
          <>
            <Link
              className="text-link"
              href={`/booking?reschedule=${appointment.id}`}
            >
              {tr("account.reschedule")}
            </Link>
            <button
              className="link-button"
              onClick={() => onCancel(appointment.id)}
            >
              {tr("account.cancel")}
            </button>
          </>
        ) : (
          <>
            <Link
              className="text-link"
              href={`/booking?barber=${b.id}&shop=${s.id}&service=${appointment.serviceId}`}
            >
              {tr("account.bookAgain")}
              <ArrowUpRight size={13} />
            </Link>
            {canReview(state, appointment.id, customer.id) && (
              <button
                className="link-button"
                onClick={() => onReview(appointment.id)}
              >
                {tr("account.leaveReview")}
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
  const {
    t: tr,
    date: formatDate,
    money,
    number,
    label: labelText,
    serviceName,
  } = useI18n();
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
            ? tr("account.homeEyebrow")
            : tr("account.personalEyebrow")
        }
        title={
          {
            overview: tr("account.title.overview", {
              name: (state.user?.role === "customer"
                ? state.user.name
                : customer.name
              ).split(" ")[0],
            }),
            appointments: tr("account.title.appointments"),
            favorites: tr("account.title.favorites"),
            reviews: tr("account.title.reviews"),
            settings: tr("account.title.settings"),
          }[section] ?? tr("account.title.default")
        }
        description={
          {
            overview: tr("account.description.overview"),
            appointments: tr("account.description.appointments"),
            favorites: tr("account.description.favorites"),
            reviews: tr("account.description.reviews"),
            settings: tr("account.description.settings"),
          }[section]
        }
      />
      {section === "overview" && (
        <>
          <div className="metric-grid customer-metrics">
            {[
              [
                CalendarDays,
                upcoming.length,
                tr("account.metrics.appointments"),
              ],
              [Heart, state.favorites.length, tr("account.metrics.favorites")],
              [MessageSquare, reviews.length, tr("account.metrics.reviews")],
            ].map(([Icon, value, label]) => {
              const I = Icon as typeof CalendarDays;
              return (
                <div className="metric" key={String(label)}>
                  <I size={18} />
                  <strong>{number(Number(value))}</strong>
                  <span>{String(label)}</span>
                </div>
              );
            })}
          </div>
          <div className="dashboard-section-title">
            <h2>{tr("account.nextTitle")}</h2>
            <Link href="/account/appointments" className="text-link">
              {tr("account.allAppointments")}
              <ArrowUpRight size={15} />
            </Link>
          </div>
          {upcoming.length ? (
            cards(upcoming.slice(0, 1))
          ) : (
            <EmptyState
              title={tr("account.empty.nextTitle")}
              text={tr("account.empty.nextText")}
              action={tr("account.findBarber")}
              href="/discover"
            />
          )}
          <div className="dashboard-section-title">
            <h2>{tr("account.familiarChair")}</h2>
            <span className="muted small-text">{tr("account.bookAgain")}</span>
          </div>
          {cards(past.slice(0, 2))}
          <div className="notice">{tr("account.sampleNotice")}</div>
        </>
      )}
      {section === "appointments" && (
        <>
          <div
            className="tabs"
            role="tablist"
            aria-label={tr("account.appointmentStatus")}
          >
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
                {tr(`account.tab.${label}`)}{" "}
                <span className="count">{number(Number(count))}</span>
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
                  ? tr("account.empty.upcoming")
                  : tr(`account.empty.${tab}`)
              }
              text={tr("account.empty.appointmentsText")}
              action={tr("account.exploreBarbers")}
              href="/discover"
            />
          )}
        </>
      )}
      {section === "favorites" && (
        <>
          <div
            className="tabs"
            role="tablist"
            aria-label={tr("account.favoriteType")}
          >
            {[
              ["barber", tr("account.favorite.barber")],
              ["shop", tr("account.favorite.shop")],
              ["style", tr("account.favorite.style")],
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
                  {number(state.favorites.filter((f) => f.type === id).length)}
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
              title={tr("account.empty.favoritesTitle")}
              text={tr("account.empty.favoritesText")}
              action={
                favoriteTab === "style"
                  ? tr("account.exploreStyles")
                  : tr("account.findFavorites")
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
                <h3>{tr("account.reviewPromptTitle")}</h3>
                <p>{tr("account.reviewPromptText")}</p>
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
                {tr("account.writeReview")}
              </button>
            </div>
          )}
          {reviews.length ? (
            reviews.map((r) => <ReviewCard review={r} key={r.id} />)
          ) : (
            <EmptyState
              title={tr("account.empty.reviewsTitle")}
              text={tr("account.empty.reviewsText")}
            />
          )}
          <p className="notice">{tr("account.reviewNotice")}</p>
        </>
      )}
      {section === "settings" && (
        <form
          className="settings-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim().length < 2) {
              notify("account.validation.name");
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
            notify("account.profileUpdated");
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
              <h3>{tr("account.personalDetails")}</h3>
              <p>{tr("account.savedOnDevice")}</p>
            </div>
          </div>
          <label className="field">
            {tr("account.fullName")}
            <input
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="field">
            {tr("account.email")}
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field">
            {tr("account.phone")}
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <span className="hint">{tr("account.phoneHint")}</span>
          </label>
          <button className="button button-dark">
            {tr("account.saveChanges")}
            <Check size={15} />
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => {
              update({ user: null });
              notify("account.signedOut");
            }}
          >
            {tr("account.signOut")}
          </button>
        </form>
      )}
      <Modal
        open={!!view}
        onClose={() => setView(null)}
        title={tr("account.appointmentTitle")}
      >
        {view && (
          <>
            <Badge tone={view.status === "upcoming" ? "green" : ""}>
              {labelText(view.status)}
            </Badge>
            <dl className="booking-summary appointment-detail">
              {[
                [
                  tr("account.detail.barber"),
                  state.barbers.find((b) => b.id === view.barberId)?.name,
                ],
                [
                  tr("account.detail.shop"),
                  shops.find((s) => s.id === view.shopId)?.name,
                ],
                [
                  tr("account.detail.service"),
                  (() => {
                    const service = state.services.find(
                      (s) => s.id === view.serviceId,
                    );
                    return service ? serviceName(service) : "";
                  })(),
                ],
                [
                  tr("account.detail.date"),
                  formatDate(view.date, { weekday: "long", year: "numeric" }),
                ],
                [
                  tr("account.detail.time"),
                  tr("account.detail.localTime", { time: view.time }),
                ],
                [
                  tr("account.detail.duration"),
                  tr("account.detail.minutes", {
                    count: view.duration,
                  }),
                ],
                [tr("account.detail.price"), money(view.price)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="notice">
              {tr("account.detail.notice", {
                reference: view.id.slice(-8).toUpperCase(),
              })}
            </p>
          </>
        )}
      </Modal>
      <Modal
        open={!!cancelId}
        onClose={() => setCancel(null)}
        title={tr("account.cancelTitle")}
      >
        <p className="small-text muted">{tr("account.cancelText")}</p>
        <div className="modal-actions">
          <button
            className="button button-outline"
            onClick={() => setCancel(null)}
          >
            {tr("account.keepAppointment")}
          </button>
          <button
            className="button button-dark"
            onClick={() => {
              if (cancelId) cancel(cancelId);
              setCancel(null);
            }}
          >
            {tr("account.cancelAppointment")}
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
