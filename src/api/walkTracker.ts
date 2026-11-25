// 진행 중인 산책의 GPS 수집과 전송을 맡는 모듈. 화면이 다시 만들어져도 상태가 남도록 모듈에 둔다.
//
// 정책(BE 담당자 확인)
// - 일시정지는 GPS 수집만 멈춘다. 서버 산책은 IN_PROGRESS 그대로이고 시간도 계속 흐른다.
// - 좌표의 recorded_at은 실제 관측 시각(기기 시계) 그대로 보낸다. 서버 시계에 맞춰 고치지 않는다.
//   서버는 시작 이후, 서버 현재 시각 이하의 좌표만 받으므로(batch 전체가 409), 기기 시계가 앞서면
//   서버 시각이 그 시각을 지날 때까지 큐에 두었다가 보낸다. 가짜 좌표를 만들거나 구간을 잇지 않는다.
// - 좌표 순번은 0부터 연속이다. 보내지 못한 좌표는 같은 순번으로 다시 보낸다.
// - 앱은 foreground에서만 수집한다. 서버가 새 좌표를 1시간 넘게 못 받으면 AUTO_TIMEOUT으로 끝낸다.
//   만료 시각은 서버의 auto_end_at이 정하고 FE는 계산하지 않는다.
// - 마커와 신고는 탭마다(신고는 한 건마다) 키를 만들고, 결과가 불확실하면 같은 키와 같은 본문으로 다시 보낸다.
import { AppState } from "react-native";

import type { ApiFailure, ApiResult } from "./client";
import {
  requestLocationPermission,
  watchLocation,
  type LocationSample,
  type LocationWatch,
} from "./locationSource";
import { newUuid } from "./uuid";
import { loadRawWalkRecord, type DetailMarker, type RawRoutePoint } from "./walkRoute";
import { toNumber } from "../utils/walkFormat";
import { setEndedWalk } from "./walkSession";
import {
  endWalk,
  fetchActiveWalk,
  fetchWalkDetail,
  postWalkIncident,
  postWalkMarker,
  postWalkPoints,
  type ActiveWalk,
  type IncidentType,
  type MarkerType,
  type Walk,
  type WalkIncidentBody,
  type WalkMarkerBody,
  type WalkPointBody,
} from "./walks";

// 관측은 약 10초마다 모으고(iOS는 시스템이 더 자주 줘서 거른다), 약 30초마다 묶어 보낸다.
const SAMPLE_INTERVAL_MS = 10_000;
const SAMPLE_TOLERANCE_MS = 1_000;
const UPLOAD_INTERVAL_MS = 30_000;
const CLOCK_SYNC_INTERVAL_MS = 5 * 60_000;
const BATCH_SIZE = 500;
// 서버의 거리 계산이 건너뛰는 급이동 기준(m/s)과 같다. 화면에 보이는 거리에만 쓴다.
const MAX_SPEED_M_S = 5;
const MAX_ACCURACY_M = 50;
// 마커 위치로 쓰려면 탭 시각 이전 30초 이내에 관측했고 정확도가 50m 이하여야 한다(서버 규칙과 같다).
const MARKER_FIX_MAX_AGE_MS = 30_000;
// 서버 시계 추정의 오차(초 단위 절삭, 응답 지연)를 덮는 여유.
const SERVER_CLOCK_MARGIN_MS = 1_000;
const MAX_CLOCK_WAIT_MS = 20_000;
// 이 시간 동안 새 위치가 없으면 신호가 끊긴 것으로 본다.
export const GPS_LOST_AFTER_MS = 30_000;

type Fix = { latitude: number; longitude: number; accuracy: number | null; atMs: number };

export type EndInfo = {
  status: Walk["status"];
  endReason: Walk["end_reason"];
  // 끝난 뒤에도 서버에 보내지 못한 좌표 수.
  unsentCount: number;
};

// 5-1 지도에 그리는 이번 산책의 마커. 탭 즉시 pending으로 그리고, 저장이 끝나면 saved가 된다.
// key는 새로 만든 마커는 client_marker_id, 서버에서 불러온 마커는 "srv-{id}"다.
export type LiveMarker = {
  key: string;
  type: MarkerType;
  memo: string | null;
  latitude: number;
  longitude: number;
  status: "pending" | "saved";
  serverId: number | null;
};

