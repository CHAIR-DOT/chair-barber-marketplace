import { shops, SLOT_TIMES } from "./data";
import { addDays, currentMinutes, minutes, today } from "./dates";
import type { Appointment, Barber, MockState, Review } from "./types";

export const BOOKING_HORIZON = 30;
export const getPrice = (
  barber: Barber,
  serviceId: string,
  state: Pick<MockState, "services">,
) =>
  barber.servicePrices[serviceId] ??
  state.services.find((s) => s.id === serviceId)?.price ??
  0;
export function ratingFor(barberId: string, reviews: Review[]) {
  const list = reviews.filter((r) => r.barberId === barberId);
  return {
    count: list.length,
    value: list.length
      ? list.reduce((n, r) => n + r.rating, 0) / list.length
      : 0,
  };
}
export function slotAvailable(
  state: Pick<
    MockState,
    "barbers" | "services" | "appointments" | "availability"
  >,
  barberId: string,
  serviceId: string,
  date: string,
  time: string,
  excludeId?: string,
) {
  const b = state.barbers.find((x) => x.id === barberId),
    s = state.services.find((x) => x.id === serviceId),
    a = state.availability.find((x) => x.barberId === barberId);
  const shop = shops.find((x) => x.id === b?.shopId);
  if (
    !b ||
    !s ||
    !a ||
    !shop ||
    !Number.isFinite(s.duration) ||
    s.duration <= 0 ||
    !Number.isFinite(getPrice(b, serviceId, state)) ||
    getPrice(b, serviceId, state) < 0 ||
    !b.serviceIds.includes(serviceId) ||
    !SLOT_TIMES.includes(time) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    date < today() ||
    date > addDays(BOOKING_HORIZON)
  )
    return false;
  const d = new Date(`${date}T12:00:00Z`),
    weekday = d.getUTCDay();
  if (
    Number.isNaN(d.getTime()) ||
    d.toISOString().slice(0, 10) !== date ||
    !a.workingDays.includes(weekday) ||
    shop.closedDays.includes(weekday) ||
    a.blockedDates.includes(date) ||
    a.blockedSlots.includes(time)
  )
    return false;
  const start = minutes(time),
    end = start + s.duration;
  if (
    start < Math.max(minutes(a.start), minutes(shop.openingTime)) ||
    end > Math.min(minutes(a.end), minutes(shop.closingTime)) ||
    (date === today() && start <= currentMinutes())
  )
    return false;
  return !state.appointments.some(
    (x) =>
      x.id !== excludeId &&
      x.barberId === barberId &&
      x.date === date &&
      x.status === "upcoming" &&
      start < minutes(x.time) + x.duration &&
      end > minutes(x.time),
  );
}
export function nextAvailable(
  state: Pick<
    MockState,
    "barbers" | "services" | "appointments" | "availability"
  >,
  barberId: string,
  serviceId = "haircut",
) {
  for (let d = 0; d <= BOOKING_HORIZON; d++) {
    const date = addDays(d);
    for (const time of SLOT_TIMES)
      if (slotAvailable(state, barberId, serviceId, date, time))
        return { date, time };
  }
  return null;
}
export function validateAppointment(
  state: MockState,
  input: Pick<
    Appointment,
    "barberId" | "shopId" | "serviceId" | "date" | "time"
  >,
  excludeId?: string,
) {
  const barber = state.barbers.find((b) => b.id === input.barberId);
  if (!barber || barber.shopId !== input.shopId)
    throw new Error("errors.barberShop");
  if (
    !slotAvailable(
      state,
      input.barberId,
      input.serviceId,
      input.date,
      input.time,
      excludeId,
    )
  )
    throw new Error("errors.slotUnavailable");
  return {
    barber,
    service: state.services.find((s) => s.id === input.serviceId)!,
  };
}
export function canReview(
  state: Pick<MockState, "appointments" | "reviews">,
  appointmentId: string,
  customerId: string,
) {
  const a = state.appointments.find((x) => x.id === appointmentId);
  return (
    !!a &&
    a.customerId === customerId &&
    a.status === "completed" &&
    !state.reviews.some((r) => r.appointmentId === appointmentId)
  );
}
