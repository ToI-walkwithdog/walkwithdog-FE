// 서버 시각은 UTC ISO 8601이다. 화면에는 한국 표준시(KST, UTC+9)로 보여 준다.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// 반환한 Date는 get*이 아니라 getUTC*로 읽어야 KST 값이 된다.
function toKst(value: string | Date): Date {
  const time = typeof value === "string" ? Date.parse(value) : value.getTime();
  return new Date(time + KST_OFFSET_MS);
}

function two(value: number): string {
  return String(value).padStart(2, "0");
}

// "11월 12일"
export function formatSlotDate(iso: string): string {
  const kst = toKst(iso);
  return `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일`;
}

function clock(iso: string): string {
  const kst = toKst(iso);
  return `${two(kst.getUTCHours())}:${two(kst.getUTCMinutes())}`;
}

// "13:00~14:00"
export function formatSlotTime(startIso: string, endIso: string): string {
  return `${clock(startIso)}~${clock(endIso)}`;
}

// "11.12."
export function formatMonthDay(iso: string): string {
  const kst = toKst(iso);
  return `${kst.getUTCMonth() + 1}.${kst.getUTCDate()}.`;
}

// "Friday  May 9, 2026" (요일 뒤 공백 두 칸은 기존 홈 화면 표기와 같다)
export function formatHomeDate(now: Date = new Date()): string {
  const kst = toKst(now);
  return `${WEEKDAYS[kst.getUTCDay()]}  ${MONTHS[kst.getUTCMonth()]} ${kst.getUTCDate()}, ${kst.getUTCFullYear()}`;
}

const KOREAN_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// "2026.11.25 (수) 오후 5:44" (산책 기록 날짜 줄)
export function formatWalkDateTime(iso: string): string {
  const kst = toKst(iso);
  const hour24 = kst.getUTCHours();
  const period = hour24 < 12 ? "오전" : "오후";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${kst.getUTCFullYear()}.${two(kst.getUTCMonth() + 1)}.${two(kst.getUTCDate())} (${KOREAN_WEEKDAYS[kst.getUTCDay()]}) ${period} ${hour12}:${two(kst.getUTCMinutes())}`;
}
