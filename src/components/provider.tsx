"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useI18n } from "@/i18n/provider";
import type { Values } from "@/i18n/config";
import * as fixture from "@/lib/data";
import { canReview, getPrice, validateAppointment } from "@/lib/booking";
import { today } from "@/lib/dates";
import type {
  Appointment,
  Barber,
  Favorite,
  MockState,
  Review,
} from "@/lib/types";
const STORAGE_KEY = "chair.prototype.v1";
const initialState: MockState = {
  favorites: [],
  appointments: fixture.appointments,
  reviews: fixture.reviews,
  barbers: fixture.barbers,
  services: fixture.services,
  portfolio: fixture.portfolio,
  availability: fixture.availability,
  user: null,
};
type BookingInput = Pick<
  Appointment,
  "shopId" | "barberId" | "serviceId" | "date" | "time"
>;
interface Store {
  reset: () => void;
  state: MockState;
  ready: boolean;
  compare: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  notify: (text: string, values?: Values) => void;
  update: (patch: Partial<MockState>) => void;
  favorite: (type: Favorite["type"], id: string) => void;
  isFavorite: (type: Favorite["type"], id: string) => boolean;
  book: (input: BookingInput, rescheduleId?: string) => string;
  cancel: (id: string) => void;
  review: (
    appointmentId: string,
    rating: number,
    text: string,
    dimensions: Review["dimensions"],
  ) => void;
  updateBarber: (id: string, patch: Partial<Barber>) => void;
}
const Context = createContext<Store | null>(null);
export function MockProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [state, setState] = useState<MockState>(initialState),
    [ready, setReady] = useState(false),
    [compare, setCompare] = useState<string[]>([]),
    [toast, setToast] = useState<{ key: string; values?: Values } | null>(null);
  const stateRef = useRef(state),
    toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((text: string, values?: Values) => {
    setToast({ key: text, values });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }, []);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed.version === 1 &&
          parsed.data &&
          [
            "favorites",
            "appointments",
            "reviews",
            "barbers",
            "services",
            "portfolio",
            "availability",
          ].every((key) => Array.isArray(parsed.data[key]))
        ) {
          const next = { ...initialState, ...parsed.data } as MockState;
          next.portfolio = next.portfolio.map((item) => {
            const corrected = initialState.portfolio.find(
              (p) => p.id === item.id,
            );
            return corrected && item.image.startsWith("/images/cut-")
              ? {
                  ...item,
                  image:
                    fixture.styles.find(
                      (style) => style.id === item.styleIds[0],
                    )?.image ?? item.image,
                }
              : item;
          });
          stateRef.current = next;
          setState(next);
        }
      }
    } catch {
      notify("notifications.storageLoad");
    }
    setReady(true);
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [notify]);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, data: state }),
      );
    } catch {
      notify("notifications.storageFull");
    }
  }, [state, ready, notify]);
  const update = useCallback((patch: Partial<MockState>) => {
    const next = { ...stateRef.current, ...patch };
    stateRef.current = next;
    setState(next);
  }, []);
  const favorite = (type: Favorite["type"], id: string) => {
    const list = stateRef.current.favorites;
    const exists = list.some((f) => f.type === type && f.entityId === id);
    update({
      favorites: exists
        ? list.filter((f) => !(f.type === type && f.entityId === id))
        : [...list, { type, entityId: id }],
    });
    notify(exists ? "notifications.unsaved" : "notifications.saved");
  };
  const toggleCompare = (id: string) => {
    if (compare.includes(id)) setCompare(compare.filter((x) => x !== id));
    else if (compare.length < 3) setCompare([...compare, id]);
    else notify("notifications.compareLimit");
  };
  const book = (input: BookingInput, rescheduleId?: string) => {
    const current = stateRef.current;
    const { barber, service } = validateAppointment(
      current,
      input,
      rescheduleId,
    );
    const existing = current.appointments.find((a) => a.id === rescheduleId);
    if (
      rescheduleId &&
      (!existing ||
        existing.status !== "upcoming" ||
        existing.customerId !== fixture.customer.id)
    )
      throw new Error("errors.reschedule");
    const id = existing?.id ?? `appointment-${crypto.randomUUID()}`;
    const appointment: Appointment = {
      ...input,
      id,
      customerId: fixture.customer.id,
      price: getPrice(barber, service.id, current),
      duration: service.duration,
      status: "upcoming",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    update({
      appointments: existing
        ? current.appointments.map((a) => (a.id === id ? appointment : a))
        : [...current.appointments, appointment],
    });
    return id;
  };
  const cancel = (id: string) => {
    const current = stateRef.current;
    const appointment = current.appointments.find((a) => a.id === id);
    if (
      !appointment ||
      appointment.customerId !== fixture.customer.id ||
      appointment.status !== "upcoming"
    ) {
      notify("errors.cancel");
      return;
    }
    update({
      appointments: current.appointments.map((a) =>
        a.id === id &&
        a.customerId === fixture.customer.id &&
        a.status === "upcoming"
          ? { ...a, status: "cancelled" }
          : a,
      ),
    });
    notify("notifications.cancelled");
  };
  const review = (
    appointmentId: string,
    rating: number,
    text: string,
    dimensions: Review["dimensions"],
  ) => {
    const current = stateRef.current;
    if (!canReview(current, appointmentId, fixture.customer.id))
      throw new Error("errors.reviewEligible");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      throw new Error("errors.rating");
    if (text.trim().length < 10) throw new Error("errors.reviewLength");
    const appointment = current.appointments.find(
      (a) => a.id === appointmentId,
    )!;
    update({
      reviews: [
        ...current.reviews,
        {
          id: `review-${crypto.randomUUID()}`,
          appointmentId,
          customerId: fixture.customer.id,
          barberId: appointment.barberId,
          date: today(),
          rating,
          text: text.trim(),
          dimensions,
        },
      ],
    });
    notify("notifications.reviewPublished");
  };
  return (
    <Context.Provider
      value={{
        reset: () => {
          update(initialState);
          setCompare([]);
          notify("notifications.reset");
        },
        state,
        ready,
        compare,
        toggleCompare,
        clearCompare: () => setCompare([]),
        notify,
        update,
        favorite,
        isFavorite: (type, id) =>
          state.favorites.some((f) => f.type === type && f.entityId === id),
        book,
        cancel,
        review,
        updateBarber: (id, patch) =>
          update({
            barbers: stateRef.current.barbers.map((b) =>
              b.id === id ? { ...b, ...patch } : b,
            ),
          }),
      }}
    >
      {ready ? (
        children
      ) : (
        <div className="container startup-state" role="status">
          <div className="logo">
            CHAIR<span>.</span>
          </div>
          <div className="skeleton startup-skeleton" />
          <p>{t("common.finding")}</p>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>✓</span>
          {t(toast.key, toast.values)}
          <button
            aria-label={t("common.dismiss")}
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export function useMock() {
  const context = useContext(Context);
  if (!context) throw new Error("MockProvider is required");
  return context;
}
