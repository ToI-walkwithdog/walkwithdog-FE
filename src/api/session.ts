// 로그아웃할 때 지울 이 기기의 로그인 관련 상태와, 서버 로그아웃 호출.
import { clearOnboardingDraft } from "./onboardingDraft";
import { clearSignupDraft } from "./signupDraft";
import { api } from "./client";
import { clearBookingDraft } from "./bookingDraft";
import { invalidateBookingsCache, setSelectedBookingId } from "./myBookings";
import { clearToken } from "./tokenStorage";
import {
  clearPendingLevelWalks,
  invalidateHistoryCache,
  setLevelUpEvent,
  setResultWalkId,
  setSelectedHistoryItem,
} from "./walkResult";
import { clearWalkSession } from "./walkSession";
import { resetTracker } from "./walkTracker";

// POST /auth/logout. 이 토큰의 세션만 지운다(다른 기기의 세션은 그대로다). 이미 만료된 토큰이면 401이다.
// 본문은 {code, data:{}, message}이다.
export function logoutFromServer() {
  return api.post<Record<string, never>>("/auth/logout");
}

// 토큰, 산책 추적과 결과 상태, 예약과 이력 캐시, 임시 입력(가입, 온보딩, 예약 신청)을 지운다.
// 본 레벨업 목록(levelUpSeen)은 "계정 ID:이벤트 ID"로 계정별이라 지우지 않는다. 같은 계정이 다시 로그인해도
// 이미 본 레벨업을 되풀이하지 않기 위해서다.
export async function clearLocalSession(): Promise<void> {
  await clearToken();
  resetTracker();
  clearWalkSession();
  clearBookingDraft();
  clearSignupDraft();
  clearOnboardingDraft();
  setSelectedBookingId(null);
  invalidateBookingsCache();
  setResultWalkId(null);
  setSelectedHistoryItem(null);
  setLevelUpEvent(null);
  clearPendingLevelWalks();
  invalidateHistoryCache();
}
