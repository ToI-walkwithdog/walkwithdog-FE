import { api } from "./client";

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type DisplayStatus = RequestStatus | "COMPLETED";
export type RejectionReasonCode = "SCHEDULE_CONFLICT" | "EXPERIENCE_MISMATCH" | "INFO_INSUFFICIENT" | "OTHER";
export type CancelReasonCode = "SCHEDULE_CHANGED" | "CANNOT_VISIT";

export const STATUS_TABS: { status: RequestStatus; label: string }[] = [
  { status: "PENDING", label: "승인 대기" },
  { status: "APPROVED", label: "승인됨" },
  { status: "REJECTED", label: "거절됨" },
  { status: "CANCELLED", label: "취소됨" },
];

export const DISPLAY_STATUS_LABELS: Record<DisplayStatus, string> = {
  PENDING: "승인 대기",
  APPROVED: "승인됨",
  REJECTED: "거절됨",
  CANCELLED: "취소됨",
  COMPLETED: "산책 완료",
};

export const REJECTION_REASONS: { code: RejectionReasonCode; label: string }[] = [
  { code: "SCHEDULE_CONFLICT", label: "일정이 맞지 않아요" },
  { code: "EXPERIENCE_MISMATCH", label: "경험이 맞지 않아요" },
  { code: "INFO_INSUFFICIENT", label: "정보가 부족해요" },
  { code: "OTHER", label: "기타 (사유 입력)" },
];

export const CANCEL_REASONS: { code: CancelReasonCode; label: string }[] = [
  { code: "SCHEDULE_CHANGED", label: "보호소 일정이 바뀌었어요" },
  { code: "CANNOT_VISIT", label: "방문을 받기 어려워요" },
];

export function statusLabel(item: { status: string; display_status?: string | null }): string {
  const key = item.display_status ?? item.status;
  return key in DISPLAY_STATUS_LABELS ? DISPLAY_STATUS_LABELS[key as DisplayStatus] : key;
}

export function rejectionReasonLabel(code: string | null | undefined): string | null {
  return REJECTION_REASONS.find((reason) => reason.code === code)?.label ?? null;
}

export function cancelReasonLabel(code: string | null | undefined): string | null {
  return CANCEL_REASONS.find((reason) => reason.code === code)?.label ?? null;
}

// GET /shelters/{id}/walk-requests 항목. 신청자 정보는 없고(user_id뿐) 상세에만 있다.
export type WalkRequestItem = {
  id: number;
  dog_id: number;
  dog?: { id: number; name: string; image_url: string | null } | null;
  user_id?: number;
  requested_start_at: string;
  requested_end_at: string;
  status: RequestStatus;
  display_status?: DisplayStatus | null;
  walk_id?: number | null;
  walk_status?: string | null;
  created_at?: string;
  rejection_reason?: string | null;
  rejection_reason_code?: string | null;
  cancel_reason_code?: string | null;
  cancelled_at?: string | null;
  cancelled_actor_role?: string | null;
};

export const PAGE_SIZE = 20;

// 본문이 배열 그대로이고 total, has_more가 없다. 가져온 개수가 limit보다 적으면 마지막이다. 최신순이다.
export function fetchShelterRequests(shelterId: string, status: RequestStatus, offset = 0, limit = PAGE_SIZE) {
  return api.get<WalkRequestItem[]>(
    `/shelters/${encodeURIComponent(shelterId)}/walk-requests?status=${status}&limit=${limit}&offset=${offset}`,
  );
}

// 신청자의 name, age는 보호소에게 항상 null이라 쓰지 않는다.
export type Applicant = {
  id?: number;
  nickname?: string | null;
  dog_experience?: unknown;
  experienced_breed?: unknown;
  walk_frequency?: unknown;
};

export type WalkRequestDetail = WalkRequestItem & {
  applicant?: Applicant | null;
  max_walk_minutes?: number | null;
};

export function fetchWalkRequest(id: string) {
  return api.get<WalkRequestDetail>(`/walk-requests/${encodeURIComponent(id)}`);
}

// PATCH /walk-requests/{id}. 본문에는 허용된 필드만 넣는다(추가 필드는 거절된다).
export function approveWalkRequest(id: number) {
  return api.patch<unknown>(`/walk-requests/${id}`, { action: "APPROVE" });
}

// 사유 코드가 OTHER이면 비어 있지 않은 사유가 필요하다(호출하는 쪽에서 확인한다).
export function rejectWalkRequest(id: number, code: RejectionReasonCode, reason: string) {
  const text = reason.trim();
  return api.patch<unknown>(`/walk-requests/${id}`, {
    action: "REJECT",
    rejection_reason_code: code,
    ...(text ? { rejection_reason: text } : {}),
  });
}

// 보호소의 취소는 PENDING 또는 APPROVED이면서 시작 전이고 산책 기록이 없을 때만 된다.
export function cancelWalkRequest(id: number, code: CancelReasonCode) {
  return api.patch<unknown>(`/walk-requests/${id}`, { action: "CANCEL", cancel_reason_code: code });
}

// POST /walk-requests/{id}/shelter-code (본문 없음). shelter_code는 앞자리 0이 있는 6자리 문자열이다.
export type ShelterCodeIssued = { request_id: number; shelter_code: string; expires_at: string };

export function issueShelterCode(id: number) {
  return api.post<ShelterCodeIssued>(`/walk-requests/${id}/shelter-code`);
}

// 승인 대기 신청 수. total이 없어서 limit=100씩 마지막 쪽까지 넘기며 센다(안전 상한 50쪽).
export async function countPendingRequests(shelterId: string) {
  const first: WalkRequestItem[] = [];
  let count = 0;
  for (let page = 0; page < 50; page += 1) {
    const res = await fetchShelterRequests(shelterId, "PENDING", page * 100, 100);
    if (!res.ok) return res;
    count += res.data.length;
    if (page === 0) first.push(...res.data);
    if (res.data.length < 100) break;
  }
  return { ok: true as const, status: 200, data: { count, first } };
}
