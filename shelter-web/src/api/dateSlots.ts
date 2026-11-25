import { api } from "./client";
import type { DateSlotInput } from "./dogs";
import { kstParts } from "../time";

// GET /dogs/{id}/date-slots 항목(비활성 포함). 응답 모양이 문서에 없어 필드를 선택으로 두고,
// 한국 시간 필드(slot_date, start_time, end_time)가 없으면 UTC starts_at, ends_at에서 계산한다.
export type DateSlotRaw = {
  id?: number;
  date_slot_id?: number;
  slot_date?: string;
  start_time?: string;
  end_time?: string;
  starts_at?: string;
  ends_at?: string;
  duration_minutes?: number | null;
  is_active?: boolean;
};

export type DateSlot = {
  id: number;
  date: string;
  start: string;
  end: string;
  durationMinutes: number | null;
  active: boolean;
};

export function normalizeSlot(raw: DateSlotRaw): DateSlot | null {
  const id = raw.id ?? raw.date_slot_id;
  if (typeof id !== "number") return null;
  const startParts = raw.starts_at ? kstParts(raw.starts_at) : null;
  const endParts = raw.ends_at ? kstParts(raw.ends_at) : null;
  return {
    id,
    date: raw.slot_date ?? startParts?.date ?? "",
    start: (raw.start_time ?? startParts?.time ?? "").slice(0, 5),
    end: (raw.end_time ?? endParts?.time ?? "").slice(0, 5),
    durationMinutes: raw.duration_minutes ?? null,
    active: raw.is_active !== false,
  };
}

export async function fetchDateSlots(dogId: string) {
  const res = await api.get<DateSlotRaw[]>(`/dogs/${encodeURIComponent(dogId)}/date-slots`);
  if (!res.ok) return res;
  const list = Array.isArray(res.data) ? res.data : [];
  return { ...res, data: list.flatMap((raw) => { const slot = normalizeSlot(raw); return slot ? [slot] : []; }) };
}

// 본문은 일정 객체의 JSON 배열(1개 이상)이다. 한국 시간, 시간대 표기 없음.
export function createDateSlots(dogId: string, slots: DateSlotInput[]) {
  return api.post<unknown>(`/dogs/${encodeURIComponent(dogId)}/date-slots`, slots);
}

// 204. 되돌릴 수 없는 종료(soft delete)다. 409는 진행 중인 예약이 있다는 뜻이다.
export function deleteDateSlot(dogId: string, slotId: number) {
  return api.delete<undefined>(`/dogs/${encodeURIComponent(dogId)}/date-slots/${slotId}`);
}