export type TrackerSnapshot = {
  walkId: number | null;
  startedAtMs: number;
  // 화면 시간 표시용 보정값: 서버 시각 ≈ 기기 시각 + clockOffsetMs. 좌표 시각은 고치지 않는다.
  clockOffsetMs: number;
  distanceM: number;
  // recordingState. true면 GPS 수집만 멈춘 것이다.
  paused: boolean;
  permission: "unknown" | "granted" | "denied";
  // 마지막으로 위치를 받은(또는 수집을 다시 시작한) 기기 시각. 아직 없으면 null.
  lastFixReceivedAt: number | null;
  unsentCount: number;
  // 이번 산책에서 기록한 좌표 전체(보낸 것 포함)와 마커. 5-1 지도가 경로와 마커를 그리는 데 쓴다.
  routePoints: RawRoutePoint[];
  markers: LiveMarker[];
  // 서버에서 이미 끝난 산책이다(자동 종료 포함). 더는 보내지 않는다.
  ended: EndInfo | null;
  authLost: boolean;
};

type State = {
  walkId: number | null;
  startedAtMs: number;
  clockOffsetMs: number;
  lastClockSyncAt: number;
  nextSequence: number;
  lastPointAtMs: number;
  lastSampleAtMs: number;
  buffer: WalkPointBody[];
  routePoints: RawRoutePoint[];
  markers: LiveMarker[];
  lastFix: Fix | null;
  lastSampleFix: Fix | null;
  lastFixReceivedAt: number | null;
  distanceM: number;
  paused: boolean;
  permission: TrackerSnapshot["permission"];
  ended: EndInfo | null;
  authLost: boolean;
};

function initialState(): State {
  return {
    walkId: null,
    startedAtMs: 0,
    clockOffsetMs: 0,
    lastClockSyncAt: 0,
    nextSequence: 0,
    lastPointAtMs: 0,
    lastSampleAtMs: 0,
    buffer: [],
    routePoints: [],
    markers: [],
    lastFix: null,
    lastSampleFix: null,
    lastFixReceivedAt: null,
    distanceM: 0,
    paused: false,
    permission: "unknown",
    ended: null,
    authLost: false,
  };
}

let state = initialState();
let subscription: LocationWatch | null = null;
let uploadTimer: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: { remove: () => void } | null = null;
let uploading = false;
const listeners = new Set<() => void>();
const pendingMarkers = new Map<string, WalkMarkerBody>();
let pendingIncident: IncidentDraft | null = null;

function makeSnapshot(): TrackerSnapshot {
  return {
    walkId: state.walkId,
    startedAtMs: state.startedAtMs,
    clockOffsetMs: state.clockOffsetMs,
    distanceM: state.distanceM,
    paused: state.paused,
    permission: state.permission,
    lastFixReceivedAt: state.lastFixReceivedAt,
    unsentCount: state.buffer.length,
    routePoints: state.routePoints,
    markers: state.markers,
    ended: state.ended,
    authLost: state.authLost,
  };
}

let snapshot = makeSnapshot();

function emit() {
  snapshot = makeSnapshot();
  listeners.forEach((listener) => listener());
}

export function subscribeTracker(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getTrackerSnapshot() {
  return snapshot;
}

function haversineM(a: Fix, b: Fix): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.min(1, Math.sqrt(h)));
}

