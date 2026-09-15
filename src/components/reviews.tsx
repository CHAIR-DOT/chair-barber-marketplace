"use client";
import { useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { customers } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import type { Review } from "@/lib/types";
import { useMock } from "./provider";
import { Badge, EmptyState, Modal, Rating } from "./ui";
const dimensionLabels = {
  quality: "Haircut quality",
  detail: "Attention to detail",
  communication: "Communication",
  punctuality: "Punctuality",
};
export function ReviewCard({ review }: { review: Review }) {
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
          {(customer?.name ?? "Guest")
            .split(" ")
            .map((x) => x[0])
            .join("")}
        </span>
        <div>
          <strong>{customer?.name ?? "Demo customer"}</strong>
          <span>{formatDate(review.date, { year: "numeric" })}</span>
        </div>
        <Rating value={review.rating} />
      </div>
      <p>{review.text}</p>
      <div className="review-footer">
        <span>
          {service?.name} · {barber?.name.split(" ")[0]}
        </span>
        {verified && (
          <Badge tone="green">
            <BadgeCheck size={12} />
            Verified appointment
          </Badge>
        )}
      </div>
    </article>
  );
}
export function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const value = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  return (
    <div className="rating-breakdown">
      <div className="rating-overall">
        <strong>{value ? value.toFixed(1) : "—"}</strong>
        <div>
          <div
            className="review-stars"
            aria-label={`${value.toFixed(1)} out of 5 stars`}
          >
            ★★★★★
          </div>
          <span>
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>
      <div className="rating-distribution">
        {[5, 4, 3, 2, 1].map((n) => (
          <div key={n}>
            <span>{n}</span>
            <Star size={11} />
            <div className="progress-track">
              <i
                style={{
                  width: `${reviews.length ? (reviews.filter((r) => r.rating === n).length / reviews.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span>{reviews.filter((r) => r.rating === n).length}</span>
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
              <span>{label}</span>
              <strong>
                {list.length
                  ? (list.reduce((a, b) => a + b, 0) / list.length).toFixed(1)
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
  const [all, setAll] = useState(false);
  return (
    <section className="profile-section" id="reviews">
      <div className="section-heading">
        <div>
          <div className="eyebrow">FROM THE OTHER SIDE OF THE CHAIR</div>
          <h2>Good words. Great cuts.</h2>
        </div>
        <Badge>{reviews.length} reviews</Badge>
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
                ? "Show fewer reviews"
                : `Read all ${reviews.length} reviews`}
            </button>
          )}
        </>
      ) : (
        <EmptyState
          title="Every reputation starts somewhere"
          text="This barber has no reviews yet. Reviews will appear after customers complete an appointment."
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
      title={`How was your cut with ${barber?.name.split(" ")[0] ?? "your barber"}?`}
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
        <p className="small-text muted">
          Your completed appointment helps keep reviews meaningful.
        </p>
        <fieldset className="star-field">
          <legend>
            Overall rating <span aria-hidden="true">*</span>
          </legend>
          <div
            role="radiogroup"
            aria-label="Overall rating"
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
                aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
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
              {label}
              <select
                value={dimensions[key as keyof typeof dimensions] ?? ""}
                onChange={(e) =>
                  setDimensions({
                    ...dimensions,
                    [key]: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              >
                <option value="">Optional</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <label className="field">
          Your experience
          <textarea
            required
            minLength={10}
            maxLength={2000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What made your visit memorable?"
          />
        </label>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <button className="button button-dark button-full" type="submit">
          Post demo review
        </button>
        <p className="gallery-disclaimer">
          Saved only in this browser. No real review is submitted.
        </p>
      </form>
    </Modal>
  );
}
