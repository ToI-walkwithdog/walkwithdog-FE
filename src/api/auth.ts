import { api, type ApiFailure, type ApiResult } from "./client";
import { saveToken } from "./tokenStorage";

export type NextOnboardingStep =
  | "AGE_REVIEW"
  | "PLEDGE"
  | "BASIC_INFORMATION"
  | "PET_EXPERIENCE"
  | "WALKING_ROUTINE"
  | null;

export type Me = {
  nickname: string;
  role: string;
  next_onboarding_step: NextOnboardingStep;
  current_pledge_version: string | null;
};

type LoginData = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export async function login(
  identifier: string,
  password: string,
): Promise<ApiResult<LoginData>> {
  const res = await api.post<LoginData>(
    "/auth/login",
    { identifier, password },
    { auth: false },
  );
  if (res.ok) await saveToken(res.data.access_token);
  return res;
}

export function fetchMe(): Promise<ApiResult<Me>> {
  return api.get<Me>("/users/me");
}

export type AppRoute =
  | "/1-6"
  | "/2-2"
  | "/2-3"
  | "/2-5"
  | "/2-age-review"
  | "/3";

// 단계 값으로 진입할 라우트를 정한다. 이동할 수 없으면 null(현재 화면 유지).
export function routeForStep(
  step: string | null,
  role: string = "USER",
): AppRoute | null {
  switch (step) {
    case "PLEDGE":
      return "/1-6";
    case "BASIC_INFORMATION":
      return "/2-2";
    case "PET_EXPERIENCE":
      return "/2-3";
    case "WALKING_ROUTINE":
      return "/2-5";
    case null:
      // 보호소/관리자 계정도 null이므로 USER만 홈으로 보낸다.
      return role === "USER" ? "/3" : null;
    case "AGE_REVIEW":
      return "/2-age-review";
    default:
      return null;
  }
}

export function routeForOnboarding(me: Me) {
  return routeForStep(me.next_onboarding_step, me.role);
}

// 서버의 현재 온보딩 상태(GET /users/me)로 이동할 라우트를 정한다.
export async function routeFromServer(): Promise<AppRoute | null> {
  const me = await fetchMe();
  return me.ok ? routeForOnboarding(me.data) : null;
}

// 어느 화면에서든 실패 응답이 로그인이나 온보딩으로 보내야 하는 경우인지 정한다.
// 401은 클라이언트가 토큰을 지운 뒤이므로 로그인으로, 온보딩 미완료와 나이 확인 대기는
// 서버의 현재 단계로 보낸다. 이동할 곳이 없으면 null(현재 화면에서 오류 안내).
export async function routeForFailure(
  failure: ApiFailure,
): Promise<AppRoute | "/1-2" | null> {
  if (failure.status === 401) return "/1-2";
  if (
    failure.code === "ONBOARDING_NOT_COMPLETED" ||
    failure.code === "AGE_REVIEW_REQUIRED"
  ) {
    return routeFromServer();
  }
  // detail이 문자열인 403에는 code가 없다. 문구를 읽지 않고, 나이 확인 대기 계정인지는
  // GET /users/me의 계정 상태로만 판단한다. 그 밖의 403(남의 예약 등)은 현재 화면에서 안내한다.
  if (failure.status === 403 && failure.code === null) {
    const me = await fetchMe();
    if (me.ok && me.data.next_onboarding_step === "AGE_REVIEW") {
      return "/2-age-review";
    }
  }
  return null;
}