// 서버 기준 현재 시각의 추정값(ms). 화면 표시와 "서버가 이 관측을 받을 수 있는가" 판단에만 쓴다.
export function serverNowMs() {
  return Date.now() + state.clockOffsetMs;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// 기기 시계가 서버보다 앞서면, 서버 시각이 이 관측 시각을 지날 때까지 기다린다(최대 20초).
// 관측 시각은 고치지 않는다. 기다려도 서버가 거절하면 그 오류를 그대로 보여 준다.
async function waitForServerClock(observedAtMs: number) {
  const ahead = observedAtMs + SERVER_CLOCK_MARGIN_MS - serverNowMs();
  if (ahead > 0) await sleep(Math.min(ahead, MAX_CLOCK_WAIT_MS));
}

function applyClock(active: ActiveWalk) {
  // 서버의 elapsed_seconds는 초 단위로 절삭된다. 추정은 서버 시각보다 약간 늦게 나와 보수적이다.
  state.startedAtMs = Date.parse(active.started_at);
  state.clockOffsetMs = state.startedAtMs + active.elapsed_seconds * 1000 - Date.now();
  state.lastClockSyncAt = Date.now();
}

// 서버가 이미 저장한 순번까지는 큐에서 빼고, 남은 좌표는 같은 순번으로 다시 보낸다.
// 앞쪽 좌표가 빠져 순번이 이어지지 않을 때만(큐가 유실된 경우) 남은 좌표의 순번을 다시 매긴다.
function reconcileQueue(lastSequenceNo: number | null) {
  const last = lastSequenceNo ?? -1;
  state.buffer = state.buffer.filter((point) => point.sequence_no > last);
  if (state.buffer.length > 0 && state.buffer[0].sequence_no !== last + 1) {
    state.buffer.forEach((point, index) => {
      point.sequence_no = last + 1 + index;
    });
    // 다시 매긴 순번을 경로 좌표에도 맞춘다(보내지 않은 좌표는 routePoints의 맨 뒤 구간이다).
    const unsentFrom = state.routePoints.length - state.buffer.length;
    state.routePoints = state.routePoints.map((point, index) =>
      index >= unsentFrom ? { ...point, sequenceNo: last + 1 + (index - unsentFrom) } : point,
    );
  }
  state.nextSequence = last + 1 + state.buffer.length;
}

// 진행 중인 산책을 이어 받는다. 같은 산책이면 큐, 순번, 일시정지 상태를 그대로 둔다.
export function attachWalk(active: ActiveWalk) {
  if (state.walkId !== active.walk_id) {
    resetTracker();
    state = {
      ...initialState(),
      walkId: active.walk_id,
      nextSequence: (active.last_sequence_no ?? -1) + 1,
    };
    applyClock(active);
    state.lastPointAtMs = Math.max(
      state.startedAtMs,
      active.last_point_recorded_at ? Date.parse(active.last_point_recorded_at) : 0,
    );
    // 앱을 다시 열었을 때: 서버에 이미 저장된 좌표와 마커를 불러와 지도에 다시 그린다.
    void seedRecordedData(active.walk_id);
  } else {
    applyClock(active);
    reconcileQueue(active.last_sequence_no);
    if (active.last_point_recorded_at) {
      state.lastPointAtMs = Math.max(state.lastPointAtMs, Date.parse(active.last_point_recorded_at));
    }
  }
  state.authLost = false;
  state.ended = null;
  ensureAppStateListener();
  emit();
}

// 서버 마커를 이미 가진 것(저장 완료, 저장 중인 같은 위치)과 겹치지 않게 합친다.
// 서버 응답에는 client_marker_id가 없어서, 저장이 끝난 마커는 serverId로, 저장 중인 마커는 종류와 위치로 거른다.
function mergeServerMarkers(list: DetailMarker[]) {
  const additions: LiveMarker[] = [];
  for (const marker of list) {
    const latitude = toNumber(marker.latitude);
    const longitude = toNumber(marker.longitude);
    if (latitude === null || longitude === null) continue;
    const duplicate = [...state.markers, ...additions].some(
      (known) =>
        known.serverId === marker.id ||
        (known.status === "pending" &&
          known.type === marker.marker_type &&
          Math.abs(known.latitude - latitude) < 1e-5 &&
          Math.abs(known.longitude - longitude) < 1e-5),
    );
    if (duplicate) continue;
    additions.push({
      key: `srv-${marker.id}`,
      type: marker.marker_type,
      memo: marker.memo,
      latitude,
      longitude,
      status: "saved",
      serverId: marker.id,
    });
  }
  if (additions.length > 0) state.markers = [...state.markers, ...additions];
}

async function seedRecordedData(walkId: number) {
  const record = await loadRawWalkRecord(walkId);
  if (!record.ok || state.walkId !== walkId) return;
  const lastServerSequence = record.data.points.reduce((max, point) => Math.max(max, point.sequenceNo), -1);
  // 불러오는 사이 기기에서 새로 기록한 좌표는 순번이 서버 마지막 이후라서 뒤에 이어 붙인다.
  const local = state.routePoints.filter((point) => point.sequenceNo > lastServerSequence);
  state.routePoints = [...record.data.points, ...local];
  mergeServerMarkers(record.data.markers);
  emit();
}

function onFix(location: LocationSample) {
  if (state.walkId === null || state.paused) return;
  // 관측 시각은 기기가 위치를 얻은 실제 시각이다. 서버 시계에 맞춰 바꾸지 않는다.
  const atMs = location.timestamp;
  const accuracy = location.coords.accuracy ?? null;
  const fix: Fix = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy,
    atMs,
  };
  state.lastFix = fix;
  state.lastFixReceivedAt = Date.now();
  // 약 10초 간격으로만 기록한다. 움직임이 적다는 이유로 관측을 버리지 않는다.
  const dueSample = atMs - state.lastSampleAtMs >= SAMPLE_INTERVAL_MS - SAMPLE_TOLERANCE_MS;
  // 서버는 시각이 순번 순서로 늘어나고 산책 시작 이후인 좌표만 받는다.
  if (dueSample && atMs > state.lastPointAtMs && atMs >= state.startedAtMs) {
    const previous = state.lastSampleFix;
    if (
      previous &&
      accuracy !== null &&
      accuracy <= MAX_ACCURACY_M &&
      previous.accuracy !== null &&
      previous.accuracy <= MAX_ACCURACY_M
    ) {
      const seconds = (atMs - previous.atMs) / 1000;
      const meters = haversineM(previous, fix);
      if (seconds > 0 && meters / seconds <= MAX_SPEED_M_S) state.distanceM += meters;
    }
    state.lastSampleFix = fix;
    state.lastSampleAtMs = atMs;
    state.lastPointAtMs = atMs;
    const body: WalkPointBody = {
      sequence_no: state.nextSequence++,
      latitude: Number(fix.latitude.toFixed(6)),
      longitude: Number(fix.longitude.toFixed(6)),
      recorded_at: new Date(atMs).toISOString(),
      accuracy_m: accuracy === null ? null : Number(accuracy.toFixed(2)),
    };
    state.buffer.push(body);
    state.routePoints = [
      ...state.routePoints,
      {
        latitude: body.latitude,
        longitude: body.longitude,
        accuracy: body.accuracy_m,
        atMs,
        sequenceNo: body.sequence_no,
      },
    ];
  }
  emit();
}

