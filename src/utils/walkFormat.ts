// 서버가 확정한 산책 통계를 화면 문구로 바꾼다. Decimal은 문자열로 올 수 있다.

export function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function two(value: number) {
  return String(value).padStart(2, "0");
}

// "32m 15s" (인계 화면). 1시간 이상은 "1h 02m 15s". 값이 없으면 "-".
export function formatDurationLong(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "-";
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  if (hours > 0) return `${hours}h ${two(minutes)}m ${two(rest)}s`;
  return `${minutes}m ${two(rest)}s`;
}

// "32:15" (기록 화면). 1시간 이상은 "1:02:15". 값이 없으면 "-".
export function formatDurationClock(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "-";
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  return hours > 0 ? `${hours}:${two(minutes)}:${two(rest)}` : `${two(minutes)}:${two(rest)}`;
}

// 미터를 km 소수 한 자리 숫자 문자열로. 값이 없으면 "-".
export function formatKm(meters: string | number | null | undefined): string {
  const value = toNumber(meters);
  return value === null ? "-" : (value / 1000).toFixed(1);
}

// 서버의 average_pace(초/km, 이동 시간 기준)를 km/h로. 이동 근거가 없어 null이면 "-".
export function paceToKmh(pace: string | number | null | undefined): string {
  const value = toNumber(pace);
  return value === null || value <= 0 ? "-" : (3600 / value).toFixed(1);
}
