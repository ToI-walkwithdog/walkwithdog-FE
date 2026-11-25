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
