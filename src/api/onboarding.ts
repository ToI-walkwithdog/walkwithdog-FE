import { api, type ApiResult } from "./client";
import { routeForStep, routeFromServer, type AppRoute } from "./auth";

// --- Step 1: 기본 정보 (2-2) ---

export type BasicInfoRead = {
  step1_completed: boolean;
  next_step: string | null;
};

export type PhoneVerificationSent = {
  verification_id: string;
  expires_in_seconds: number;
  resend_after_seconds: number;
};

export type BasicInfoBody = {
  full_name: string;
  birth_date: string; // YYYY-MM-DD
  phone_verification_id: string;
};

export function fetchBasicInfo() {
  return api.get<BasicInfoRead>("/users/me/onboarding/basic-info");
}

export function sendPhoneVerification(phoneNumber: string) {
  return api.post<PhoneVerificationSent>("/users/me/phone-verifications", {
    phone_number: phoneNumber,
  });
}

export function confirmPhoneVerification(verificationId: string, code: string) {
  return api.post<{ verified: boolean; verified_at: string }>(
    "/users/me/phone-verifications/confirm",
    { verification_id: verificationId, code },
  );
}

export function saveBasicInfo(body: BasicInfoBody) {
  return api.put<BasicInfoRead>("/users/me/onboarding/basic-info", body);
}

// --- Step 2: 반려견 경험 (2-3, 2-4) ---

export type DogExperienceRead = {
  step2_completed: boolean;
  next_onboarding_step: string | null;
};

// 경험 없음이면 has_experience만 보낸다(세부 항목을 같이 보내면 422).
export type DogExperienceBody =
  | { has_experience: false }
  | {
      has_experience: true;
      experienced_breeds_text: string;
      dog_size_code: string;
      walking_frequency: string;
      perceived_difficulty: string;
      challenge_codes: string[];
    };

export function fetchDogExperience() {
  return api.get<DogExperienceRead>("/users/me/onboarding/dog-experience");
}

export function saveDogExperience(body: DogExperienceBody) {
  return api.put<DogExperienceRead>(
    "/users/me/onboarding/dog-experience",
    body,
  );
}

// --- Step 3: 산책 루틴 (2-5) ---

export type WalkingRoutineRead = {
  step3_completed: boolean;
  // 완료 전에는 null. region_codes는 코드만 있고 이름은 없다.
  routine: { region_codes: string[] } | null;
  next_onboarding_step: string | null;
};

export type WalkingRoutineBody = {
  region_codes: string[];
  available_time_slot_codes: string[];
  walking_duration_code: string;
  comfortable_dog_size_code: string;
  agreements: {
    terms: { document_version: string; agreed: boolean };
    privacy: { document_version: string; agreed: boolean };
  };
};

export function fetchWalkingRoutine() {
  return api.get<WalkingRoutineRead>("/users/me/onboarding/walking-routine");
}

export function saveWalkingRoutine(body: WalkingRoutineBody) {
  return api.put<WalkingRoutineRead>(
    "/users/me/onboarding/walking-routine",
    body,
  );
}

export function fetchPolicyVersion(kind: "terms" | "privacy") {
  return api.get<{ document_version: string }>(`/policies/${kind}`, {
    auth: false,
  });
}

// --- 지역 (2-5 선택 UI가 생기면 사용) ---

export type RegionItem = { region_code: string; region_name: string };
export type SigunguItem = RegionItem & { sido_code: string };

export function fetchSido() {
  return api.get<{ regions: RegionItem[] }>("/regions/sido", { auth: false });
}

export function fetchSigungu(sidoCode: string) {
  return api.get<{ sido_code: string; regions: SigunguItem[] }>(
    `/regions/sigungu?sido_code=${encodeURIComponent(sidoCode)}`,
    { auth: false },
  );
}

// --- 위치 (2-6) ---

export type ResolvedRegion = {
  sido_code: string;
  sido_name: string;
  region_code: string;
  region_name: string;
};

export function resolveLocation(latitude: number, longitude: number) {
  return api.post<{ region: ResolvedRegion }>("/regions/resolve-location", {
    latitude,
    longitude,
  });
}

// --- 재진입 ---

export type EntryRoute = AppRoute | "/1-2";

// 화면 진입 시 서버 상태로 이동할 곳을 정한다. 그 화면에 머물러야 하면 null.
// 완료된 단계는 다음 단계로, 이전 단계가 남았으면 그 단계로, 401이면 로그인으로 보낸다.
async function entryRoute<T>(
  res: ApiResult<T>,
  completed: (data: T) => boolean,
  next: (data: T) => string | null,
): Promise<EntryRoute | null> {
  if (!res.ok) {
    if (res.status === 401) return "/1-2";
    if (
      res.code === "PREVIOUS_STEP_NOT_COMPLETED" ||
      res.code === "AGE_REVIEW_REQUIRED" ||
      res.code === "ONBOARDING_NOT_ALLOWED"
    ) {
      return routeFromServer();
    }
    return null;
  }
  return completed(res.data) ? routeForStep(next(res.data)) : null;
}

export async function entryRouteForBasicInfo() {
  return entryRoute(
    await fetchBasicInfo(),
    (data) => data.step1_completed,
    (data) => data.next_step,
  );
}

export async function entryRouteForDogExperience() {
  return entryRoute(
    await fetchDogExperience(),
    (data) => data.step2_completed,
    (data) => data.next_onboarding_step,
  );
}

export async function entryRouteForWalkingRoutine() {
  return entryRoute(
    await fetchWalkingRoutine(),
    (data) => data.step3_completed,
    (data) => data.next_onboarding_step,
  );
}
