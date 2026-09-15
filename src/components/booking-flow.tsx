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
import { addDays, formatDate, money, relativeDate, today } from "@/lib/dates";
import {
  getPrice,
  nextAvailable,
  ratingFor,
  slotAvailable,
} from "@/lib/booking";
import { useMock } from "./provider";
import { BackLink, Badge, EmptyState, Rating, SkeletonCard } from "./ui";
export interface BookingParams {
  shop?: string;
  barber?: string;
  service?: string;
  reschedule?: string;
}
const STEPS = [
  "The shop",
  "Your barber",
  "The service",
  "The date",
  "The time",
  "Final details",
];
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
          <span className="eyebrow">YOUR NEXT GOOD HAIR DAY</span>
          <h3>{shop?.name ?? "Your chair is waiting"}</h3>
          {shop && <p>{shop.neighborhood}, Tbilisi</p>}
        </div>
      </div>
      <dl className="booking-summary">
        <div>
          <dt>Barber</dt>
          <dd>
            {resolved?.name ??
              (barberId === "any"
                ? "Any available barber"
                : "Choose your person")}
          </dd>
        </div>
        <div>
          <dt>Service</dt>
          <dd>{service?.name ?? "Choose your service"}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>
            {date ? formatDate(date, { weekday: "long" }) : "Make it a date"}
          </dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{time || "Find your time"}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{service ? `${service.duration} minutes` : "—"}</dd>
        </div>
      </dl>
      <div className="summary-total">
        <span>
          Total <small>GEL · Pay at the shop concept</small>
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
        <div className="eyebrow">A GOOD HAIR DAY IS ON THE WAY</div>
        <h1>
          Your chair is waiting<span className="accent">.</span>
        </h1>
        <p>
          You’re all set for {relativeDate(appointment.date).toLowerCase()} at{" "}
          {appointment.time}.<br />
          This is a simulated appointment. No real booking or payment was made.
        </p>
        <div className="confirmation-card">
          <Badge tone="green">
            <CheckCircle2 size={13} />
            Demo {existing ? "rescheduled" : "confirmed"}
          </Badge>
          {summary}
          <div className="confirmation-ref">
            REFERENCE · {confirmed.slice(-8).toUpperCase()}
          </div>
        </div>
        <div className="inline-actions">
          <Link href="/account/appointments" className="button button-dark">
            View my appointments <ArrowUpRight size={16} />
          </Link>
          <Link
            href={`/barbers/${resolved?.slug}`}
            className="button button-outline"
          >
            Back to your barber
          </Link>
        </div>
        <p className="gallery-disclaimer">
          Saved in this browser. No confirmation email or SMS is sent.
        </p>
      </div>
    );
  }
  const stepTitles = [
    "Find your place.",
    "Choose your person.",
    "A little off the top?",
    "Make it a date.",
    "Find your moment.",
    "Looking good. Let’s confirm.",
  ];
  return (
    <div className="container booking-page">
      <BackLink href="/discover">Back to discovery</BackLink>
      <div className="booking-heading">
        <div className="eyebrow">
          {existing ? "A CHANGE OF PLANS" : "MAKE TIME FOR A GOOD CUT"}
        </div>
        <h1>
          {existing ? "Reschedule your chair" : "Book your next good hair day"}
          <span className="accent">.</span>
        </h1>
        <p>Simple choices. Clear prices. A chair with your name on it.</p>
      </div>
      <div className="booking-progress" aria-label="Booking progress">
        {STEPS.map((title, i) => (
          <button
            key={title}
            disabled={i > step}
            aria-current={i === step ? "step" : undefined}
            className={i === step ? "active" : i < step ? "done" : ""}
            onClick={() => {
              setStep(i);
              setError("");
            }}
          >
            <span>{i < step ? <Check size={13} /> : i + 1}</span>
            <strong>{title}</strong>
          </button>
        ))}
      </div>
      <div className="booking-layout">
        <section className="booking-step">
          <div className="booking-step-title">
            <span className="eyebrow">STEP {step + 1} OF 6</span>
            <h2>{stepTitles[step]}</h2>
          </div>
          {error && (
            <p className="error-message" role="alert">
              {error}
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
                      {s.neighborhood} · {s.address}
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
                  <strong>Any available barber</strong>
                  <span>A great cut, with the first person available.</span>
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
                        {b.role} · {b.experience} years experience
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
                    <strong>{s.name}</strong>
                    <span>{s.description}</span>
                    <span>{s.duration} minutes</span>
                  </div>
                  <div className="option-price">
                    {barberId === "any" && <small>from</small>}
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
              <p className="small-text muted">
                All times are local to Tbilisi (GMT+4). Pick a day in the next
                30 days.
              </p>
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
                      aria-label={`${formatDate(d, { weekday: "long" })}${!hasSlots ? ", unavailable" : ""}`}
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
                      <strong>{new Date(`${d}T12:00:00Z`).getUTCDate()}</strong>
                      <span>
                        {d === today()
                          ? "Today"
                          : formatDate(d, { month: "short", day: undefined })}
                      </span>
                    </button>
                  );
                })}
              </div>
              <label className="field">
                Choose another date
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
                      : "Choose a date"}
                  </strong>
                  <span>
                    {service?.duration} minute appointment · Tbilisi time
                  </span>
                </div>
                <button className="link-button" onClick={() => setStep(3)}>
                  Change
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
                      aria-label={`${t}${available ? "" : ", unavailable"}`}
                      className={`time-option ${time === t ? "selected" : ""}`}
                      onClick={() => {
                        setTime(t);
                        setError("");
                      }}
                    >
                      {t}
                      <span>{available ? "Available" : "Unavailable"}</span>
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
                  title="No chairs free on this day"
                  text="Try another date, or choose any available barber for more options."
                  action="Choose another day"
                  onAction={() => setStep(3)}
                />
              )}
              <p className="notice">
                Your time is reserved only after confirmation. Availability is
                simulated in this browser.
              </p>
            </>
          )}
          {step === 5 && (
            <>
              <div className="review-appointment">
                <img src={resolved?.image} alt={resolved?.name} />
                <div>
                  <Badge tone="green">Your barber</Badge>
                  <h3>{resolved?.name}</h3>
                  <span>{shop?.name}</span>
                </div>
              </div>
              {barberId === "any" && (
                <p className="notice">
                  We matched you with {resolved?.name.split(" ")[0]}, who is
                  available for your selected service and time.
                </p>
              )}
              <div className="review-booking-details">{summary}</div>
              <label className="check-label">
                <CheckCircle2 size={17} />
                <span>
                  Clear pricing. No deposit or payment in this preview.
                </span>
              </label>
              <p className="notice">
                This demo booking is for the sample customer Alex Chikovani. You
                can cancel or reschedule it from My appointments. No real
                appointment, charge, email, or SMS is created.
              </p>
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
                Back
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
                  ? "Confirm new time"
                  : "Confirm demo booking"
                : "Continue"}
              {step === 5 ? <Check size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        </section>
        <aside className="booking-sidebar">
          <div className="booking-summary-card">
            {summary}
            <div className="summary-trust">
              <CheckCircle2 size={15} />
              <span>Transparent prices. Your choice of barber.</span>
            </div>
          </div>
          <p className="gallery-disclaimer">
            A local prototype. Your selections stay in this browser.
          </p>
        </aside>
      </div>
    </div>
  );
}
