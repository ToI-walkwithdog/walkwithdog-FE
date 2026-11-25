import { api } from "./client";

// GET /volunteers/me. 본문 그대로다. Decimal은 문자열로 올 수 있다.
// total_*은 통계에 들어가는(COMPLETED) 산책의 합계이고, history_*는 종료한 모든 산책 기준이다.
export type VolunteerMe = {
  user_id: number;
  level: number;
  total_walk_count: number;
  total_distance_m: string | number;
  total_duration_seconds: number;
  unique_dog_count: number;
  history_walk_count: number;
  history_distance_m: string | number;
  history_unique_dog_count: number;
  history_distance_missing_count: number;
  history_distance_is_complete: boolean;
};

export function fetchVolunteerMe() {
  return api.get<VolunteerMe>("/volunteers/me");
}
