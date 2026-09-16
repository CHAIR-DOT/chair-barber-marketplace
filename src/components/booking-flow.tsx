"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  MapPin,
  Scissors,
  Users,
} from "lucide-react";
import { shops, SLOT_TIMES } from "@/lib/data";
import { addDays, today } from "@/lib/dates";
import { useI18n } from "@/i18n/provider";
import {
  getPrice,
  nextAvailable,
  ratingFor,
  slotAvailable,
} from "@/lib/booking";
import { useMock } from "./provider";
import { BackLink, Badge, EmptyState, Rating, SkeletonCard } from "./ui";
import { StyleSelectionBrief } from "./style-selection-brief";
export interface BookingParams {
  shop?: string;
  barber?: string;
  service?: string;
  reschedule?: string;
}
const STEPS = ["shop", "barber", "service", "date", "time", "details"];
export function BookingPage({ initial }: { initial: BookingParams }) {
  const { ready } = useMock();
  return ready ? (
    <BookingFlow initial={initial} />
  ) : (
    <div className="container">
      <SkeletonCard />
    </div>
  );
}
function BookingFlow({ initial }: { initial: BookingParams }) {
  const {
    t: tr,
    date: formatDate,
    relativeDate,
    money,
    number,
    label,
    serviceName,
    serviceDescription,
    barberTitle,
    errorText,
  } = useI18n();
  const { state, book } = useMock(),
    existing = state.appointments.find(
      (a) => a.id === initial.reschedule && a.status === "upcoming",
    ),
    initialBarber = state.barbers.find(
      (b) => b.id === (existing?.barberId ?? initial.barber),
    ),
    initialShop = shops.find(
      (s) =>
        s.id === (existing?.shopId ?? initialBarber?.shopId ?? initial.shop),
    ),
    initialService = state.services.find(
      (s) =>
        s.id === (existing?.serviceId ?? initial.service) &&
        (!initialBarber || initialBarber.serviceIds.includes(s.id)),
    ),
    [shopId, setShop] = useState(initialShop?.id ?? ""),
    [barberId, setBarber] = useState(initialBarber?.id ?? ""),
    [serviceId, setService] = useState(initialService?.id ?? ""),
    [date, setDate] = useState(""),
    [time, setTime] = useState(""),
    [step, setStep] = useState(
      initialShop ? (initialBarber ? (initialService ? 3 : 2) : 1) : 0,
    ),
    [error, setError] = useState(""),
    [confirmed, setConfirmed] = useState(""),
    busy = useRef(false);
  const shop = shops.find((s) => s.id === shopId),
    team = state.barbers.filter((b) => b.shopId === shopId),
    eligible = team.filter(
      (b) =>
        (barberId === "any" || b.id === barberId) &&
        b.serviceIds.includes(serviceId),
    ),
    confirmedAppointment = state.appointments.find((a) => a.id === confirmed),
    resolved =
      (confirmedAppointment
        ? state.barbers.find((b) => b.id === confirmedAppointment.barberId)
        : undefined) ??
      eligible.find(
        (b) =>
          date &&
          time &&
          slotAvailable(state, b.id, serviceId, date, time, existing?.id),
      ) ??
      (barberId !== "any" ? team.find((b) => b.id === barberId) : undefined),
    service = state.services.find((s) => s.id === serviceId),
    availableServices = state.services.filter((s) =>
      (barberId === "any" ? team : team.filter((b) => b.id === barberId)).some(
        (b) => b.serviceIds.includes(s.id),
      ),
    ),
    price =
      confirmedAppointment?.price ??
      (service
        ? Math.min(
            ...(resolved ? [resolved] : eligible).map((b) =>
              getPrice(b, service.id, state),
            ),
          )
        : 0);
  const valid = [
    !!shopId,
    !!barberId,
    !!serviceId,
    !!date,
    !!time && !!resolved,
    true,
  ][step];
  function advance() {
    setError("");
    if (step === 5) {
      if (busy.current) return;
      busy.current = true;
      try {
        const id = book(
          { shopId, barberId: resolved?.id ?? "", serviceId, date, time },
          existing?.id,
        );
        setConfirmed(id);
      } catch (e) {
        setError((e as Error).message);
        setTime("");
        setStep(4);
        busy.current = false;
      }
    } else if (valid) {
      setStep(step + 1);
    }
  }
  const summary = (
    <>
      <div className="summary-shop">
        {shop && <img src={shop.image} alt={shop.name} />}
        <div>
          <span className="eyebrow">{tr("booking.summary.eyebrow")}</span>
          <h3>{shop?.name ?? tr("booking.summary.waiting")}</h3>
          {shop && (
            <p>
              {label(shop.neighborhood)}, {label("Tbilisi")}
            </p>
          )}
        </div>
      </div>
      <dl className="booking-summary">
        <div>
          <dt>{tr("booking.summary.barber")}</dt>
          <dd>
            {resolved?.name ??
              (barberId === "any"
                ? tr("booking.anyBarber")
                : tr("booking.summary.chooseBarber"))}
          </dd>
        </div>
        <div>
          <dt>{tr("booking.summary.service")}</dt>
          <dd>
            {service
              ? serviceName(service)
              : tr("booking.summary.chooseService")}
          </dd>
        </div>
        <div>
          <dt>{tr("booking.summary.date")}</dt>
          <dd>
            {date
              ? formatDate(date, { weekday: "long" })
              : tr("booking.summary.chooseDate")}
          </dd>
        </div>
        <div>
          <dt>{tr("booking.summary.time")}</dt>
          <dd>{time || tr("booking.summary.chooseTime")}</dd>
        </div>
        <div>
          <dt>{tr("booking.summary.duration")}</dt>
          <dd>
            {service ? tr("booking.minutes", { count: service.duration }) : "—"}
          </dd>
        </div>
      </dl>
      <div className="summary-total">
        <span>
          {tr("booking.summary.total")}{" "}
          <small>{tr("booking.summary.payment")}</small>
        </span>
        <strong>{Number.isFinite(price) && price ? money(price) : "—"}</strong>
      </div>
    </>
  );
  if (confirmed) {
    const appointment = state.appointments.find((a) => a.id === confirmed)!;
    return (
      <div className="container confirmation-page">
        <div className="success-mark">
          <Check size={34} />
        </div>
        <div className="eyebrow">{tr("booking.confirmation.eyebrow")}</div>
        <h1>
          {tr("booking.confirmation.title")}
          <span className="accent">.</span>
        </h1>
        <p>
          {tr("booking.confirmation.schedule", {
            date: relativeDate(appointment.date),
            time: appointment.time,
          })}
          <br />
          {tr("booking.confirmation.notice")}
        </p>
        <div className="confirmation-card">
          <Badge tone="green">
            <CheckCircle2 size={13} />
            {tr(
              existing
                ? "booking.confirmation.rescheduled"
                : "booking.confirmation.confirmed",
            )}
          </Badge>
          {summary}
          <div className="confirmation-ref">
            {tr("booking.confirmation.reference", {
              reference: confirmed.slice(-8).toUpperCase(),
            })}
          </div>
        </div>
        <div className="inline-actions">
          <Link href="/account/appointments" className="button button-dark">
            {tr("booking.confirmation.appointments")}
            <ArrowUpRight size={16} />
          </Link>
          <Link
            href={`/barbers/${resolved?.slug}`}
            className="button button-outline"
          >
            {tr("booking.confirmation.back")}
          </Link>
        </div>
        <p className="gallery-disclaimer">{tr("booking.confirmation.saved")}</p>
      </div>
    );
  }
  return (
    <div className="container booking-page">
      <BackLink href="/discover">{tr("booking.backDiscovery")}</BackLink>
      <div className="booking-heading">
        <div className="eyebrow">
          {existing
            ? tr("booking.heading.rescheduleEyebrow")
            : tr("booking.heading.eyebrow")}
        </div>
        <h1>
          {existing
            ? tr("booking.heading.reschedule")
            : tr("booking.heading.title")}
          <span className="accent">.</span>
        </h1>
        <p>{tr("booking.heading.description")}</p>
      </div>
      <StyleSelectionBrief />
      <div className="booking-progress" aria-label={tr("booking.progress")}>
        {STEPS.map((title, i) => (
          <button
            key={title}
            disabled={i > step}
            aria-label={tr(`booking.steps.${title}`)}
            aria-current={i === step ? "step" : undefined}
            className={i === step ? "active" : i < step ? "done" : ""}
            onClick={() => {
              setStep(i);
              setError("");
            }}
          >
            <span>{i < step ? <Check size={13} /> : number(i + 1)}</span>
            <strong>{tr(`booking.steps.${title}`)}</strong>
          </button>
        ))}
      </div>
      <div className="booking-layout">
        <section className="booking-step">
          <div className="booking-step-title">
            <span className="eyebrow">
              {tr("booking.step", { step: number(step + 1) })}
            </span>
            <h2>{tr(`booking.titles.${STEPS[step]}`)}</h2>
          </div>
          {error && (
            <p className="error-message" role="alert">
              {errorText(error)}
            </p>
          )}
          {step === 0 && (
            <div className="booking-shop-options">
              {shops.map((s) => (
                <button
                  key={s.id}
                  className={`selection-option shop-option ${shopId === s.id ? "selected" : ""}`}
                  aria-pressed={shopId === s.id}
                  onClick={() => {
                    setShop(s.id);
                    if (s.id !== shopId) {
                      setBarber("");
                      setService("");
                      setDate("");
                      setTime("");
                    }
                  }}
                >
                  <img src={s.image} alt="" />
                  <div>
                    <strong>{s.name}</strong>
                    <span>
                      {label(s.neighborhood)} · {s.address}
                    </span>
                  </div>
                  <span className="radio-indicator">
                    {shopId === s.id && <Check size={12} />}
                  </span>
                </button>
              ))}
            </div>
          )}
          {step === 1 && (
            <div className="selection-list">
              <button
                className={`selection-option ${barberId === "any" ? "selected" : ""}`}
                aria-pressed={barberId === "any"}
                onClick={() => {
                  setBarber("any");
                  setDate("");
                  setTime("");
                }}
              >
                <div className="option-icon">
                  <Users size={24} />
                </div>
                <div>
                  <strong>{tr("booking.anyBarber")}</strong>
                  <span>{tr("booking.anyBarberDescription")}</span>
                </div>
                <span className="radio-indicator">
                  {barberId === "any" && <Check size={12} />}
                </span>
              </button>
              {team.map((b) => {
                const r = ratingFor(b.id, state.reviews);
                return (
                  <button
                    key={b.id}
                    className={`selection-option ${barberId === b.id ? "selected" : ""}`}
                    aria-pressed={barberId === b.id}
                    onClick={() => {
                      setBarber(b.id);
                      if (b.id !== barberId) {
                        if (!b.serviceIds.includes(serviceId)) setService("");
                        setDate("");
                        setTime("");
                      }
                    }}
                  >
                    <img className="round-portrait" src={b.image} alt="" />
                    <div>
                      <strong>{b.name}</strong>
                      <span>
                        {barberTitle(b)} ·{" "}
                        {tr("booking.experience", {
                          count: b.experience,
                        })}
                      </span>
                      <Rating value={r.value} count={r.count} />
                    </div>
                    <span className="radio-indicator">
                      {barberId === b.id && <Check size={12} />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {step === 2 && (
            <div className="selection-list">
              {availableServices.map((s) => (
                <button
                  key={s.id}
                  className={`selection-option ${serviceId === s.id ? "selected" : ""}`}
                  aria-pressed={serviceId === s.id}
                  onClick={() => {
                    setService(s.id);
                    setTime("");
                  }}
                >
                  <div className="option-icon">
                    <Scissors size={23} />
                  </div>
                  <div>
                    <strong>{serviceName(s)}</strong>
                    <span>{serviceDescription(s)}</span>
                    <span>{tr("booking.minutes", { count: s.duration })}</span>
                  </div>
                  <div className="option-price">
                    {barberId === "any" && <small>{tr("booking.from")}</small>}
                    {money(
                      Math.min(
                        ...team
                          .filter(
                            (b) =>
                              (barberId === "any" || b.id === barberId) &&
                              b.serviceIds.includes(s.id),
                          )
                          .map((b) => getPrice(b, s.id, state)),
                      ),
                    )}
                  </div>
                  <span className="radio-indicator">
                    {serviceId === s.id && <Check size={12} />}
                  </span>
                </button>
              ))}
            </div>
          )}
          {step === 3 && (
            <>
              <p className="small-text muted">{tr("booking.date.notice")}</p>
              <div className="date-grid">
                {Array.from({ length: 14 }, (_, i) => addDays(i)).map((d) => {
                  const hasSlots = eligible.some((b) =>
                    SLOT_TIMES.some((t) =>
                      slotAvailable(state, b.id, serviceId, d, t, existing?.id),
                    ),
                  );
                  return (
                    <button
                      key={d}
                      className={`date-option ${date === d ? "selected" : ""}`}
                      disabled={!hasSlots}
                      aria-label={
                        hasSlots
                          ? formatDate(d, { weekday: "long" })
                          : tr("booking.unavailableLabel", {
                              value: formatDate(d, { weekday: "long" }),
                            })
                      }
                      aria-pressed={date === d}
                      onClick={() => {
                        setDate(d);
                        setTime("");
                      }}
                    >
                      <span>
                        {formatDate(d, {
                          weekday: "short",
                          day: undefined,
                          month: undefined,
                        })}
                      </span>
                      <strong>
                        {number(new Date(`${d}T12:00:00Z`).getUTCDate())}
                      </strong>
                      <span>
                        {d === today()
                          ? tr("booking.today")
                          : formatDate(d, { month: "short", day: undefined })}
                      </span>
                    </button>
                  );
                })}
              </div>
              <label className="field">
                {tr("booking.anotherDate")}
                <input
                  type="date"
                  min={today()}
                  max={addDays(30)}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime("");
                  }}
                />
              </label>
            </>
          )}
          {step === 4 && (
            <>
              <div className="chosen-date">
                <CalendarDays size={20} />
                <div>
                  <strong>
                    {date
                      ? formatDate(date, { weekday: "long", year: "numeric" })
                      : tr("booking.chooseDate")}
                  </strong>
                  <span>
                    {tr("booking.time.duration", {
                      count: service?.duration ?? 0,
                    })}
                  </span>
                </div>
                <button className="link-button" onClick={() => setStep(3)}>
                  {tr("booking.change")}
                </button>
              </div>
              <div className="time-grid">
                {SLOT_TIMES.map((t) => {
                  const available = eligible.some((b) =>
                    slotAvailable(
                      state,
                      b.id,
                      serviceId,
                      date,
                      t,
                      existing?.id,
                    ),
                  );
                  return (
                    <button
                      key={t}
                      disabled={!available}
                      aria-pressed={time === t}
                      aria-label={
                        available
                          ? t
                          : tr("booking.unavailableLabel", { value: t })
                      }
                      className={`time-option ${time === t ? "selected" : ""}`}
                      onClick={() => {
                        setTime(t);
                        setError("");
                      }}
                    >
                      {t}
                      <span>
                        {available
                          ? tr("booking.available")
                          : tr("booking.unavailable")}
                      </span>
                    </button>
                  );
                })}
              </div>
              {!eligible.some((b) =>
                SLOT_TIMES.some((t) =>
                  slotAvailable(state, b.id, serviceId, date, t, existing?.id),
                ),
              ) && (
                <EmptyState
                  title={tr("booking.time.emptyTitle")}
                  text={tr("booking.time.emptyText")}
                  action={tr("booking.time.anotherDay")}
                  onAction={() => setStep(3)}
                />
              )}
              <p className="notice">{tr("booking.time.notice")}</p>
            </>
          )}
          {step === 5 && (
            <>
              <div className="review-appointment">
                <img src={resolved?.image} alt={resolved?.name} />
                <div>
                  <Badge tone="green">{tr("booking.steps.barber")}</Badge>
                  <h3>{resolved?.name}</h3>
                  <span>{shop?.name}</span>
                </div>
              </div>
              {barberId === "any" && (
                <p className="notice">
                  {tr("booking.review.matched", {
                    name: resolved?.name.split(" ")[0] ?? "",
                  })}
                </p>
              )}
              <div className="review-booking-details">{summary}</div>
              <label className="check-label">
                <CheckCircle2 size={17} />
                <span>{tr("booking.review.payment")}</span>
              </label>
              <p className="notice">{tr("booking.review.notice")}</p>
            </>
          )}
          <div className="booking-step-actions">
            {step > 0 ? (
              <button
                className="button button-outline"
                onClick={() => {
                  setStep(step - 1);
                  setError("");
                }}
              >
                <ArrowLeft size={15} />
                {tr("booking.back")}
              </button>
            ) : (
              <span />
            )}
            <button
              disabled={!valid}
              className="button button-dark"
              onClick={advance}
            >
              {step === 5
                ? existing
                  ? tr("booking.confirmNewTime")
                  : tr("booking.confirmDemo")
                : tr("booking.continue")}
              {step === 5 ? <Check size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        </section>
        <aside className="booking-sidebar">
          <div className="booking-summary-card">
            {summary}
            <div className="summary-trust">
              <CheckCircle2 size={15} />
              <span>{tr("booking.trust")}</span>
            </div>
          </div>
          <p className="gallery-disclaimer">{tr("booking.localNotice")}</p>
        </aside>
      </div>
    </div>
  );
}
