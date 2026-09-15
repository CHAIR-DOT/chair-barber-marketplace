"use client";
import { useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { customers } from "@/lib/data";
import { useI18n } from "@/i18n/provider";
import type { Review } from "@/lib/types";
import { useMock } from "./provider";
import { Badge, EmptyState, Modal, Rating } from "./ui";
const dimensionLabels = {
  quality: "reviews.dimension.quality",
  detail: "reviews.dimension.detail",
  communication: "reviews.dimension.communication",
  punctuality: "reviews.dimension.punctuality",
};
export function ReviewCard({ review }: { review: Review }) {
  const { t, date, serviceName } = useI18n();
  const { state } = useMock(),
    customer = customers.find((c) => c.id === review.customerId),
    barber = state.barbers.find((b) => b.id === review.barberId),
    appointment = state.appointments.find((a) => a.id === review.appointmentId),
    service = state.services.find((s) => s.id === appointment?.serviceId),
    verified =
      appointment?.status === "completed" &&
      appointment.customerId === review.customerId &&
      appointment.barberId === review.barberId;
  return (
    <article className="review-card">
      <div className="review-heading">
        <span className="initial-avatar">
          {(customer?.name ?? t("reviews.guest"))
            .split(" ")
            .map((x) => x[0])
            .join("")}
        </span>
        <div>
          <strong>{customer?.name ?? t("reviews.demoCustomer")}</strong>
          <span>{date(review.date, { year: "numeric" })}</span>
        </div>
        <Rating value={review.rating} />
      </div>
      <p>{review.text}</p>
      <div className="review-footer">
        <span>
          {service ? serviceName(service) : ""} · {barber?.name.split(" ")[0]}
        </span>
        {verified && (
          <Badge tone="green">
            <BadgeCheck size={12} />
            {t("reviews.verified")}
          </Badge>
        )}
      </div>
    </article>
  );
}
export function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const { t, number } = useI18n();
  const ratingNumber = (n: number) =>
    number(n, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const value = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  return (
    <div className="rating-breakdown">
      <div className="rating-overall">
        <strong>{value ? ratingNumber(value) : "—"}</strong>
        <div>
          <div
            className="review-stars"
            aria-label={t("reviews.outOfFive", { value: ratingNumber(value) })}
          >
            ★★★★★
          </div>
          <span>
            {t(reviews.length === 1 ? "reviews.count.one" : "reviews.count", {
              count: reviews.length,
            })}
          </span>
        </div>
      </div>
      <div className="rating-distribution">
        {[5, 4, 3, 2, 1].map((n) => (
          <div key={n}>
            <span>{number(n)}</span>
            <Star size={11} />
            <div className="progress-track">
              <i
                style={{
                  width: `${reviews.length ? (reviews.filter((r) => r.rating === n).length / reviews.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span>{number(reviews.filter((r) => r.rating === n).length)}</span>
          </div>
        ))}
      </div>
      <div className="rating-dimensions">
        {Object.entries(dimensionLabels).map(([key, label]) => {
          const list = reviews.flatMap((r) => {
            const n =
              r.dimensions?.[key as keyof NonNullable<Review["dimensions"]>];
            return n ? [n] : [];
          });
          return (
            <div key={key}>
              <span>{t(label)}</span>
              <strong>
                {list.length
                  ? ratingNumber(list.reduce((a, b) => a + b, 0) / list.length)
                  : "—"}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const { t } = useI18n();
  const [all, setAll] = useState(false);
  return (
    <section className="profile-section" id="reviews">
      <div className="section-heading">
        <div>
          <div className="eyebrow">{t("reviews.eyebrow")}</div>
          <h2>{t("reviews.heading")}</h2>
        </div>
        <Badge>
          {t(reviews.length === 1 ? "reviews.count.one" : "reviews.count", {
            count: reviews.length,
          })}
        </Badge>
      </div>
      {reviews.length ? (
        <>
          <RatingBreakdown reviews={reviews} />
          <div className="review-list">
            {(all ? reviews : reviews.slice(0, 3)).map((r) => (
              <ReviewCard review={r} key={r.id} />
            ))}
          </div>
          {reviews.length > 3 && (
            <button
              className="button button-outline"
              onClick={() => setAll(!all)}
            >
              {all
                ? t("reviews.showLess")
                : t("reviews.readAll", { count: reviews.length })}
            </button>
          )}
        </>
      ) : (
        <EmptyState
          title={t("reviews.emptyTitle")}
          text={t("reviews.emptyText")}
        />
      )}
    </section>
  );
}
export function ReviewDialog({
  appointmentId,
  onClose,
}: {
  appointmentId: string | null;
  onClose: () => void;
}) {
  const { t, number, errorText } = useI18n();
  const { state, review } = useMock(),
    [rating, setRating] = useState(0),
    [text, setText] = useState(""),
    [dimensions, setDimensions] = useState<NonNullable<Review["dimensions"]>>(
      {},
    ),
    [error, setError] = useState("");
  const appointment = state.appointments.find((a) => a.id === appointmentId),
    barber = state.barbers.find((b) => b.id === appointment?.barberId);
  return (
    <Modal
      open={!!appointment}
      onClose={onClose}
      title={t("reviews.dialogTitle", {
        name: barber?.name.split(" ")[0] ?? t("reviews.yourBarber"),
      })}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            review(appointmentId!, rating, text, dimensions);
            onClose();
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <p className="small-text muted">{t("reviews.completedHint")}</p>
        <fieldset className="star-field">
          <legend>
            {t("reviews.overallRating")} <span aria-hidden="true">*</span>
          </legend>
          <div
            role="radiogroup"
            aria-label={t("reviews.overallRating")}
            onKeyDown={(event) => {
              if (
                !["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(
                  event.key,
                )
              )
                return;
              event.preventDefault();
              const direction = ["ArrowRight", "ArrowDown"].includes(event.key)
                ? 1
                : -1;
              const next = (((rating || 1) - 1 + direction + 5) % 5) + 1;
              setRating(next);
              event.currentTarget
                .querySelectorAll<HTMLButtonElement>('[role="radio"]')
                [next - 1]?.focus();
            }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                role="radio"
                tabIndex={(rating || 1) === n ? 0 : -1}
                aria-checked={rating === n}
                aria-label={t(n === 1 ? "reviews.stars.one" : "reviews.stars", {
                  count: n,
                })}
                onClick={() => setRating(n)}
              >
                <Star size={30} fill={n <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </fieldset>
        <div className="review-dimension-fields">
          {Object.entries(dimensionLabels).map(([key, label]) => (
            <label className="field" key={key}>
              {t(label)}
              <select
                value={dimensions[key as keyof typeof dimensions] ?? ""}
                onChange={(e) =>
                  setDimensions({
                    ...dimensions,
                    [key]: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              >
                <option value="">{t("reviews.optional")}</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {number(n)} / {number(5)}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <label className="field">
          {t("reviews.experience")}
          <textarea
            required
            minLength={10}
            maxLength={2000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("reviews.placeholder")}
          />
        </label>
        {error && (
          <p role="alert" className="error-message">
            {errorText(error)}
          </p>
        )}
        <button className="button button-dark button-full" type="submit">
          {t("reviews.post")}
        </button>
        <p className="gallery-disclaimer">{t("reviews.localNotice")}</p>
      </form>
    </Modal>
  );
}
