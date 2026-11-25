// BE의 시각은 UTC ISO 8601이다. 화면에는 항상 한국 시간으로 보여 준다.
const KST = "Asia/Seoul";

export function kstParts(iso: string): { date: string; time: string } | null {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: KST, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(value);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

export function formatKst(iso: string | null | undefined): string {
  const parts = iso ? kstParts(iso) : null;
  return parts ? `${parts.date} ${parts.time}` : "-";
}

// "2026-11-13 10:00–11:00" (같은 날이 아니면 종료에도 날짜를 붙인다).
export function formatKstRange(startIso: string, endIso: string): string {
  const start = kstParts(startIso);
  const end = kstParts(endIso);
  if (!start || !end) return "-";
  return start.date === end.date
    ? `${start.date} ${start.time}–${end.time}`
    : `${start.date} ${start.time} – ${end.date} ${end.time}`;
}

// 코드 만료까지 남은 시간 "m:ss".
export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}