function removeSubscription() {
  subscription?.remove();
  subscription = null;
}

function startTimers() {
  if (!uploadTimer) uploadTimer = setInterval(() => void tick(), UPLOAD_INTERVAL_MS);
}

function stopTimers() {
  removeSubscription();
  if (uploadTimer) clearInterval(uploadTimer);
  uploadTimer = null;
  uploading = false;
}

async function tick() {
  if (state.walkId === null || state.ended) return;
  if (Date.now() - state.lastClockSyncAt >= CLOCK_SYNC_INTERVAL_MS) await syncClock();
  await flushPoints();
}

// 서버 시각 추정을 새로 맞춘다. 기기 시계가 흘러갔을 때를 대비해 주기적으로 한다.
async function syncClock() {
  const walkId = state.walkId;
  const active = await fetchActiveWalk();
  if (state.walkId !== walkId) return;
  if (active.ok && active.data.walk_id === walkId) {
    applyClock(active.data);
    emit();
  }
}

// 위치 권한을 요청하고 수집을 시작한다. 정지 중이면 시작하지 않는다.
// 거부하면 permission이 "denied"가 되고 산책은 계속된다.
export async function startLocation() {
  if (state.walkId === null || state.ended) return;
  startTimers();
  if (state.paused || subscription) return;
  try {
    const granted = await requestLocationPermission();
    if (!granted) {
      state.permission = "denied";
      emit();
      return;
    }
    state.permission = "granted";
    if (state.paused || subscription) return;
    subscription = await watchLocation(
      // distanceInterval 0: 이동 거리로 관측을 거르지 않는다.
      { accuracy: "high", timeInterval: SAMPLE_INTERVAL_MS, distanceInterval: 0 },
      onFix,
    );
  } catch {
    if (state.permission !== "granted") state.permission = "denied";
  }
  emit();
}

