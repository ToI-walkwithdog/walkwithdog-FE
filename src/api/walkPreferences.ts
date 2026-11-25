import { api } from "./client";

export type DurationCode = "UP_TO_30_MIN" | "BETWEEN_30_AND_60_MIN" | "OVER_60_MIN";
export type SizeCode = "SMALL" | "MEDIUM" | "LARGE";

// GET /users/me/walk-preferences. 본문은 {code, data, message}이고 data만 돌려받는다.
// effective_preferences는 저장한 선호, 온보딩 Step 3 값, null 순으로 적용된 값이다.
// 미설정이면 configured=false, version=0이다. 지역은 BE가 지원하지 않는다(보내면 422).
export type WalkPreferences = {
  configured: boolean;
  version: number;
  effective_preferences: {
    duration_code: DurationCode | null;
    size_code: SizeCode | null;
  };
};

export function fetchWalkPreferences() {
  return api.get<WalkPreferences>("/users/me/walk-preferences");
}

// PATCH /users/me/walk-preferences. expected_version은 필수(처음은 0)이고, duration_code나 size_code가 하나 이상 있어야 한다.
// 값이 같아도 버전이 다르면 409 PREFERENCE_VERSION_MISMATCH다. 바뀐 것이 없으면 200이고 버전은 그대로다.
export type WalkPreferencesPatch = {
  expected_version: number;
  duration_code?: DurationCode;
  size_code?: SizeCode;
};

export function patchWalkPreferences(body: WalkPreferencesPatch) {
  return api.patch<WalkPreferences & { changed_fields: string[] }>(
    "/users/me/walk-preferences",
    body,
  );
}

export const DURATION_LABELS: Record<DurationCode, string> = {
  UP_TO_30_MIN: "30분 이내",
  BETWEEN_30_AND_60_MIN: "30분 ~ 1시간",
  OVER_60_MIN: "1시간 이상",
};

export const DURATION_OPTIONS: DurationCode[] = [
  "UP_TO_30_MIN",
  "BETWEEN_30_AND_60_MIN",
  "OVER_60_MIN",
];
