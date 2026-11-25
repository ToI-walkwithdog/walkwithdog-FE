import type { ApiFailure } from "./client";
import { errorMessage } from "./errorMessages";

const LOCK_RETRY = "다른 작업과 겹쳤어요. 잠시 뒤에 다시 시도해 주세요.";

// 화면에 보여 줄 한국어 문구. 자동 재시도는 하지 않는다.
// serverText가 true면 BE가 준 문장(message)이 있을 때 그대로 보여 준다(일정의 날짜, 겹침 검증 등).
export function failureText(failure: ApiFailure, serverText = false): string {
  if (failure.status === 0 || failure.code === "INVALID_RESPONSE") return errorMessage(failure.code);
  if (failure.status === 401) return errorMessage("SESSION_EXPIRED");
  if (failure.status === 403) return "이 보호소의 정보만 다룰 수 있어요.";
  if (serverText && failure.message) return failure.message;
  if (failure.status === 409) return LOCK_RETRY;
  if (failure.status === 404) return "찾을 수 없어요. 목록을 새로 불러와 주세요.";
  return errorMessage(failure.code);
}

// 422의 detail 목록({loc, msg})을 입력칸 이름별 문구로 바꾼다. loc의 마지막 값을 칸 이름으로 쓴다.
export function fieldErrors(failure: ApiFailure): Record<string, string> {
  const result: Record<string, string> = {};
  if (failure.status !== 422 || !Array.isArray(failure.data)) return result;
  for (const item of failure.data) {
    if (typeof item !== "object" || item === null) continue;
    const loc: unknown = (item as { loc?: unknown }).loc;
    const msg: unknown = (item as { msg?: unknown }).msg;
    if (!Array.isArray(loc) || loc.length === 0) continue;
    const field = String(loc[loc.length - 1]);
    if (!(field in result)) result[field] = typeof msg === "string" ? `값을 확인해 주세요. (${msg})` : "값을 확인해 주세요.";
  }
  return result;
}
