import { api } from "./client";
import type { ReservationDisplayStatus } from "./bookingCodes";

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
};

type MyWalkRequestsQuery = {
  startableOnly?: boolean;
  limit?: number;
  offset?: number;
};

// 본문이 배열 그대로다(봉투 없음).
export function fetchMyWalkRequests({
  startableOnly,
  limit,
  offset,
}: MyWalkRequestsQuery = {}) {
  const params: string[] = [];
  if (startableOnly) params.push("startable_only=true");
  if (limit !== undefined) params.push(`limit=${limit}`);
  if (offset !== undefined) params.push(`offset=${offset}`);
  const query = params.length ? `?${params.join("&")}` : "";
  return api.get<MyWalkRequest[]>(`/walk-requests/my${query}`);
}