// 서버에는 일시정지가 없다. 정지는 GPS 수집만 멈추고 산책과 시간은 계속된다.
// 정지 중에는 좌표가 생기지 않고, 그 시간 간격은 서버가 "불명확"으로 본다. 간격을 이어 그리지 않는다.
export function pauseTracking() {
  if (state.paused) return;
  removeSubscription();
  state.paused = true;
  emit();
}

export async function resumeTracking() {
  if (!state.paused) return;
  state.paused = false;
  state.lastFixReceivedAt = Date.now();
  emit();
  await startLocation();
}

// 위치 신호를 다시 잡는다(5-3). 정지 중이면 정지를 풀지 않는다.
export async function reconnectLocation() {
  removeSubscription();
  state.lastFixReceivedAt = Date.now();
  await startLocation();
}

function ensureAppStateListener() {
  if (appStateSubscription) return;
  appStateSubscription = AppState.addEventListener("change", (next) => {
    if (state.walkId === null || state.ended) return;
    if (next !== "active") {
      // 백그라운드로 가기 전에 가능한 만큼 보낸다.
      void flushPoints();
      return;
    }
    // 돌아왔다: 서버 상태를 먼저 확인하고, 정지 중이 아니면 수집을 다시 시작한다.
    state.lastFixReceivedAt = Date.now();
    void recoverWalk().then((result) => {
      if (result.kind === "active") {
        removeSubscription();
        void startLocation();
        void flushPoints();
      }
    });
  });
}

export function resetTracker() {
  stopTimers();
  state = initialState();
  pendingMarkers.clear();
  pendingIncident = null;
  emit();
}

// 서버에서 이미 끝난 산책(자동 종료 등)이면 수집과 보내지 못한 기록을 정리한다.
export function discardWalk() {
  resetTracker();
}

export type RecoverResult =
  | { kind: "active"; active: ActiveWalk }
  | { kind: "ended"; info: EndInfo }
  | { kind: "none" }
  | { kind: "auth" }
  | { kind: "error"; failure: ApiFailure };

// 앱에 돌아왔을 때와 좌표 전송이 409일 때 서버의 산책 상태를 확인한다.
// - GET /walks/active 200: 같은 산책이면 큐를 서버의 last_sequence_no와 맞춘다.
// - 404: 마지막으로 알던 산책을 GET /walks/{id}로 조회해 종료 상태와 end_reason을 읽는다.
//   404만으로 자동 종료라고 결론 내리지 않는다(다른 종료 사유도 있다).
export async function recoverWalk(): Promise<RecoverResult> {
  const active = await fetchActiveWalk();
  if (active.ok) {
    attachWalk(active.data);
    return { kind: "active", active: active.data };
  }
  if (active.status === 401) {
    state.authLost = true;
    emit();
    return { kind: "auth" };
  }
  if (active.status !== 404) return { kind: "error", failure: active };
  const walkId = state.walkId;
  if (walkId === null) return { kind: "none" };
  const detail = await fetchWalkDetail(walkId);
  if (!detail.ok) {
    if (detail.status === 401) {
      state.authLost = true;
      emit();
      return { kind: "auth" };
    }
    // 다른 계정이거나 없는 산책이다. 이어 갈 수 없으니 정리한다.
    if (detail.status === 403 || detail.status === 404) return { kind: "none" };
    return { kind: "error", failure: detail };
  }
  const walk = detail.data.walk;
  if (walk.status === "IN_PROGRESS") {
    return {
      kind: "error",
      failure: { ok: false, status: 0, code: "WALK_STATE_INCONSISTENT", message: null },
    };
  }
  const info: EndInfo = {
    status: walk.status,
    endReason: walk.end_reason,
    unsentCount: state.buffer.length,
  };
  setEndedWalk(walk);
  state.ended = info;
  stopTimers();
  emit();
  return { kind: "ended", info };
}

