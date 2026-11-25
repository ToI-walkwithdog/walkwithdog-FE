import { api } from "./client";
import type { CancelReasonCode, ReservationDisplayStatus } from "./bookingCodes";

export type WalkRequestBody = {
  dog_id: number;
  date_slot_id: number;
  // 슬롯의 starts_at, ends_at 그대로 보낸다. 다르면 409 WALK_SLOT_CHANGED.
  requested_start_at: string;
  requested_end_at: string;
};

// POST /walk-requests 201의 data (DateWalkRequestReceipt).
export type WalkRequestReceipt = {
  id: number;
  dog_id: number;
  date_slot_id: number;
  shelter_id: number;
  requested_start_at: string;
  requested_end_at: string;
  status: "PENDING";
  created_at: string;
};

// Idempotency-Key는 화면 진입 때 한 번 만들어 같은 신청의 재시도에 재사용한다.
export function createWalkRequest(body: WalkRequestBody, idempotencyKey: string) {
  return api.post<WalkRequestReceipt>("/walk-requests", body, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

// GET /walk-requests/my 항목(ManagedWalkRequestResponse 중 이번 단계에서 쓰는 필드).
export type MyWalkRequest = {
  id: number;
  dog_id: number;
  shelter_id: number;
  shelter_name: string | null;
  dog: { id: number; name: string; image_url: string | null };
  requested_start_at: string;
  requested_end_at: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  display_status: ReservationDisplayStatus;
  walk_id: number | null;
  walk_status: string | null;
  date_slot_id?: number | null;
  can_cancel: boolean;
  // 아래는 ManagedWalkRequestResponse가 항상 보내는 필드다. 이력 표시에만 쓴다.
  created_at: string;
  rejection_reason: string | null;
  rejection_reason_code: string | null;
  cancel_reason_code: CancelReasonCode | null;
  cancelled_at: string | null;
  cancelled_actor_role: "USER" | "SHELTER" | "ADMIN" | null;
  cancelled_after_approval: boolean;
};

type MyWalkRequestsQuery = {
  startableOnly?: boolean;
  limit?: number;
  offset?: number;
  // status와 statusGroup은 함께 보내면 422 RESERVATION_FILTER_CONFLICT다. 하나만 쓴다.
  status?: "PENDING" | "APPROVED";
  statusGroup?: "PAST";
};

// 본문이 배열 그대로다(봉투 없음).
export function fetchMyWalkRequests({
  startableOnly,
  limit,
  offset,
  status,
  statusGroup,
}: MyWalkRequestsQuery = {}) {
  const params: string[] = [];
  if (status) params.push(`status=${status}`);
  if (statusGroup) params.push(`status_group=${statusGroup}`);
  if (startableOnly) params.push("startable_only=true");
  if (limit !== undefined) params.push(`limit=${limit}`);
  if (offset !== undefined) params.push(`offset=${offset}`);
  const query = params.length ? `?${params.join("&")}` : "";
  return api.get<MyWalkRequest[]>(`/walk-requests/my${query}`);
}

// GET /walk-requests/{id}의 data (WalkRequestDetailResponse 중 이번 단계에서 쓰는 필드). 본문 그대로다.
export type WalkRequestDetail = MyWalkRequest & {
  shelter: { id: number; name: string } | null;
  max_walk_minutes: number | null;
  // 종료 전 승인 예약의 본인에게만 온다.
  confirmed_visit: { address: string | null; phone: string | null } | null;
  actions: { can_cancel: boolean; can_enter_shelter_code: boolean };
};

// 없는 예약은 404, 남의 예약은 403이다(둘 다 detail이 문자열이라 code가 없다).
export function fetchWalkRequestDetail(id: number) {
  return api.get<WalkRequestDetail>(`/walk-requests/${id}`);
}

// PATCH /walk-requests/{id}. 취소 사유는 선택이다. 이 API는 Idempotency-Key를 받지 않는다.
// 재전송 409 REQUEST_ALREADY_CANCELLED나 응답 유실은 상세를 다시 조회해서 판단한다.
export function cancelWalkRequest(id: number, reason: CancelReasonCode | null) {
  return api.patch<MyWalkRequest>(
    `/walk-requests/${id}`,
    reason ? { action: "CANCEL", cancel_reason_code: reason } : { action: "CANCEL" },
  );
}
