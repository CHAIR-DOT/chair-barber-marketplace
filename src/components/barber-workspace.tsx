"use client";
import { publicPath } from "@/lib/public-path";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Eye,
  Pencil,
  Plus,
  Scissors,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { customers, SLOT_TIMES, styles } from "@/lib/data";
import { addDays, currentMinutes, minutes, today } from "@/lib/dates";
import { getPrice, ratingFor } from "@/lib/booking";
import type { Service } from "@/lib/types";
import { useMock } from "./provider";
import { useI18n } from "@/i18n/provider";
import {
  Badge,
  EmptyState,
  Modal,
  PageHeader,
  Rating,
  SkeletonCard,
} from "./ui";
import { DashboardShell } from "./dashboard-shell";
export function BarberWorkspace({
  section = "dashboard",
}: {
  section?: string;
}) {
  const { ready } = useMock();
  return ready ? (
    <BarberWorkspaceContent key={section} section={section} />
  ) : (
    <div className="container">
      <SkeletonCard />
    </div>
  );
}
function BarberWorkspaceContent({
  section = "dashboard",
}: {
  section?: string;
}) {
  const {
    t,
    date,
    relativeDate,
    money,
    number,
    serviceName: displayServiceName,
    serviceDescription,
    styleName,
    barberBio,
    portfolioTitle: displayPortfolioTitle,
    label,
  } = useI18n();
  const portfolioFileInput = useRef<HTMLInputElement>(null);
  const { state, update, updateBarber, notify } = useMock(),
    barber = state.barbers.find((b) => b.id === "barber-1")!,
    schedule = state.availability.find((a) => a.barberId === barber.id)!,
    appointments = state.appointments.filter((a) => a.barberId === barber.id),
    upcoming = appointments
      .filter((a) => a.status === "upcoming" && a.date >= today())
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    todays = appointments.filter(
      (a) => a.date === today() && a.status !== "cancelled",
    ),
    reviews = state.reviews.filter((r) => r.barberId === barber.id),
    rating = ratingFor(barber.id, state.reviews),
    portfolio = state.portfolio.filter((p) => p.barberId === barber.id),
    services = state.services.filter((s) => barber.serviceIds.includes(s.id)),
    [name, setName] = useState(barber.name),
    [bio, setBio] = useState(barber.bio),
    [experience, setExperience] = useState(barber.experience),
    [specialties, setSpecialties] = useState(barber.styleIds),
    [photo, setPhoto] = useState(barber.image),
    [serviceModal, setServiceModal] = useState(false),
    [editing, setEditing] = useState<Service | null>(null),
    [serviceName, setServiceName] = useState(""),
    [price, setPrice] = useState(35),
    [duration, setDuration] = useState(45),
    [description, setDescription] = useState(""),
    [portfolioModal, setPortfolioModal] = useState(false),
    [portfolioTitle, setPortfolioTitle] = useState(""),
    [portfolioStyle, setPortfolioStyle] = useState(barber.styleIds[0]),
    [portfolioImage, setPortfolioImage] = useState("/images/cut-1.jpg"),
    [portfolioFileName, setPortfolioFileName] = useState(""),
    [removeId, setRemoveId] = useState<string | null>(null),
    [workingDays, setWorkingDays] = useState(schedule.workingDays),
    [start, setStart] = useState(schedule.start),
    [end, setEnd] = useState(schedule.end),
    [blockedSlots, setBlockedSlots] = useState(schedule.blockedSlots),
    [blockedDates, setBlockedDates] = useState(schedule.blockedDates),
    [blockedDate, setBlockedDate] = useState(""),
    [error, setError] = useState("");
  const openService = (s: Service | null) => {
    setEditing(s);
    setServiceName(s?.name ?? "");
    setPrice(s ? getPrice(barber, s.id, state) : 35);
    setDuration(s?.duration ?? 45);
    setDescription(s?.description ?? "");
    setError("");
    setServiceModal(true);
  };
  const readPhoto = (file: File | undefined, done: (url: string) => void) => {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 600000
    ) {
      setError("workspace.error.imageType");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      done(String(reader.result));
      setError("");
    };
    reader.onerror = () => setError("workspace.error.imageRead");
    reader.readAsDataURL(file);
  };
  const appointmentTable = (list: typeof appointments) =>
    list.length ? (
      <div className="table-scroll">
        <table className="appointment-table">
          <thead>
            <tr>
              <th>{t("workspace.table.when")}</th>
              <th>{t("workspace.table.customer")}</th>
              <th>{t("workspace.table.service")}</th>
              <th>{t("workspace.table.price")}</th>
              <th>{t("workspace.table.status")}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id}>
                <td>
                  <strong>{relativeDate(a.date)}</strong>
                  <span>{a.time}</span>
                </td>
                <td>
                  {customers.find((c) => c.id === a.customerId)?.name ??
                    t("workspace.demoCustomer")}
                </td>
                <td>
                  {(() => {
                    const service = state.services.find(
                      (s) => s.id === a.serviceId,
                    );
                    return service ? displayServiceName(service) : "";
                  })()}
                  <span>
                    {t("workspace.minutesShort", { count: a.duration })}
                  </span>
                </td>
                <td>{money(a.price)}</td>
                <td>
                  <Badge tone={a.status === "completed" ? "" : "green"}>
                    {a.status === "upcoming"
                      ? t("workspace.confirmed")
                      : label(a.status)}
                  </Badge>
                  {a.status === "upcoming" &&
                    (a.date < today() ||
                      (a.date === today() &&
                        minutes(a.time) + a.duration < currentMinutes())) && (
                      <button
                        className="link-button"
                        onClick={() => {
                          update({
                            appointments: state.appointments.map((x) =>
                              x.id === a.id ? { ...x, status: "completed" } : x,
                            ),
                          });
                          notify("workspace.toast.completed");
                        }}
                      >
                        {t("workspace.markCompleted")}
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <EmptyState
        title={t("workspace.emptyAppointments.title")}
        text={t("workspace.emptyAppointments.text")}
        action={t("workspace.emptyAppointments.action")}
        href={`/booking?barber=${barber.id}`}
      />
    );
  const monthAppointments = appointments.filter(
    (a) =>
      a.date.slice(0, 7) === today().slice(0, 7) && a.status !== "cancelled",
  );
  return (
    <DashboardShell barber>
      <PageHeader
        eyebrow={t("workspace.eyebrow")}
        title={
          {
            dashboard: t("workspace.heading.dashboard", {
              name: barber.name.split(" ")[0],
            }),
            profile: t("workspace.heading.profile"),
            portfolio: t("workspace.heading.portfolio"),
            services: t("workspace.heading.services"),
            schedule: t("workspace.heading.schedule"),
          }[section] ?? t("workspace.heading.default")
        }
        description={
          {
            dashboard: t("workspace.intro.dashboard"),
            profile: t("workspace.intro.profile"),
            portfolio: t("workspace.intro.portfolio"),
            services: t("workspace.intro.services"),
            schedule: t("workspace.intro.schedule"),
          }[section]
        }
      >
        {section === "portfolio" ? (
          <button
            className="button button-dark"
            onClick={() => {
              setError("");
              setPortfolioTitle("");
              setPortfolioModal(true);
            }}
          >
            <Plus size={16} />
            {t("workspace.addLook")}
          </button>
        ) : section === "services" ? (
          <button
            className="button button-dark"
            onClick={() => openService(null)}
          >
            <Plus size={16} />
            {t("workspace.addService")}
          </button>
        ) : (
          <Link
            className="button button-outline"
            href={`/barbers/${barber.slug}`}
          >
            {t("workspace.viewProfile")}
            <ArrowUpRight size={15} />
          </Link>
        )}
      </PageHeader>
      {section === "dashboard" && (
        <>
          <div className="metric-grid barber-metrics">
            {[
              [
                Star,
                number(rating.value, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                }),
                t("workspace.metric.rating"),
                t("workspace.metric.reviews", { count: rating.count }),
              ],
              [
                CalendarDays,
                number(monthAppointments.length),
                t("workspace.metric.bookings"),
                t("workspace.metric.demoAppointments"),
              ],
              [
                Eye,
                number(1240),
                t("workspace.metric.views"),
                t("workspace.metric.illustrative"),
              ],
              [
                TrendingUp,
                money(
                  monthAppointments
                    .filter((a) => a.status === "completed")
                    .reduce((n, a) => n + a.price, 0),
                ),
                t("workspace.metric.revenue"),
                t("workspace.metric.noPayment"),
              ],
            ].map(([Icon, value, label, detail]) => {
              const I = Icon as typeof Star;
              return (
                <div className="metric" key={String(label)}>
                  <I size={17} />
                  <strong>{String(value)}</strong>
                  <span>{String(label)}</span>
                  <small>{String(detail)}</small>
                </div>
              );
            })}
          </div>
          <div className="dashboard-section-title">
            <h2>{t("workspace.today")}</h2>
            <span className="muted small-text">
              {date(today(), { weekday: "long" })}
            </span>
          </div>
          {appointmentTable(todays)}
          <div className="dashboard-section-title">
            <h2>{t("workspace.next")}</h2>
            <Link href="/barber/schedule" className="text-link">
              {t("workspace.manageSchedule")}
              <ArrowUpRight size={15} />
            </Link>
          </div>
          {appointmentTable(upcoming.slice(0, 6))}
          {appointments.some(
            (a) => a.status === "upcoming" && a.date < today(),
          ) && (
            <>
              <div className="dashboard-section-title">
                <h2>{t("workspace.wrapUp")}</h2>
                <span className="muted small-text">
                  {t("workspace.awaitingCompletion")}
                </span>
              </div>
              {appointmentTable(
                appointments.filter(
                  (a) => a.status === "upcoming" && a.date < today(),
                ),
              )}
            </>
          )}
          <div className="workspace-bottom-grid">
            <div className="workspace-mini-panel">
              <span className="eyebrow">{t("workspace.portfolioEyebrow")}</span>
              <h3>{t("workspace.portfolioTitle")}</h3>
              <div className="mini-portfolio">
                {portfolio.slice(0, 3).map((p) => (
                  <img
                    src={publicPath(p.image)}
                    alt={displayPortfolioTitle(p)}
                    key={p.id}
                  />
                ))}
              </div>
              <Link href="/barber/portfolio" className="text-link">
                {t("workspace.managePortfolio")}
                <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="workspace-mini-panel">
              <span className="eyebrow">{t("workspace.reviewsEyebrow")}</span>
              <Rating value={rating.value} count={rating.count} />
              <blockquote>
                “{reviews[0]?.text ?? t("workspace.firstReview")}”
              </blockquote>
              <Link
                href={`/barbers/${barber.slug}#reviews`}
                className="text-link"
              >
                {t("workspace.readReviews")}
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </>
      )}
      {section === "profile" && (
        <form
          className="profile-edit-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim().length < 2 || bio.trim().length < 20) {
              setError("workspace.error.profile");
              return;
            }
            if (!specialties.length) {
              setError("workspace.error.specialty");
              return;
            }
            updateBarber(barber.id, {
              name: name.trim(),
              bio: bio.trim(),
              experience,
              styleIds: specialties,
              image: photo,
            });
            setError("");
            notify("workspace.toast.profile");
          }}
        >
          <div className="profile-photo-edit">
            <img src={publicPath(photo)} alt={t("workspace.profilePreview")} />
            <div>
              <h3>{t("workspace.faceTitle")}</h3>
              <p>{t("workspace.photoHint")}</p>
              <label className="button button-outline upload-button">
                {t("workspace.changePhoto")}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => readPhoto(e.target.files?.[0], setPhoto)}
                />
              </label>
            </div>
          </div>
          <div className="photo-choice-row">
            {Array.from(
              { length: 8 },
              (_, i) => `/images/barber-${i + 1}.jpg`,
            ).map((url, i) => (
              <button
                type="button"
                key={url}
                aria-label={t("workspace.choosePortrait", {
                  count: i + 1,
                })}
                aria-pressed={photo === url}
                className={photo === url ? "selected" : ""}
                onClick={() => setPhoto(url)}
              >
                <img src={publicPath(url)} alt="" />
              </button>
            ))}
          </div>
          <div className="field-row">
            <label className="field">
              {t("workspace.fullName")}
              <input
                required
                minLength={2}
                maxLength={70}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="field">
              {t("workspace.experience")}
              <input
                type="number"
                required
                min={0}
                max={50}
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
              />
            </label>
          </div>
          <label className="field">
            {t("workspace.story")}
            <textarea
              required
              minLength={20}
              maxLength={1200}
              value={barberBio({ ...barber, bio })}
              onChange={(e) => setBio(e.target.value)}
            />
            <span className="hint">{t("workspace.storyHint")}</span>
          </label>
          <fieldset className="specialty-field">
            <legend>{t("workspace.specialties")}</legend>
            <div className="specialty-checkboxes">
              {styles.map((s) => (
                <label
                  className={`specialty-choice ${specialties.includes(s.id) ? "selected" : ""}`}
                  key={s.id}
                >
                  <input
                    type="checkbox"
                    checked={specialties.includes(s.id)}
                    onChange={() =>
                      setSpecialties(
                        specialties.includes(s.id)
                          ? specialties.filter((id) => id !== s.id)
                          : [...specialties, s.id],
                      )
                    }
                  />
                  {styleName(s)}
                </label>
              ))}
            </div>
          </fieldset>
          {error && (
            <p className="error-message" role="alert">
              {t(error)}
            </p>
          )}
          <button className="button button-dark" type="submit">
            {t("workspace.saveProfile")}
            <Check size={16} />
          </button>
        </form>
      )}
      {section === "portfolio" && (
        <>
          {portfolio.length ? (
            <div className="managed-portfolio">
              {portfolio.map((p) => (
                <article key={p.id}>
                  <img
                    src={publicPath(p.image)}
                    alt={displayPortfolioTitle(p)}
                  />
                  <div>
                    <div>
                      <h3>{displayPortfolioTitle(p)}</h3>
                      <span>
                        {p.styleIds
                          .map((id) => {
                            const style = styles.find((s) => s.id === id);
                            return style ? styleName(style) : "";
                          })
                          .join(", ")}
                      </span>
                    </div>
                    <button
                      className="icon-button"
                      aria-label={t("workspace.removeNamedLook", {
                        title: displayPortfolioTitle(p),
                      })}
                      onClick={() => setRemoveId(p.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("workspace.emptyPortfolio.title")}
              text={t("workspace.emptyPortfolio.text")}
              action={t("workspace.addLook")}
              onAction={() => setPortfolioModal(true)}
            />
          )}
          <p className="notice">{t("workspace.portfolioNotice")}</p>
        </>
      )}
      {section === "services" && (
        <>
          <div className="managed-services">
            {services.map((s) => (
              <div className="managed-service" key={s.id}>
                <div className="service-icon">
                  <Scissors size={21} />
                </div>
                <div>
                  <h3>{displayServiceName(s)}</h3>
                  <p>{serviceDescription(s)}</p>
                  <span>
                    <Clock3 size={12} />
                    {t("workspace.minutes", { count: s.duration })}
                  </span>
                </div>
                <strong>{money(getPrice(barber, s.id, state))}</strong>
                <button
                  className="button button-outline"
                  onClick={() => openService(s)}
                >
                  <Pencil size={13} />
                  {t("workspace.editPrice")}
                </button>
              </div>
            ))}
          </div>
          <p className="notice">{t("workspace.servicesNotice")}</p>
        </>
      )}
      {section === "schedule" && (
        <form
          className="schedule-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (minutes(start) >= minutes(end)) {
              setError("workspace.error.hours");
              return;
            }
            update({
              availability: state.availability.map((a) =>
                a.barberId === barber.id
                  ? {
                      ...a,
                      workingDays,
                      start,
                      end,
                      blockedDates,
                      blockedSlots,
                    }
                  : a,
              ),
            });
            setError("");
            notify("workspace.toast.schedule");
          }}
        >
          <div className="schedule-section">
            <h3>{t("workspace.week")}</h3>
            <p>{t("workspace.weekHint")}</p>
            <div className="working-days">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <label
                  key={d}
                  className={`day-toggle ${workingDays.includes(d) ? "selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={workingDays.includes(d)}
                    disabled={d === 0}
                    onChange={() =>
                      setWorkingDays(
                        workingDays.includes(d)
                          ? workingDays.filter((x) => x !== d)
                          : [...workingDays, d],
                      )
                    }
                  />
                  <span>{t(`workspace.weekday.${d}`)}</span>
                  <strong>
                    {workingDays.includes(d)
                      ? t("workspace.working")
                      : t("workspace.off")}
                  </strong>
                </label>
              ))}
            </div>
            <div className="field-row">
              <label className="field">
                {t("workspace.startTime")}
                <input
                  type="time"
                  value={start}
                  min="10:00"
                  max="19:00"
                  required
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
              <label className="field">
                {t("workspace.finishTime")}
                <input
                  type="time"
                  value={end}
                  min="11:00"
                  max="20:00"
                  required
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
            </div>
            <p className="small-text muted">{t("workspace.hoursHint")}</p>
          </div>
          <div className="schedule-section">
            <h3>{t("workspace.breakTitle")}</h3>
            <p>{t("workspace.breakHint")}</p>
            <div className="break-slots">
              {SLOT_TIMES.map((time) => (
                <label
                  key={time}
                  className={`break-slot ${blockedSlots.includes(time) ? "blocked" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={blockedSlots.includes(time)}
                    onChange={() =>
                      setBlockedSlots(
                        blockedSlots.includes(time)
                          ? blockedSlots.filter((x) => x !== time)
                          : [...blockedSlots, time],
                      )
                    }
                  />
                  {time}
                  <span>
                    {blockedSlots.includes(time)
                      ? t("workspace.blocked")
                      : t("workspace.open")}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="schedule-section">
            <h3>{t("workspace.timeAway")}</h3>
            <p>{t("workspace.timeAwayHint")}</p>
            <div className="block-date-row">
              <label className="field">
                {t("workspace.dateOff")}
                <input
                  type="date"
                  min={today()}
                  max={addDays(30)}
                  value={blockedDate}
                  onChange={(e) => setBlockedDate(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="button button-outline"
                disabled={!blockedDate}
                onClick={() => {
                  if (!blockedDates.includes(blockedDate))
                    setBlockedDates([...blockedDates, blockedDate]);
                  setBlockedDate("");
                }}
              >
                {t("workspace.addDayOff")}
              </button>
            </div>
            <div className="blocked-date-list">
              {blockedDates.map((d) => (
                <span className="badge" key={d}>
                  {date(d, { weekday: "short" })}
                  <button
                    type="button"
                    aria-label={t("workspace.removeDayOff", { date: date(d) })}
                    onClick={() =>
                      setBlockedDates(blockedDates.filter((x) => x !== d))
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          {error && (
            <p className="error-message" role="alert">
              {t(error)}
            </p>
          )}
          <p className="notice">{t("workspace.scheduleNotice")}</p>
          <button className="button button-dark" type="submit">
            {t("workspace.saveSchedule")}
            <Check size={16} />
          </button>
        </form>
      )}
      <Modal
        open={serviceModal}
        onClose={() => setServiceModal(false)}
        title={
          editing ? t("workspace.priceTitle") : t("workspace.addMenuTitle")
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              !editing &&
              (serviceName.trim().length < 2 || description.trim().length < 10)
            ) {
              setError("workspace.error.service");
              return;
            }
            if (
              !Number.isFinite(price) ||
              price < 5 ||
              price > 500 ||
              !Number.isFinite(duration) ||
              duration < 5 ||
              duration > 180
            ) {
              setError("workspace.error.price");
              return;
            }
            if (editing) {
              updateBarber(barber.id, {
                servicePrices: { ...barber.servicePrices, [editing.id]: price },
              });
            } else {
              const id = `service-${crypto.randomUUID()}`;
              update({
                services: [
                  ...state.services,
                  {
                    id,
                    name: serviceName.trim(),
                    price,
                    duration,
                    description: description.trim(),
                  },
                ],
                barbers: state.barbers.map((b) =>
                  b.id === barber.id
                    ? {
                        ...b,
                        serviceIds: [...b.serviceIds, id],
                        servicePrices: { ...b.servicePrices, [id]: price },
                      }
                    : b,
                ),
              });
            }
            setServiceModal(false);
            notify(
              editing ? "workspace.toast.price" : "workspace.toast.service",
            );
          }}
        >
          <label className="field">
            {t("workspace.serviceName")}
            <input
              required
              value={editing ? displayServiceName(editing) : serviceName}
              disabled={!!editing}
              onChange={(e) => setServiceName(e.target.value)}
            />
          </label>
          <div className="field-row">
            <label className="field">
              {t("workspace.priceGel")}
              <input
                required
                type="number"
                min={5}
                max={500}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </label>
            <label className="field">
              {t("workspace.duration")}
              <input
                required
                disabled={!!editing}
                type="number"
                min={5}
                max={180}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </label>
          </div>
          {!editing && (
            <label className="field">
              {t("workspace.description")}
              <textarea
                required
                minLength={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("workspace.descriptionPlaceholder")}
              />
            </label>
          )}
          {error && (
            <p className="error-message" role="alert">
              {t(error)}
            </p>
          )}
          <button className="button button-dark button-full">
            {editing ? t("workspace.savePrice") : t("workspace.addService")}
          </button>
        </form>
      </Modal>
      <Modal
        open={portfolioModal}
        onClose={() => setPortfolioModal(false)}
        title={t("workspace.addSignature")}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (portfolioTitle.trim().length < 3) {
              setError("workspace.error.lookTitle");
              return;
            }
            update({
              portfolio: [
                ...state.portfolio,
                {
                  id: `portfolio-${crypto.randomUUID()}`,
                  barberId: barber.id,
                  styleIds: [portfolioStyle],
                  image: portfolioImage,
                  title: portfolioTitle.trim(),
                  description: "A new look from your local demo portfolio.",
                },
              ],
            });
            setPortfolioModal(false);
            notify("workspace.toast.lookAdded");
          }}
        >
          <img
            className="portfolio-upload-preview"
            src={publicPath(portfolioImage)}
            alt={t("workspace.newPreview")}
          />
          <label className="field">
            {t("workspace.chooseSample")}
            <select
              value={
                portfolioImage.startsWith("/images/")
                  ? portfolioImage
                  : "upload"
              }
              onChange={(e) => setPortfolioImage(e.target.value)}
            >
              {portfolioImage.startsWith("data:") && (
                <option value="upload">{t("workspace.uploadedImage")}</option>
              )}
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={`/images/cut-${i + 1}.jpg`}>
                  {t("workspace.portfolioSample", { count: i + 1 })}
                </option>
              ))}
            </select>
          </label>
          <div className="field">
            <span>{t("workspace.uploadPhoto")}</span>
            <button
              type="button"
              className="button button-outline"
              aria-describedby="portfolio-upload-selection"
              onClick={() => portfolioFileInput.current?.click()}
            >
              {t("workspace.chooseFile")}
            </button>
            <input
              ref={portfolioFileInput}
              className="sr-only"
              type="file"
              tabIndex={-1}
              aria-label={t("workspace.uploadPhoto")}
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                readPhoto(file, (url) => {
                  setPortfolioImage(url);
                  setPortfolioFileName(file?.name ?? "");
                });
              }}
            />
            <span
              className="hint"
              id="portfolio-upload-selection"
              role="status"
              style={{ overflowWrap: "anywhere" }}
            >
              {portfolioFileName && portfolioImage.startsWith("data:")
                ? t("workspace.selectedFile", { name: portfolioFileName })
                : t("workspace.noFileSelected")}
            </span>
            <span className="hint">{t("workspace.uploadHint")}</span>
          </div>
          <label className="field">
            {t("workspace.lookTitle")}
            <input
              required
              minLength={3}
              maxLength={80}
              value={portfolioTitle}
              onChange={(e) => setPortfolioTitle(e.target.value)}
              placeholder={t("workspace.lookPlaceholder")}
            />
          </label>
          <label className="field">
            {t("workspace.haircutStyle")}
            <select
              value={portfolioStyle}
              onChange={(e) => setPortfolioStyle(e.target.value)}
            >
              {styles.map((s) => (
                <option key={s.id} value={s.id}>
                  {styleName(s)}
                </option>
              ))}
            </select>
          </label>
          {error && (
            <p className="error-message" role="alert">
              {t(error)}
            </p>
          )}
          <button className="button button-dark button-full">
            {t("workspace.addPortfolio")}
          </button>
        </form>
      </Modal>
      <Modal
        open={!!removeId}
        onClose={() => setRemoveId(null)}
        title={t("workspace.removeTitle")}
      >
        <p className="small-text muted">{t("workspace.removeHint")}</p>
        <div className="modal-actions">
          <button
            className="button button-outline"
            onClick={() => setRemoveId(null)}
          >
            {t("workspace.keepLook")}
          </button>
          <button
            className="button button-dark"
            onClick={() => {
              update({
                portfolio: state.portfolio.filter((p) => p.id !== removeId),
              });
              setRemoveId(null);
              notify("workspace.toast.lookRemoved");
            }}
          >
            {t("workspace.removeLook")}
          </button>
        </div>
      </Modal>
    </DashboardShell>
  );
}