// 보내지 못한 좌표를 서버에 보낸다. 실패하면 그대로 두고 다음 주기에 같은 순번으로 다시 보낸다.
export async function flushPoints(): Promise<boolean> {
  const walkId = state.walkId;
  if (walkId === null || uploading || state.ended) return false;
  if (state.buffer.length === 0) return true;
  uploading = true;
  try {
    // 기기 시계가 앞서 서버 시각을 넘는 관측은 서버가 batch 전체를 거절한다. 앞쪽 연속 구간만 보낸다.
    const limit = serverNowMs() - SERVER_CLOCK_MARGIN_MS;
    let count = 0;
    while (
      count < state.buffer.length &&
      count < BATCH_SIZE &&
      Date.parse(state.buffer[count].recorded_at) <= limit
    ) {
      count += 1;
    }
    if (count === 0) return false;
    const batch = state.buffer.slice(0, count);
    const result = await postWalkPoints(walkId, batch);
    if (state.walkId !== walkId) return false;
    if (result.ok) {
      state.buffer.splice(0, batch.length);
      emit();
      return true;
    }
    if (result.status === 401) {
      state.authLost = true;
      emit();
    } else if (result.status === 409) {
      // 순번이 어긋났거나 산책이 이미 끝났다(자동 종료 이후의 좌표도 여기서 막힌다).
      uploading = false;
      await recoverWalk();
    }
    return false;
  } finally {
    uploading = false;
  }
}

// 탭 시각 이전 30초 이내에 관측했고 정확도가 50m 이하인 위치만 돌려준다(마커용).
function markerFix(tapAtMs: number): Fix | null {
  const fix = state.lastFix;
  if (!fix || fix.accuracy === null || fix.accuracy > MAX_ACCURACY_M) return null;
  const age = tapAtMs - fix.atMs;
  return age >= 0 && age <= MARKER_FIX_MAX_AGE_MS ? fix : null;
}

// 결과를 알 수 없는 실패(네트워크, 시간 초과, 서버 오류)인지. 이때만 같은 키로 다시 보낸다.
export function isUnknownOutcome(result: ApiResult<unknown>): boolean {
  if (result.ok) return false;
  return result.code === "NETWORK_ERROR" || result.code === "TIMEOUT" || result.status >= 500;
}

export type MarkerRequest = { label: string; type: MarkerType; memo?: string };

function noActiveWalk(): ApiResult<never> {
  return { ok: false, status: 0, code: "NO_ACTIVE_WALK", message: null };
}

// 마커를 저장한다. 본문(시각, 위치, 키)은 탭 순간에 정하고, 결과가 불확실했던 같은 항목을 다시 누르면
// 같은 키와 같은 본문을 다시 보낸다. 탭 뒤에 모인 좌표를 앞선 마커에 붙이지 않는다.
export async function sendMarker(item: MarkerRequest): Promise<ApiResult<{ id: number }>> {
  const walkId = state.walkId;
  if (walkId === null) return noActiveWalk();
  let body = pendingMarkers.get(item.label);
  if (!body) {
    const tapAt = Date.now();
    const fix = markerFix(tapAt);
    body = {
      marker_type: item.type,
      ...(item.memo ? { memo: item.memo } : {}),
      // 위치가 조건에 맞지 않으면 보내지 않는다. 서버가 최근 2분 안의 유효한 저장 좌표를 쓴다.
      ...(fix
        ? {
            latitude: Number(fix.latitude.toFixed(6)),
            longitude: Number(fix.longitude.toFixed(6)),
            accuracy_m: Number((fix.accuracy ?? 0).toFixed(2)),
            position_recorded_at: new Date(fix.atMs).toISOString(),
          }
        : {}),
      recorded_at: new Date(tapAt).toISOString(),
      client_marker_id: newUuid(),
    };
    pendingMarkers.set(item.label, body);
    // 위치를 알면 서버 응답을 기다리지 않고 바로 지도에 올린다.
    if (body.latitude !== undefined && body.longitude !== undefined) {
      state.markers = [
        ...state.markers,
        {
          key: body.client_marker_id,
          type: body.marker_type,
          memo: body.memo ?? null,
          latitude: body.latitude,
          longitude: body.longitude,
          status: "pending",
          serverId: null,
        },
      ];
      emit();
    }
  }
  await flushPoints(); // 서버가 최근 좌표로 위치를 채울 수 있게 먼저 보낸다.
  await waitForServerClock(Date.parse(body.recorded_at));
  const result = await postWalkMarker(walkId, body);
  if (!isUnknownOutcome(result)) pendingMarkers.delete(item.label);
  if (state.walkId === walkId) {
    const key = body.client_marker_id;
    if (result.ok) {
      if (state.markers.some((marker) => marker.key === key)) {
        state.markers = state.markers.map((marker) =>
          marker.key === key ? { ...marker, status: "saved", serverId: result.data.id } : marker,
        );
        emit();
      } else {
        // 탭 때 위치를 몰라 서버가 채웠다면 서버 목록에서 이 마커를 가져온다.
        void refreshServerMarkers(walkId);
      }
    } else if (!isUnknownOutcome(result)) {
      // 저장에 실패했다: 지도에서 뺀다. 결과를 모르는 실패는 같은 키로 다시 보낼 때까지 남겨 둔다.
      state.markers = state.markers.filter((marker) => marker.key !== key);
      emit();
    }
  }
  return result;
}

