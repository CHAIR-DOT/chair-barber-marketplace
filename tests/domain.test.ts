import test from "node:test";
import assert from "node:assert/strict";
import * as data from "../src/lib/data";
import { addDays, today } from "../src/lib/dates";
import {
  BOOKING_HORIZON,
  canReview,
  getPrice,
  nextAvailable,
  slotAvailable,
  validateAppointment,
} from "../src/lib/booking";
import type { MockState } from "../src/lib/types";
const fresh = (): MockState =>
  structuredClone({ ...data, user: null, favorites: [] });
function nextWeekday() {
  let date = addDays(1);
  while ([0, 1].includes(new Date(`${date}T12:00:00Z`).getUTCDay()))
    date = addDays(1, date);
  return date;
}
test("seed entities meet minimum size and every foreign key resolves", () => {
  const s = fresh();
  assert.equal(data.shops.length, 8);
  assert.ok(s.barbers.length >= 15);
  assert.ok(s.reviews.length >= 30);
  for (const b of s.barbers) {
    assert.ok(data.shops.some((x) => x.id === b.shopId));
    for (const id of b.serviceIds)
      assert.ok(s.services.some((x) => x.id === id));
    for (const id of b.styleIds)
      assert.ok(data.styles.some((x) => x.id === id));
  }
  for (const p of s.portfolio) {
    assert.ok(s.barbers.some((b) => b.id === p.barberId));
    assert.ok(p.styleIds.every((id) => data.styles.some((x) => x.id === id)));
  }
  for (const r of s.reviews) {
    const a = s.appointments.find((a) => a.id === r.appointmentId)!;
    assert.ok(a);
    assert.equal(a.status, "completed");
    assert.equal(a.customerId, r.customerId);
    assert.equal(a.barberId, r.barberId);
    assert.ok(data.customers.some((c) => c.id === r.customerId));
  }
  assert.equal(
    new Set(s.reviews.map((r) => r.appointmentId)).size,
    s.reviews.length,
  );
});
test("seeded appointments are consistent with shop working days and service snapshots", () => {
  const s = fresh();
  for (const a of s.appointments) {
    const b = s.barbers.find((b) => b.id === a.barberId)!;
    const shop = data.shops.find((x) => x.id === a.shopId)!;
    assert.equal(b.shopId, a.shopId);
    assert.ok(b.serviceIds.includes(a.serviceId));
    assert.ok(
      !shop.closedDays.includes(new Date(`${a.date}T12:00:00Z`).getUTCDay()),
    );
    assert.equal(a.price, getPrice(b, a.serviceId, s));
    assert.equal(
      a.duration,
      s.services.find((x) => x.id === a.serviceId)?.duration,
    );
  }
});
test("overlapping service durations block a slot but adjacent appointments do not", () => {
  const s = fresh(),
    date = nextWeekday();
  s.appointments = [];
  assert.ok(slotAvailable(s, "barber-1", "haircut", date, "10:45"));
  s.appointments.push({
    id: "overlap",
    customerId: "customer-1",
    barberId: "barber-1",
    shopId: "shop-1",
    serviceId: "haircut-beard",
    date,
    time: "10:00",
    duration: 60,
    price: 55,
    status: "upcoming",
    createdAt: today(),
  });
  assert.equal(slotAvailable(s, "barber-1", "haircut", date, "10:45"), false);
  s.appointments[0].duration = 45;
  assert.equal(slotAvailable(s, "barber-1", "haircut", date, "10:45"), true);
});
test("rescheduling can exclude the original appointment; cancelled slots are released", () => {
  const s = fresh(),
    date = nextWeekday();
  s.appointments = [
    {
      id: "moving",
      customerId: "customer-1",
      barberId: "barber-1",
      shopId: "shop-1",
      serviceId: "haircut",
      date,
      time: "14:30",
      duration: 45,
      price: 35,
      status: "upcoming",
      createdAt: today(),
    },
  ];
  assert.equal(slotAvailable(s, "barber-1", "haircut", date, "14:30"), false);
  assert.equal(
    slotAvailable(s, "barber-1", "haircut", date, "14:30", "moving"),
    true,
  );
  s.appointments[0].status = "cancelled";
  assert.ok(slotAvailable(s, "barber-1", "haircut", date, "14:30"));
});
test("past dates, invalid dates, unsupported services, closed days, and blocked dates cannot book", () => {
  const s = fresh(),
    date = nextWeekday();
  assert.equal(
    slotAvailable(s, "barber-1", "haircut", addDays(-1), "10:00"),
    false,
  );
  assert.equal(
    slotAvailable(s, "barber-1", "haircut", "2026-99-99", "10:00"),
    false,
  );
  assert.equal(
    slotAvailable(s, "barber-16", "skin-fade", date, "10:00"),
    false,
  );
  let sunday = date;
  while (new Date(`${sunday}T12:00:00Z`).getUTCDay() !== 0)
    sunday = addDays(1, sunday);
  assert.equal(slotAvailable(s, "barber-1", "haircut", sunday, "10:00"), false);
  s.availability[0].blockedDates.push(date);
  assert.equal(slotAvailable(s, "barber-1", "haircut", date, "10:00"), false);
});
test("appointment must fit working hours and use a valid duration and price", () => {
  const s = fresh(),
    date = nextWeekday();
  s.availability[0].end = "18:00";
  assert.equal(slotAvailable(s, "barber-1", "haircut", date, "17:45"), false);
  s.services[0].duration = 0;
  assert.equal(slotAvailable(s, "barber-1", "haircut", date, "10:00"), false);
  s.services[0].duration = 45;
  s.barbers[0].servicePrices.haircut = NaN;
  assert.equal(slotAvailable(s, "barber-1", "haircut", date, "10:00"), false);
});
test("next availability searches the same 30-day horizon as booking", () => {
  const s = fresh();
  s.appointments = [];
  s.availability[0].blockedDates = Array.from({ length: 15 }, (_, i) =>
    addDays(i),
  );
  const next = nextAvailable(s, "barber-1");
  assert.ok(next);
  assert.ok(next.date >= addDays(15));
  assert.ok(next.date <= addDays(BOOKING_HORIZON));
  assert.ok(slotAvailable(s, "barber-1", "haircut", next.date, next.time));
});
test("booking validation rejects shop mismatch and changes in slot availability", () => {
  const s = fresh(),
    date = nextWeekday();
  assert.throws(
    () =>
      validateAppointment(s, {
        barberId: "barber-1",
        shopId: "shop-2",
        serviceId: "haircut",
        date,
        time: "10:00",
      }),
    /this shop/,
  );
  s.availability[0].blockedSlots.push("10:00");
  assert.throws(
    () =>
      validateAppointment(s, {
        barberId: "barber-1",
        shopId: "shop-1",
        serviceId: "haircut",
        date,
        time: "10:00",
      }),
    /no longer available/,
  );
});
test("only the owning customer can review a completed booking exactly once", () => {
  const s = fresh();
  assert.ok(canReview(s, "appointment-unreviewed", "customer-1"));
  assert.equal(canReview(s, "appointment-unreviewed", "customer-2"), false);
  assert.equal(canReview(s, "appointment-upcoming", "customer-1"), false);
  assert.equal(canReview(s, "appointment-cancelled", "customer-1"), false);
  assert.equal(canReview(s, "history-1", "customer-1"), false);
  assert.equal(canReview(s, "missing", "customer-1"), false);
});
