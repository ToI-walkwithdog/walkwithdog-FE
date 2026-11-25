import { api, retryAfterSeconds, type ApiFailure, type ApiResult } from "./client";
import { errorMessage } from "./errorMessages";
import { clearToken, saveToken } from "./tokenStorage";

export type Me = {
  nickname: string;
  role: string;
  shelter_id: number | string | null;
};

type LoginData = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

// BE가 role을 소문자("user", "shelter", "admin")로 주므로 비교하는 쪽은 항상 이 값을 쓴다(앱의 normalizeRole과 같다).
export function normalizeRole(role: string | null | undefined): string {
  return (role ?? "").trim().toUpperCase();
}

export async function fetchMe(): Promise<ApiResult<Me>> {
  const res = await api.get<Me>("/users/me");
  return res.ok ? { ...res, data: { ...res.data, role: normalizeRole(res.data.role) } } : res;
}

// POST /auth/logout. 이 토큰의 세션만 지우며, 두 번째 호출은 401이므로 다시 시도하지 않는다.
export function logoutFromServer() {
  return api.post<Record<string, never>>("/auth/logout");
}

// 보호소 담당 계정만 들어올 수 있다: role SHELTER이고 shelter_id가 있어야 한다.
export function shelterGateFailure(me: Me): "ROLE" | "NO_SHELTER" | null {
  if (normalizeRole(me.role) !== "SHELTER") return "ROLE";
  if (me.shelter_id === null || me.shelter_id === undefined) return "NO_SHELTER";
  return null;
}

export type SignInResult =
  | { ok: true; me: Me }
  | { ok: false; kind: "API"; failure: ApiFailure }
  | { ok: false; kind: "ROLE" }
  | { ok: false; kind: "NO_SHELTER" };

// 로그인 → GET /users/me → 역할 확인. 들어올 수 없는 계정이면 서버 로그아웃과 토큰 삭제를 한 번만 하고 돌려보낸다.
export async function signInAsShelter(identifier: string, password: string): Promise<SignInResult> {
  const res = await api.post<LoginData>("/auth/login", { identifier, password }, { auth: false });
  if (!res.ok) return { ok: false, kind: "API", failure: res };
  saveToken(res.data.access_token);

  const me = await fetchMe();
  if (!me.ok) {
    await dropSession();
    return { ok: false, kind: "API", failure: me };
  }
  const gate = shelterGateFailure(me.data);
  if (gate) {
    await dropSession();
    return { ok: false, kind: gate };
  }
  return { ok: true, me: me.data };
}

// 서버 로그아웃은 결과와 상관없이 한 번만 부르고, 로컬 토큰은 항상 지운다.
export async function dropSession(): Promise<void> {
  try {
    await logoutFromServer();
  } finally {
    clearToken();
  }
}

export function signInErrorMessage(result: Exclude<SignInResult, { ok: true }>): string {
  if (result.kind === "ROLE") {
    return "보호소 계정으로만 이용할 수 있어요. 봉사자와 관리자 계정은 이 화면에 들어올 수 없어요.";
  }
  if (result.kind === "NO_SHELTER") {
    return "이 계정은 아직 담당 보호소에 연결되지 않았어요. 관리자에게 보호소 연결을 요청해 주세요.";
  }
  const failure = result.failure;
  if (failure.code === "NETWORK_ERROR") {
    return "서버에 연결할 수 없어요. 서버가 켜져 있는지, 주소가 http://localhost:3000 인지 확인해 주세요.";
  }
  if (failure.status === 429) {
    const wait = retryAfterSeconds(failure);
    return wait
      ? `로그인 시도가 너무 많아요. ${wait}초 뒤에 다시 시도해 주세요.`
      : "로그인 시도가 너무 많아요. 잠시 뒤에 다시 시도해 주세요.";
  }
  if (failure.status === 401) return "아이디 또는 비밀번호가 맞지 않아요.";
  if (failure.status === 409) return "다른 작업과 겹쳤어요. 잠시 뒤에 다시 시도해 주세요.";
  return errorMessage(failure.code);
}
