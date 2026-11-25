import type { DateSlotInput } from "./api/dogs";

export const DURATIONS = [30, 60, 90] as const;
export type Duration = (typeof DURATIONS)[number];

export type SlotDraft = { date: string; start: string; duration: Duration };

export function emptySlot(): SlotDraft {
  return { date: "", start: "", duration: 30 };
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

// 종료 시각은 시작 + 산책 시간이다(같은 날 안에서만). 넘어가면 null.
export function endTime(start: string, duration: number): string | null {
  if (!/^\d{2}:\d{2}$/.test(start)) return null;
  const total = toMinutes(start) + duration;
  if (total >= 24 * 60) return null;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// 입력이 모자라거나 하루를 넘으면 문구, 아니면 서버에 보낼 값을 돌려준다. 날짜가 과거인지, 겹치는지는 BE가 검증한다.
export function slotToInput(draft: SlotDraft): { ok: true; slot: DateSlotInput } | { ok: false; message: string } {
  if (!draft.date || !draft.start) return { ok: false, message: "날짜와 시작 시간을 입력해 주세요." };
  const end = endTime(draft.start, draft.duration);
  if (!end) return { ok: false, message: "종료 시간이 자정을 넘지 않도록 시작 시간을 앞당겨 주세요." };
  return { ok: true, slot: { slot_date: draft.date, start_time: draft.start, end_time: end, duration_minutes: draft.duration } };
}
