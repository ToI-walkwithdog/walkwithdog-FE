import assert from "node:assert/strict";
import test from "node:test";

import { cancelMockBooking, createMockBooking, createMockWalkRecord, filterMockBookings } from "../src/context/mockSessionLogic.ts";

const options = [{
  dogId: "bori",
  schedules: [{ date: "11월 13일", time: "11:00~12:00" }, { date: "11월 15일", time: "15:00~16:00" }],
}];

test("booking preserves the chosen dog and schedule", () => {
  const booking = createMockBooking(options, "bori", 1, "new");
  assert.equal(booking.dogId, "bori");
  assert.deepEqual(booking.schedule, options[0].schedules[1]);
  assert.equal(booking.status, "pending");
  assert.throws(() => createMockBooking(options, "bori", 2, "invalid"));
});

test("cancellation affects only the selected confirmed booking", () => {
  const bookings = [
    { id: "one", dogId: "bori", schedule: options[0].schedules[0], status: "confirmed" },
    { id: "two", dogId: "bori", schedule: options[0].schedules[1], status: "pending" },
  ];
  const updated = cancelMockBooking(bookings, "one");
  assert.equal(updated[0].status, "cancelled");
  assert.equal(updated[1].status, "pending");
  assert.equal(bookings[0].status, "confirmed");
  assert.deepEqual(filterMockBookings(updated, "지난 예약").map((booking) => booking.id), ["one"]);
  assert.deepEqual(filterMockBookings(updated, "확정"), []);
  assert.deepEqual(filterMockBookings(updated, "승인 대기").map((booking) => booking.id), ["two"]);
  assert.throws(() => cancelMockBooking(bookings, "two"));
  assert.throws(() => cancelMockBooking(bookings, "missing"));
});

test("walk record retains the memo and an independent marker list", () => {
  const markers = ["배변", "냄새 맡기"];
  const record = createMockWalkRecord("  한 줄\n두 줄  ", markers, new Date("2026-11-23T12:00:00Z"), "walk");
  markers.push("포토스팟");
  assert.equal(record.message, "한 줄\n두 줄");
  assert.deepEqual(record.markers, ["배변", "냄새 맡기"]);
  assert.equal(record.durationSeconds, 1935);
  assert.equal(record.distanceMeters, 2400);
});
