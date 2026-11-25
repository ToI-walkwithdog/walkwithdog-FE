import { api } from "./client";

// GET /walks/active (ActiveWalkResponse). 본문 그대로다. Decimal은 문자열로 올 수 있다.
export type ActiveWalk = {
  walk_id: number;
  walk_request_id: number;
  started_at: string;
  planned_duration_minutes: number | null;
  expected_end_at: string | null;
  is_overdue: boolean;
  overdue_minutes: number;
  last_latitude: string | number | null;
  last_longitude: string | number | null;
  last_accuracy_m: string | number | null;
  last_point_recorded_at: string | null;
  last_point_received_at: string | null;
  // 이 시각을 지나면(초과 시점부터) 서버가 무수신으로 자동 종료한다.
  auto_end_at: string;
  last_sequence_no: number | null;
  elapsed_seconds: number;
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

// POST /walks, PATCH /walks/{id}/end 응답(WalkResponse 중 쓰는 필드). 본문 그대로다.
export type Walk = {
  id: number;
  walk_request_id: number;
  status: "IN_PROGRESS" | "COMPLETED" | "INTERRUPTED" | "CANCELLED";
  started_at: string;
  ended_at: string | null;
  total_distance_m: string | number | null;
  duration_seconds: number | null;
  average_pace: string | number | null;
  end_reason: "USER" | "STAFF" | "AUTO_TIMEOUT" | null;
  planned_duration_minutes: number | null;
  expected_end_at: string | null;
};

// 보호소 코드를 확인한 예약으로 산책을 시작한다. 409는 detail.code로 나눈다(WALK_START_*).
export function startWalk(walkRequestId: number) {
  return api.post<Walk>("/walks", { walk_request_id: walkRequestId });
}

export type WalkPointBody = {
  sequence_no: number;
  latitude: number;
  longitude: number;
  recorded_at: string;
  accuracy_m: number | null;
};

// POST /walks/{id}/points. 순번은 0부터 연속이어야 하고, 같은 순번과 내용의 재전송은 무시된다.
export type PointsReceipt = {
  walk_id: number;
  accepted_count: number;
  duplicate_count: number;
  last_sequence_no: number;
};

export function postWalkPoints(walkId: number, points: WalkPointBody[]) {
  return api.post<PointsReceipt>(`/walks/${walkId}/points`, { points });
}

export type MarkerType =
  | "POOP"
  | "CROSSWALK_WAIT"
  | "SNIFF"
  | "OTHER"
  | "DOG_ENCOUNTER"
  | "PERSON_ENCOUNTER"
  | "BARKING";

export type WalkMarkerBody = {
  marker_type: MarkerType;
  memo?: string;
  latitude?: number;
  longitude?: number;
  accuracy_m?: number;
  recorded_at: string;
  position_recorded_at?: string;
  // 실제 탭마다 하나. 같은 키와 같은 본문의 재전송은 200과 기존 마커다.
  client_marker_id: string;
};

// 201(새로 저장) 또는 200(같은 키 재전송). 위치가 없으면 409 detail.code=MARKER_LOCATION_UNAVAILABLE.
export function postWalkMarker(walkId: number, body: WalkMarkerBody) {
  return api.post<{ id: number }>(`/walks/${walkId}/markers`, body);
}

export type IncidentType =
  | "INJURY"
  | "LOST_DOG"
  | "SAFETY_THREAT"
  | "OTHER"
  | "POOP_NO_BAG"
  | "ATE_FOREIGN_OBJECT"
  | "ABNORMAL_BEHAVIOR";

export type WalkIncidentBody = {
  incident_type: IncidentType;
  // OTHER는 필수(1~1,000자). 나머지는 생략하면 서버가 유형 이름을 쓴다.
  description?: string;
  latitude?: number;
  longitude?: number;
  occurred_at: string;
  // 신고 한 건마다 하나(최대 36자). 같은 키와 같은 내용의 재전송은 200과 기존 신고다.
  client_report_id: string;
  // 최근 같은 유형의 신고가 있으면 409 DUPLICATE_RECENT. 사용자가 확인하면 true로 다시 보낸다.
  confirm_duplicate?: boolean;
};

export function postWalkIncident(walkId: number, body: WalkIncidentBody) {
  return api.post<{ id: number }>(`/walks/${walkId}/incidents`, body);
}

// 종료한 산책의 최종 통계는 응답의 total_distance_m, duration_seconds, average_pace다.
export function endWalk(walkId: number) {
  return api.patch<Walk>(`/walks/${walkId}/end`, { status: "COMPLETED" });
}

// GET /walks/{id}. 좌표 목록은 필요 없으니 limit=1로 요청한다. 종료 상태와 end_reason을 읽을 때 쓴다.
// 남의 산책은 403, 없는 산책은 404이고 둘 다 detail이 문자열이라 code가 없다.
export type WalkDetail = {
  walk: Walk;
  point_count: number;
};

export function fetchWalkDetail(walkId: number) {
  return api.get<WalkDetail>(`/walks/${walkId}?limit=1&offset=0`);
}
