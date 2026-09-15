"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Eye,
  ImagePlus,
  Pencil,
  Plus,
  Scissors,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { customer, customers, shops, SLOT_TIMES, styles } from "@/lib/data";
import {
  addDays,
  currentMinutes,
  formatDate,
  minutes,
  money,
  relativeDate,
  today,
} from "@/lib/dates";
import { getPrice, ratingFor } from "@/lib/booking";
import type { Service } from "@/lib/types";
import { useMock } from "./provider";
import {
  Badge,
  EmptyState,
  Modal,
  PageHeader,
  Rating,
  SkeletonCard,
} from "./ui";
import { DashboardShell } from "./dashboard-shell";
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
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
      setError(
        "Choose a JPG, PNG, or WebP image smaller than 600 KB for this local demo.",
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      done(String(reader.result));
      setError("");
    };
    reader.onerror = () =>
      setError("This image could not be read. Please choose another.");
    reader.readAsDataURL(file);
  };
  const appointmentTable = (list: typeof appointments) =>
    list.length ? (
      <div className="table-scroll">
        <table className="appointment-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Price</th>
              <th>Status</th>
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
                    "Demo customer"}
                </td>
                <td>
                  {state.services.find((s) => s.id === a.serviceId)?.name}
                  <span>{a.duration} min</span>
                </td>
                <td>{money(a.price)}</td>
                <td>
                  <Badge tone={a.status === "completed" ? "" : "green"}>
                    {a.status === "upcoming" ? "Confirmed" : a.status}
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
                          notify("Demo appointment marked completed.");
                        }}
                      >
                        Mark completed
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
        title="A little breathing room"
        text="No appointments here yet. New demo bookings with you will appear automatically."
        action="Preview your booking flow"
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
        eyebrow="YOUR CRAFT. YOUR BUSINESS."
        title={
          {
            dashboard: `A good day to create, ${barber.name.split(" ")[0]}`,
            profile: "Make a good first impression",
            portfolio: "Let your work speak",
            services: "The grooming menu",
            schedule: "Your time, considered",
          }[section] ?? "Your workspace"
        }
        description={
          {
            dashboard:
              "A clear view of your chair, your clients, and what’s next.",
            profile: "Give people a reason to choose your chair.",
            portfolio:
              "The details, the texture, the finish. Show your signature work.",
            services: "Clear choices and transparent prices for every client.",
            schedule:
              "Make room for good work. Set the hours that work for you.",
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
            Add a look
          </button>
        ) : section === "services" ? (
          <button
            className="button button-dark"
            onClick={() => openService(null)}
          >
            <Plus size={16} />
            Add service
          </button>
        ) : (
          <Link
            className="button button-outline"
            href={`/barbers/${barber.slug}`}
          >
            View profile <ArrowUpRight size={15} />
          </Link>
        )}
      </PageHeader>
      {section === "dashboard" && (
        <>
          <div className="metric-grid barber-metrics">
            {[
              [
                Star,
                rating.value.toFixed(1),
                "Average rating",
                `${rating.count} sample reviews`,
              ],
              [
                CalendarDays,
                monthAppointments.length,
                "Bookings this month",
                "From demo appointments",
              ],
              [Eye, "1,240", "Profile views", "Illustrative metric"],
              [
                TrendingUp,
                money(
                  monthAppointments
                    .filter((a) => a.status === "completed")
                    .reduce((n, a) => n + a.price, 0),
                ),
                "Completed revenue",
                "Demo amounts · no payment",
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
            <h2>Today in your chair.</h2>
            <span className="muted small-text">
              {formatDate(today(), { weekday: "long" })}
            </span>
          </div>
          {appointmentTable(todays)}
          <div className="dashboard-section-title">
            <h2>Next through the door.</h2>
            <Link href="/barber/schedule" className="text-link">
              Manage schedule <ArrowUpRight size={15} />
            </Link>
          </div>
          {appointmentTable(upcoming.slice(0, 6))}
          {appointments.some(
            (a) => a.status === "upcoming" && a.date < today(),
          ) && (
            <>
              <div className="dashboard-section-title">
                <h2>Ready to wrap up.</h2>
                <span className="muted small-text">
                  Past visits awaiting completion
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
              <span className="eyebrow">YOUR DIGITAL FIRST IMPRESSION</span>
              <h3>Make your next look count.</h3>
              <div className="mini-portfolio">
                {portfolio.slice(0, 3).map((p) => (
                  <img src={p.image} alt={p.title} key={p.id} />
                ))}
              </div>
              <Link href="/barber/portfolio" className="text-link">
                Manage your portfolio <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="workspace-mini-panel">
              <span className="eyebrow">YOUR CLIENTS, IN THEIR WORDS</span>
              <Rating value={rating.value} count={rating.count} />
              <blockquote>
                “{reviews[0]?.text ?? "Your first review is waiting to happen."}
                ”
              </blockquote>
              <Link
                href={`/barbers/${barber.slug}#reviews`}
                className="text-link"
              >
                Read your reviews <ArrowUpRight size={15} />
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
              setError(
                "Add your name and a biography of at least 20 characters.",
              );
              return;
            }
            if (!specialties.length) {
              setError("Choose at least one specialty.");
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
            notify("Your public demo profile has been updated.");
          }}
        >
          <div className="profile-photo-edit">
            <img src={photo} alt="Profile preview" />
            <div>
              <h3>A face to remember.</h3>
              <p>Choose a demo portrait or upload a small photo.</p>
              <label className="button button-outline upload-button">
                Change photo
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
                aria-label={`Choose sample portrait ${i + 1}`}
                aria-pressed={photo === url}
                className={photo === url ? "selected" : ""}
                onClick={() => setPhoto(url)}
              >
                <img src={url} alt="" />
              </button>
            ))}
          </div>
          <div className="field-row">
            <label className="field">
              Full name
              <input
                required
                minLength={2}
                maxLength={70}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="field">
              Years of experience
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
            Your story
            <textarea
              required
              minLength={20}
              maxLength={1200}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <span className="hint">
              What do you love about your craft? What makes your approach
              personal?
            </span>
          </label>
          <fieldset className="specialty-field">
            <legend>Your specialties</legend>
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
                  {s.name}
                </label>
              ))}
            </div>
          </fieldset>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <button className="button button-dark" type="submit">
            Save profile <Check size={16} />
          </button>
        </form>
      )}
      {section === "portfolio" && (
        <>
          {portfolio.length ? (
            <div className="managed-portfolio">
              {portfolio.map((p) => (
                <article key={p.id}>
                  <img src={p.image} alt={p.title} />
                  <div>
                    <div>
                      <h3>{p.title}</h3>
                      <span>
                        {p.styleIds
                          .map((id) => styles.find((s) => s.id === id)?.name)
                          .join(", ")}
                      </span>
                    </div>
                    <button
                      className="icon-button"
                      aria-label={`Remove ${p.title}`}
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
              title="Your first look starts here"
              text="Add a photo of your work and help the right client find you."
              action="Add a look"
              onAction={() => setPortfolioModal(true)}
            />
          )}
          <p className="notice">
            Sample photographs illustrate a portfolio. Uploaded images stay on
            this device; no file is sent to a server.
          </p>
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
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                  <span>
                    <Clock3 size={12} />
                    {s.duration} minutes
                  </span>
                </div>
                <strong>{money(getPrice(barber, s.id, state))}</strong>
                <button
                  className="button button-outline"
                  onClick={() => openService(s)}
                >
                  <Pencil size={13} />
                  Edit price
                </button>
              </div>
            ))}
          </div>
          <p className="notice">
            Service changes update your public profile and new demo bookings.
            Existing appointments keep their original price.
          </p>
        </>
      )}
      {section === "schedule" && (
        <form
          className="schedule-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (minutes(start) >= minutes(end)) {
              setError("Closing time must be after opening time.");
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
            notify(
              "Your schedule is updated. Booking availability now reflects these hours.",
            );
          }}
        >
          <div className="schedule-section">
            <h3>Your working week</h3>
            <p>
              Choose the days you’re in the chair. Your shop is closed on
              Sundays.
            </p>
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
                  <span>{DAYS[d].slice(0, 3)}</span>
                  <strong>{workingDays.includes(d) ? "Working" : "Off"}</strong>
                </label>
              ))}
            </div>
            <div className="field-row">
              <label className="field">
                Start time
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
                Finish time
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
            <p className="small-text muted">
              Appointments must finish within your hours and the shop’s
              10:00–20:00 opening hours.
            </p>
          </div>
          <div className="schedule-section">
            <h3>Make space for a break</h3>
            <p>Block starting times from your daily availability.</p>
            <div className="break-slots">
              {SLOT_TIMES.map((t) => (
                <label
                  key={t}
                  className={`break-slot ${blockedSlots.includes(t) ? "blocked" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={blockedSlots.includes(t)}
                    onChange={() =>
                      setBlockedSlots(
                        blockedSlots.includes(t)
                          ? blockedSlots.filter((x) => x !== t)
                          : [...blockedSlots, t],
                      )
                    }
                  />
                  {t}
                  <span>{blockedSlots.includes(t) ? "Blocked" : "Open"}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="schedule-section">
            <h3>Time away</h3>
            <p>Block a whole day for rest, travel, or something good.</p>
            <div className="block-date-row">
              <label className="field">
                Date off
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
                Add day off
              </button>
            </div>
            <div className="blocked-date-list">
              {blockedDates.map((d) => (
                <span className="badge" key={d}>
                  {formatDate(d, { weekday: "short" })}
                  <button
                    type="button"
                    aria-label={`Remove day off ${d}`}
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
              {error}
            </p>
          )}
          <p className="notice">
            Existing confirmed appointments stay on your calendar. Schedule
            changes only affect new bookings.
          </p>
          <button className="button button-dark" type="submit">
            Save schedule <Check size={16} />
          </button>
        </form>
      )}
      <Modal
        open={serviceModal}
        onClose={() => setServiceModal(false)}
        title={editing ? "A considered price" : "Add to your menu"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              !editing &&
              (serviceName.trim().length < 2 || description.trim().length < 10)
            ) {
              setError(
                "Add a service name and a description of at least 10 characters.",
              );
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
              setError(
                "Use a price of ₾5–₾500 and a duration of 5–180 minutes.",
              );
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
              editing
                ? "Your price has been updated."
                : "New service added to your profile.",
            );
          }}
        >
          <label className="field">
            Service name
            <input
              required
              value={serviceName}
              disabled={!!editing}
              onChange={(e) => setServiceName(e.target.value)}
            />
          </label>
          <div className="field-row">
            <label className="field">
              Price (GEL)
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
              Duration (minutes)
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
              Description
              <textarea
                required
                minLength={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell clients what’s included."
              />
            </label>
          )}
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <button className="button button-dark button-full">
            {editing ? "Save price" : "Add service"}
          </button>
        </form>
      </Modal>
      <Modal
        open={portfolioModal}
        onClose={() => setPortfolioModal(false)}
        title="Add a signature look"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (portfolioTitle.trim().length < 3) {
              setError("Add a title of at least 3 characters.");
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
            notify("Your new look is live on your demo profile.");
          }}
        >
          <img
            className="portfolio-upload-preview"
            src={portfolioImage}
            alt="New portfolio preview"
          />
          <label className="field">
            Choose a sample photo
            <select
              value={
                portfolioImage.startsWith("/images/")
                  ? portfolioImage
                  : "upload"
              }
              onChange={(e) => setPortfolioImage(e.target.value)}
            >
              {portfolioImage.startsWith("data:") && (
                <option value="upload">Your uploaded image</option>
              )}
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={`/images/cut-${i + 1}.jpg`}>
                  Portfolio sample {i + 1}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Or upload your photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) =>
                readPhoto(e.target.files?.[0], setPortfolioImage)
              }
            />
            <span className="hint">
              JPG, PNG, or WebP · up to 600 KB · local only
            </span>
          </label>
          <label className="field">
            Look title
            <input
              required
              minLength={3}
              maxLength={80}
              value={portfolioTitle}
              onChange={(e) => setPortfolioTitle(e.target.value)}
              placeholder="Skin fade with a textured top"
            />
          </label>
          <label className="field">
            Haircut style
            <select
              value={portfolioStyle}
              onChange={(e) => setPortfolioStyle(e.target.value)}
            >
              {styles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <button className="button button-dark button-full">
            Add to portfolio
          </button>
        </form>
      </Modal>
      <Modal
        open={!!removeId}
        onClose={() => setRemoveId(null)}
        title="Remove this look?"
      >
        <p className="small-text muted">
          This will remove the image from your local demo portfolio.
        </p>
        <div className="modal-actions">
          <button
            className="button button-outline"
            onClick={() => setRemoveId(null)}
          >
            Keep look
          </button>
          <button
            className="button button-dark"
            onClick={() => {
              update({
                portfolio: state.portfolio.filter((p) => p.id !== removeId),
              });
              setRemoveId(null);
              notify("Look removed from your portfolio.");
            }}
          >
            Remove look
          </button>
        </div>
      </Modal>
    </DashboardShell>
  );
}
