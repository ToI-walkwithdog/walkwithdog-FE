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

export type HandoverStatus = "NOT_REQUIRED" | "NOT_CONFIRMED" | "SELF_REPORTED" | "ISSUE_REPORTED";

// GET /walks/history 항목(WalkHistoryItem). 거리는 Decimal이라 문자열일 수 있다.
// 종료한 산책(COMPLETED, INTERRUPTED)만 오고, 자동 종료는 COMPLETED + end_reason AUTO_TIMEOUT이다.
export type WalkHistoryItem = {
  walk_id: number;
  walk_request_id: number;
  dog: { id: number; name: string; image_url?: string | null };
  status: "COMPLETED" | "INTERRUPTED";
  end_reason: "USER" | "STAFF" | "AUTO_TIMEOUT" | null;
  started_at: string;
  ended_at: string | null;
  total_distance_m: string | number | null;
  duration_seconds: number | null;
  handover_status: HandoverStatus;
  shelter_name: string | null;
  // 통계에 들어가는 산책(COMPLETED)인지.
  counted_as_volunteer_record: boolean;
};

export type WalkHistory = {
  total: number;
  limit: number;
  offset: number;
  walks: WalkHistoryItem[];
};

// 시작 시각 최신순이다. 응답에 total이 있지만 마지막 페이지 판단은 예약 목록과 같이 limit보다 적게 오는지로 한다.
// handoverStatus=NOT_CONFIRMED는 인계를 아직 접수하지 않은 산책만 돌려준다.
export function fetchWalkHistory(
  limit = 20,
  offset = 0,
  handoverStatus?: "NOT_CONFIRMED",
) {
  const extra = handoverStatus ? `&handover_status=${handoverStatus}` : "";
  return api.get<WalkHistory>(`/walks/history?limit=${limit}&offset=${offset}${extra}`);
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

// GET /walks/{id}. 좌표와 마커, 신고가 같은 limit/offset으로 함께 나뉘어 온다(limit 1~500).
// 종료 상태와 end_reason을 읽을 때는 limit=1, 경로를 그릴 때는 좌표를 500개씩 나눠 받는다.
// 남의 산책은 403, 없는 산책은 404이고 둘 다 detail이 문자열이라 code가 없다.
export type WalkDetailPoint = {
  sequence_no: number;
  latitude: string | number;
  longitude: string | number;
  recorded_at: string;
  accuracy_m: string | number | null;
};

export type WalkDetail = {
  walk: Walk;
  handover_status: HandoverStatus;
  point_count: number;
  points: WalkDetailPoint[];
  // 마커는 좌표와 같은 limit/offset으로 나뉘어 매 페이지에 되풀이된다. 응답에 client_marker_id는 없다.
  markers?: {
    id: number;
    marker_type: MarkerType;
    latitude: string | number;
    longitude: string | number;
    memo: string | null;
  }[];
};

export function fetchWalkDetail(walkId: number, limit = 1, offset = 0) {
  return api.get<WalkDetail>(`/walks/${walkId}?limit=${limit}&offset=${offset}`);
}

// POST /walks/{id}/handover. 201(새로 접수) 또는 200(같은 내용 재전송).
// 같은 산책에 다른 내용을 보내면 409, 중단된 산책의 정상 인계는 409, 자동 종료 산책의 정상 인계에
// acknowledge_auto_timeout이 없으면 422다(모두 detail이 문자열이라 code가 없다).
// 재시도는 처음과 같은 본문으로 보낸다(모든 필드가 같아야 200이다).
export type WalkHandoverBody = {
  handover_result: "COMPLETE" | "ISSUE";
  dog_returned: boolean;
  equipment_returned: boolean;
  condition_shared: boolean;
  acknowledge_auto_timeout: boolean;
  // ISSUE는 필수(trim 후 1~500자), COMPLETE는 보내지 않는다.
  issue_description?: string;
};

export type WalkHandoverReceipt = {
  walk_id: number;
  handover_status: "SELF_REPORTED" | "ISSUE_REPORTED";
};

export function postWalkHandover(walkId: number, body: WalkHandoverBody) {
  return api.post<WalkHandoverReceipt>(`/walks/${walkId}/handover`, body);
}

// PUT /walks/{id}/private-memo. 메모는 trim 후 1~1,000자이고 비울 수 없다.
// 인계를 접수한 종료 산책만 저장한다. expected_version은 저장된 메모의 version(없으면 0)이다.
// 저장된 메모와 같은 내용이면 버전과 상관없이 200이라 재전송이 안전하다. 버전이 다르면 409다.
export type WalkPrivateMemo = {
  memo: string;
  version: number;
  created_at: string;
  updated_at: string;
};

export function putWalkPrivateMemo(walkId: number, memo: string, expectedVersion: number) {
  return api.put<WalkPrivateMemo & { walk_id: number }>(`/walks/${walkId}/private-memo`, {
    memo,
    expected_version: expectedVersion,
  });
}

export type LevelEvaluationStatus = "NOT_ELIGIBLE" | "PENDING" | "COMPLETED" | "FAILED";

export type WalkSummaryMarker = {
  id: number;
  marker_type: MarkerType;
  latitude: string | number;
  longitude: string | number;
  recorded_at: string;
  memo: string | null;
  location_source: string;
};

// GET /walks/{id}/summary. 종료한 본인 산책만(아니면 409, 남의 산책 403, 없으면 404).
// points에는 시각이 없고 2,000개를 넘으면 솎아서 오므로 경로(간격 구분)에는 GET /walks/{id}를 쓴다.
export type WalkSummary = {
  walk: { id: number; status: Walk["status"]; started_at: string; ended_at: string | null };
  handover_status: HandoverStatus;
  private_memo: WalkPrivateMemo | null;
  level_evaluation_status: LevelEvaluationStatus;
  level_up_event: {
    event_id: number;
    before_level: number;
    after_level: number;
    policy_version: string;
    earned_at: string;
  } | null;
  summary: {
    duration_seconds: number | null;
    total_distance_m: string | number | null;
    marker_count: number;
  };
  points_total: number;
  markers: WalkSummaryMarker[];
  shelter_link: string | null;
};

export function fetchWalkSummary(walkId: number) {
  return api.get<WalkSummary>(`/walks/${walkId}/summary`);
}
