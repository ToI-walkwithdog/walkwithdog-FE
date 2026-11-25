// 내 예약(8-x) 화면 사이에서 값을 넘기고, 필터와 이동 경로를 한곳에 모은다.
import type { ReservationDisplayStatus } from "./bookingCodes";
import type { ApiFailure } from "./client";
import { errorMessage } from "./errorMessages";

export const MY_BOOKINGS_PAGE_SIZE = 20;

export type BookingFilter = "전체" | "승인 대기" | "확정" | "지난 예약";

export const BOOKING_FILTERS: BookingFilter[] = ["전체", "승인 대기", "확정", "지난 예약"];

// status와 status_group은 함께 보내면 422이므로 필터마다 하나만 정한다. BE 담당자가 확인한 정책이다.
// 전체는 필터 없음, 확정은 status=APPROVED(완료와 중단된 산책 포함, 화면에서는 display_status로 "산책 완료"),
// 지난 예약은 status_group=PAST(거절과 취소만)다. 예약 상태와 산책 상태는 별개이고 tab=COMPLETED는 쓰지 않는다.
export function queryForFilter(filter: BookingFilter): {
  status?: "PENDING" | "APPROVED";
  statusGroup?: "PAST";
} {
  switch (filter) {
    case "승인 대기":
      return { status: "PENDING" };
    case "확정":
      return { status: "APPROVED" };
    case "지난 예약":
      return { statusGroup: "PAST" };
    default:
      return {};
  }
}

let selectedBookingId: number | null = null;

export function getSelectedBookingId() {
  return selectedBookingId;
}

export function setSelectedBookingId(id: number | null) {
  selectedBookingId = id;
}

export type BookingRoute = "/8-3" | "/8-4" | "/8-5" | "/8-8";

// 표시 상태로 상세 화면을 정한다. 산책을 마친 예약도 확정 상세(8-3)를 쓴다.
export function routeForBooking(status: ReservationDisplayStatus): BookingRoute {
  switch (status) {
    case "PENDING":
      return "/8-4";
    case "REJECTED":
      return "/8-5";
    case "CANCELLED":
      return "/8-8";
    default:
      return "/8-3";
  }
}

// 없는 예약(404)과 남의 예약(403)은 detail이 문자열이라 code가 없다. 이 둘만 HTTP 상태로 나눈다.
export function bookingFailureMessage(failure: ApiFailure): string {
  if (failure.code === null && failure.status === 404) return "예약을 찾을 수 없어요.";
  if (failure.code === null && failure.status === 403) return "이 예약은 볼 수 없어요.";
  return errorMessage(failure.code);
}