async function refreshServerMarkers(walkId: number) {
  const detail = await fetchWalkDetail(walkId, 500, 0);
  if (!detail.ok || state.walkId !== walkId) return;
  mergeServerMarkers(detail.data.markers ?? []);
  emit();
}

export type IncidentDraft = {
  label: string;
  body: WalkIncidentBody;
};

export function getPendingIncident() {
  return pendingIncident;
}

export function clearPendingIncident() {
  pendingIncident = null;
}

// 신고 한 건을 만든다. 키와 시각, 위치는 이때 정하고 재전송에도 그대로 쓴다.
// 위치는 30초 이내에 관측한 것만 붙인다(없어도 신고는 막지 않는다).
export function prepareIncident(label: string, type: IncidentType, description?: string) {
  const occurredAt = Date.now();
  const fix = state.lastFix;
  const recent = fix && occurredAt - fix.atMs >= 0 && occurredAt - fix.atMs <= MARKER_FIX_MAX_AGE_MS;
  pendingIncident = {
    label,
    body: {
      incident_type: type,
      ...(description ? { description } : {}),
      ...(recent && fix
        ? {
            latitude: Number(fix.latitude.toFixed(6)),
            longitude: Number(fix.longitude.toFixed(6)),
          }
        : {}),
      occurred_at: new Date(occurredAt).toISOString(),
      client_report_id: newUuid(),
    },
  };
  return pendingIncident;
}

export async function submitIncident(confirmDuplicate = false): Promise<ApiResult<{ id: number }>> {
  const walkId = state.walkId;
  const draft = pendingIncident;
  if (walkId === null || draft === null) return noActiveWalk();
  if (confirmDuplicate) draft.body = { ...draft.body, confirm_duplicate: true };
  await waitForServerClock(Date.parse(draft.body.occurred_at));
  const result = await postWalkIncident(walkId, draft.body);
  if (result.ok) pendingIncident = null;
  return result;
}

// 산책을 종료한다. 성공하면 수집을 멈추고 결과(duration_seconds 등 서버 확정값)를 6-x가 쓸 수 있게 남긴다.
// 응답이 유실됐을 수 있는 실패(네트워크, 시간 초과, 서버 오류)와 409는 실패로 단정하지 않고
// 같은 산책의 상세를 다시 조회해, 이미 끝났으면 그 결과를 성공으로 쓴다.
export async function finishWalk(): Promise<ApiResult<Walk>> {
  const walkId = state.walkId;
  if (walkId === null) return noActiveWalk();
  await flushPoints(); // 마지막 좌표를 먼저 보낸다. 실패해도 종료는 막지 않는다.
  const result = await endWalk(walkId);
  if (result.ok) {
    setEndedWalk(result.data);
    resetTracker();
    return result;
  }
  if (isUnknownOutcome(result) || (result.code === null && result.status === 409)) {
    const detail = await fetchWalkDetail(walkId);
    if (detail.ok && detail.data.walk.status !== "IN_PROGRESS") {
      setEndedWalk(detail.data.walk);
      resetTracker();
      return { ok: true, status: detail.status, data: detail.data.walk };
    }
  }
  return result;
}
