"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
  notify: (text: string) => void;
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
  const [state, setState] = useState<MockState>(initialState),
    [ready, setReady] = useState(false),
    [compare, setCompare] = useState<string[]>([]),
    [toast, setToast] = useState("");
  const stateRef = useRef(state),
    toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
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
      notify(
        "Saved demo data could not be loaded. Starting with fresh sample data.",
      );
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
      notify(
        "Browser storage is full or unavailable. Changes will last for this session.",
      );
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
    notify(exists ? "Removed from your favorites" : "Saved to your favorites");
  };
  const toggleCompare = (id: string) => {
    if (compare.includes(id)) setCompare(compare.filter((x) => x !== id));
    else if (compare.length < 3) setCompare([...compare, id]);
    else notify("You can compare up to 3 barbers. Remove one to add another.");
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
      throw new Error("This appointment cannot be rescheduled.");
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
      notify("This appointment cannot be cancelled.");
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
    notify("Your demo appointment has been cancelled.");
  };
  const review = (
    appointmentId: string,
    rating: number,
    text: string,
    dimensions: Review["dimensions"],
  ) => {
    const current = stateRef.current;
    if (!canReview(current, appointmentId, fixture.customer.id))
      throw new Error(
        "Only an unreviewed, completed appointment can receive a review.",
      );
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      throw new Error("Choose an overall rating from 1 to 5.");
    if (text.trim().length < 10)
      throw new Error("Write at least 10 characters about your visit.");
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
    notify("Your demo review is published. Thank you!");
  };
  return (
    <Context.Provider
      value={{
        reset: () => {
          update(initialState);
          setCompare([]);
          notify("Sample data restored. Your demo is ready for a fresh start.");
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
          <p>Finding your chair…</p>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>✓</span>
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
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
