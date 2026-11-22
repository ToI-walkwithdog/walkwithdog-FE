import type { AvailableBooking } from "../data/availableBookings";
import type { BookingStatus, WalkRecord } from "../types/models";

export type MockBooking = {
  id: string;
  dogId: AvailableBooking["dogId"];
  schedule: AvailableBooking["schedules"][number];
  status: BookingStatus;
};

export type MockWalkRecord = WalkRecord & { message?: string; markers?: string[] };
export type BookingFilter = "전체" | "승인 대기" | "확정" | "지난 예약";

export function filterMockBookings(bookings: MockBooking[], filter: BookingFilter): MockBooking[] {
  if (filter === "전체") return bookings;
  if (filter === "승인 대기") return bookings.filter((booking) => booking.status === "pending");
  if (filter === "확정") return bookings.filter((booking) => booking.status === "confirmed");
  return bookings.filter((booking) => booking.status === "cancelled" || booking.status === "rejected");
}

export function createMockBooking(
  options: AvailableBooking[],
  dogId: AvailableBooking["dogId"],
  scheduleIndex: number,
  id: string,
): MockBooking {
  const option = options.find((item) => item.dogId === dogId);
  const schedule = option?.schedules[scheduleIndex];
  if (!schedule) throw new Error("Selected booking schedule is unavailable.");
  return { id, dogId, schedule, status: "pending" };
}

export function cancelMockBooking(bookings: MockBooking[], id: string): MockBooking[] {
  const selected = bookings.find((booking) => booking.id === id);
  if (!selected || selected.status !== "confirmed") {
    throw new Error("Only a confirmed booking can be cancelled.");
  }
  return bookings.map((booking) =>
    booking.id === id ? { ...booking, status: "cancelled" } : booking,
  );
}

export function createMockWalkRecord(
  message: string,
  markers: string[],
  now: Date,
  id: string,
): MockWalkRecord {
  return {
    id,
    dogId: "kongi",
    displayName: "콩이와 산책",
    displayDistance: "2.4 km",
    displayDate: `${now.getMonth() + 1}.${now.getDate()}.`,
    startedAt: now.toISOString(),
    durationSeconds: 1935,
    distanceMeters: 2400,
    shelterName: "행복 보호소",
    message: message.trim(),
    markers: [...markers],
  };
}
