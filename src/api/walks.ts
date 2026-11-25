import { api } from "./client";

// GET /walks/active (ActiveWalkResponse). 이번 단계에서는 존재 여부와 예약 ID만 쓴다.
export type ActiveWalk = {
  walk_id: number;
  walk_request_id: number;
  started_at: string;
};

// 진행 중인 산책이 없으면 404 {detail}(code 없음)이다.
export function fetchActiveWalk() {
  return api.get<ActiveWalk>("/walks/active");
}

// GET /walks/history 항목(WalkHistoryItem 중 홈에서 쓰는 필드). 거리는 Decimal이라 문자열일 수 있다.
export type WalkHistoryItem = {
  walk_id: number;
  walk_request_id: number;
  dog: { id: number; name: string };
  status: "COMPLETED" | "INTERRUPTED";
  started_at: string;
  total_distance_m: string | number | null;
  shelter_name: string | null;
};

export type WalkHistory = {
  total: number;
  limit: number;
  offset: number;
  walks: WalkHistoryItem[];
};

// 시작 시각 최신순이다.
export function fetchWalkHistory(limit = 20, offset = 0) {
  return api.get<WalkHistory>(`/walks/history?limit=${limit}&offset=${offset}`);
}
