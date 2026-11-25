// 산책 예약 화면의 라벨과 BE 코드 대응표. BE 값은 app/models.py DOG_SIZE_CODES,
// app/walk_request_schemas.py ReservationDisplayStatus와 같다.

export type DogSizeCode = "SMALL" | "MEDIUM" | "LARGE";

export const DOG_SIZE_LABELS: Record<DogSizeCode, string> = {
  SMALL: "소형견",
  MEDIUM: "중형견",
  LARGE: "대형견",
};

// 크기 필터 칩. code가 null이면 크기 조건 없이 조회한다.
export const SIZE_FILTERS: { label: string; code: DogSizeCode | null }[] = [
  { label: "전체", code: null },
  { label: "소형견", code: "SMALL" },
  { label: "중형견", code: "MEDIUM" },
  { label: "대형견", code: "LARGE" },
];

export function dogSizeLabel(code: string | null | undefined): string | null {
  return code && code in DOG_SIZE_LABELS
    ? DOG_SIZE_LABELS[code as DogSizeCode]
    : null;
}

export function isDogSizeCode(value: string | null | undefined): value is DogSizeCode {
  return value === "SMALL" || value === "MEDIUM" || value === "LARGE";
}

export type ReservationDisplayStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

// 홈 예약 카드의 상태 문구.
export const HOME_STATUS_LABELS: Record<ReservationDisplayStatus, string> = {
  APPROVED: "예약 확정",
  PENDING: "승인 대기",
  REJECTED: "예약 거절",
  CANCELLED: "취소 완료",
  COMPLETED: "산책 완료",
};

export type CancelReasonCode = "SCHEDULE_CHANGED" | "CANNOT_VISIT";

// 취소 사유 선택지. code가 null이면 사유를 보내지 않는다.
export const CANCEL_REASONS: { code: CancelReasonCode | null; label: string }[] = [
  { code: "SCHEDULE_CHANGED", label: "일정이 변경되었어요" },
  { code: "CANNOT_VISIT", label: "방문이 어려워요" },
  { code: null, label: "선택 안 함" },
];

// 내 예약(8-x) 목록 카드의 안내 문구. 상태 라벨은 HOME_STATUS_LABELS를 같이 쓴다.
export const MY_BOOKING_DESCRIPTIONS: Record<ReservationDisplayStatus, string> = {
  APPROVED: "보호소 코드를 입력하고 출발해요!",
  PENDING: "보호소의 확인을 기다리고 있어요.",
  REJECTED: "거절 사유를 확인해 주세요!",
  CANCELLED: "취소한 예약이에요.",
  COMPLETED: "산책을 마친 예약이에요.",
};

// 사용자가 아닌 쪽(보호소, 관리자)이 취소한 예약은 문구를 달리한다.
export function cancelledBySomeoneElse(role: string | null | undefined): boolean {
  return role === "SHELTER" || role === "ADMIN";
}
