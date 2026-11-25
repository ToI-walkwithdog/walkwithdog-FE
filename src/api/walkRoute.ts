// 종료한 산책의 실제 경로를 서버에서 받아 구간(segment)으로 나눈다.
// GET /walks/{id}는 좌표에 recorded_at이 있어 정지·재개 사이의 간격을 알 수 있다(요약의 points에는 시각이 없다).
import type { ApiResult } from "./client";
import { fetchWalkDetail } from "./walks";
import { toNumber } from "../utils/walkFormat";

// 이보다 긴 시간 간격의 두 좌표는 잇지 않는다. 서버도 이 구간의 거리를 통계에서 뺀다(300초).
export const ROUTE_GAP_SECONDS = 300;
const PAGE_SIZE = 500;
const MAX_PAGES = 20;

export type RoutePoint = { latitude: number; longitude: number };

export type WalkRoute = {
  // 시간 간격이 없는 연속 구간들. 구간 사이에는 선을 긋지 않는다.
  segments: RoutePoint[][];
  pointCount: number;
  // 좌표가 너무 많아 일부만 받았다.
  truncated: boolean;
};

export async function loadWalkRoute(walkId: number): Promise<ApiResult<WalkRoute>> {
  const segments: RoutePoint[][] = [];
  let current: RoutePoint[] = [];
  let previousAt: number | null = null;
  let offset = 0;
  let total = 0;
  let received = 0;
  let status = 200;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await fetchWalkDetail(walkId, PAGE_SIZE, offset);
    if (!result.ok) return result;
    status = result.status;
    total = result.data.point_count;
    const points = result.data.points;
    for (const point of points) {
      const latitude = toNumber(point.latitude);
      const longitude = toNumber(point.longitude);
      const at = Date.parse(point.recorded_at);
      if (latitude === null || longitude === null || Number.isNaN(at)) continue;
      if (previousAt !== null && (at - previousAt) / 1000 > ROUTE_GAP_SECONDS) {
        segments.push(current);
        current = [];
      }
      current.push({ latitude, longitude });
      previousAt = at;
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
    data: { segments, pointCount: total, truncated: received < total },
  };
}
