// 종료한 산책의 실제 경로를 서버에서 받아 구간(segment)으로 나눈다.
// GET /walks/{id}는 좌표에 recorded_at, sequence_no, accuracy_m이 있다(요약의 points에는 없다).
// 좌표는 limit=500, offset을 서버가 돌려준 개수만큼 올려 point_count까지 모두 읽는다.
// 마커와 신고는 같은 limit/offset으로 따로 나뉘어 매 페이지에 되풀이되므로 여기서 읽지 않고 요약에서만 가져온다.
import type { ApiResult } from "./client";
import { fetchWalkDetail } from "./walks";
import { toNumber } from "../utils/walkFormat";

// 아래 세 값은 서버의 실제 이동 분석(app/gps_motion_config.py, MotionConfig V1)과 같다.
// - ROUTE_MAX_GAP_SECONDS = max_gap_seconds(15): 이보다 긴 간격의 두 좌표는 이동 근거로 쓰지 않는다.
// - ROUTE_MAX_ACCURACY_M  = max_accuracy_m(20.0): 정확도가 없거나 이보다 나쁜 좌표는 근거로 쓰지 않는다.
// - ROUTE_MAX_SPEED_M_S   = MAX_SPEED_M_S(5.0): 이보다 빠른 이동은 위치 튐으로 보고 잇지 않는다.
// 참고: 서버의 총 거리(total_distance_m)에서만 쓰는 별개 기준이 있다(app/walk_service.py의
// MAX_DISTANCE_GAP_SECONDS = 300초, MAX_ACCURACY_M = 50m). 그 값으로 경로를 끊으면 안 된다.
export const ROUTE_MAX_GAP_SECONDS = 15;
export const ROUTE_MAX_ACCURACY_M = 20;
export const ROUTE_MAX_SPEED_M_S = 5;

const PAGE_SIZE = 500;
const MAX_PAGES = 20;

export type RoutePoint = { latitude: number; longitude: number };

export type WalkRoute = {
  // 끊김 없이 이어진 구간들. 구간 사이에는 선을 긋지 않는다.
  segments: RoutePoint[][];
  pointCount: number;
  // 정확도가 나빠 그리지 않은 좌표 수.
  skippedCount: number;
  // 좌표가 너무 많아 일부만 받았다.
  truncated: boolean;
};

function distanceM(a: RoutePoint, b: RoutePoint): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export async function loadWalkRoute(walkId: number): Promise<ApiResult<WalkRoute>> {
  const segments: RoutePoint[][] = [];
  let current: RoutePoint[] = [];
  // 이전 좌표의 정보는 페이지가 바뀌어도 이어서 쓴다(페이지 경계에서도 같은 검사를 한다).
  let previous: { point: RoutePoint; at: number; sequence: number } | null = null;
  let offset = 0;
  let total = 0;
  let received = 0;
  let skipped = 0;
  let status = 200;

  const breakSegment = () => {
    if (current.length > 0) segments.push(current);
    current = [];
    previous = null;
  };

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await fetchWalkDetail(walkId, PAGE_SIZE, offset);
    if (!result.ok) return result;
    status = result.status;
    total = result.data.point_count;
    const points = result.data.points;
    for (const raw of points) {
      const latitude = toNumber(raw.latitude);
      const longitude = toNumber(raw.longitude);
      const accuracy = toNumber(raw.accuracy_m);
      const at = Date.parse(raw.recorded_at);
      if (latitude === null || longitude === null || Number.isNaN(at)) {
        breakSegment();
        continue;
      }
      // 정확도가 없거나 나쁜 좌표는 그리지 않고, 그 앞뒤를 선으로 잇지도 않는다.
      if (accuracy === null || accuracy < 0 || accuracy > ROUTE_MAX_ACCURACY_M) {
        skipped += 1;
        breakSegment();
        continue;
      }
      const point = { latitude, longitude };
      if (previous !== null) {
        const seconds = (at - previous.at) / 1000;
        const consecutive = raw.sequence_no === previous.sequence + 1;
        // 간격이 길거나, 순번이 이어지지 않거나, 시각이 늘지 않거나, 속도가 비정상이면 선을 잇지 않는다.
        if (
          !consecutive ||
          seconds <= 0 ||
          seconds > ROUTE_MAX_GAP_SECONDS ||
          distanceM(previous.point, point) / seconds > ROUTE_MAX_SPEED_M_S
        ) {
          breakSegment();
        }
      }
      current.push(point);
      previous = { point, at, sequence: raw.sequence_no };
    }
    // offset은 서버가 돌려준 원본 개수만큼 올린다.
    received += points.length;
    offset += points.length;
    if (points.length === 0 || offset >= total) break;
  }
  if (current.length > 0) segments.push(current);
  return {
    ok: true,
    status,
    data: { segments, pointCount: total, skippedCount: skipped, truncated: received < total },
  };
}
