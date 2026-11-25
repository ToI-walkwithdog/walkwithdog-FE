// 진행 중인 산책의 GPS 수집과 전송을 맡는 모듈. 화면이 다시 만들어져도 상태가 남도록 모듈에 둔다.
//
// - 시각: 기기 시계가 서버와 다를 수 있어서, GET /walks/active의 elapsed_seconds로 보정값을 구해
//   서버 기준 시각으로 보낸다(서버는 산책 시작 이후, 서버 현재 시각 이하만 받는다).
// - 좌표: 순번은 0부터 연속이다. 응답이 유실돼도 같은 순번과 내용의 재전송은 서버가 무시한다.
//   순번이 어긋나면(409) GET /walks/active의 last_sequence_no로 다시 맞춘다.
// - 마커와 신고: 탭마다(신고는 한 건마다) 키를 만들고, 결과가 불확실하면 같은 키와 같은 본문으로 다시 보낸다.
import * as Location from "expo-location";

import type { ApiResult } from "./client";
import { newUuid } from "./uuid";
import { setEndedWalk } from "./walkSession";
import {
  endWalk,
  fetchActiveWalk,
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

const UPLOAD_INTERVAL_MS = 10_000;
const BATCH_SIZE = 500;
// 서버의 거리 계산이 건너뛰는 급이동 기준(m/s)과 같다.
const MAX_SPEED_M_S = 5;
const MAX_STATS_ACCURACY_M = 50;
// 이보다 오래된 위치는 마커나 신고에 붙이지 않는다(서버가 30초 이내 관측만 쓴다).
const MAX_FIX_AGE_MS = 25_000;
// 이 시간 동안 새 위치가 없으면 신호가 끊긴 것으로 본다.
export const GPS_LOST_AFTER_MS = 30_000;

type Fix = { latitude: number; longitude: number; accuracy: number | null; atMs: number };

export type TrackerSnapshot = {
  walkId: number | null;
  startedAtMs: number;
  clockOffsetMs: number;
  distanceM: number;
  paused: boolean;
  pausedTotalMs: number;
  // 정지 중이면 정지한 기기 시각. 정지 시간을 계산할 때 쓴다.
  pausedAt: number | null;
  permission: "unknown" | "granted" | "denied";
  // 마지막으로 위치를 받은 기기 시각. 아직 없으면 null.
  lastFixReceivedAt: number | null;
  unsentCount: number;
  // 서버가 이미 종료했거나(자동 종료 포함) 로그인이 끊겨 더 보낼 수 없다.
  walkEnded: boolean;
  authLost: boolean;
};

type State = {
  walkId: number | null;
  startedAtMs: number;
  clockOffsetMs: number;
  nextSequence: number;
  lastPointAtMs: number;
  buffer: WalkPointBody[];
  lastFix: Fix | null;
  lastFixReceivedAt: number | null;
  distanceM: number;
  paused: boolean;
  pausedAt: number | null;
  pausedTotalMs: number;
  permission: TrackerSnapshot["permission"];
  walkEnded: boolean;
  authLost: boolean;
};

function initialState(): State {
  return {
    walkId: null,
    startedAtMs: 0,
    clockOffsetMs: 0,
    nextSequence: 0,
    lastPointAtMs: 0,
    buffer: [],
    lastFix: null,
    lastFixReceivedAt: null,
    distanceM: 0,
    paused: false,
    pausedAt: null,
    pausedTotalMs: 0,
    permission: "unknown",
    walkEnded: false,
    authLost: false,
  };
}

let state = initialState();
let subscription: Location.LocationSubscription | null = null;
let uploadTimer: ReturnType<typeof setInterval> | null = null;
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
    pausedTotalMs: state.pausedTotalMs,
    pausedAt: state.pausedAt,
    permission: state.permission,
    lastFixReceivedAt: state.lastFixReceivedAt,
    unsentCount: state.buffer.length,
    walkEnded: state.walkEnded,
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

// 서버 기준 현재 시각(ms).
export function serverNowMs() {
  return Date.now() + state.clockOffsetMs;
}

// 진행 중인 산책을 이어 받는다. 같은 산책이면 보내지 못한 좌표와 순번을 그대로 둔다.
export function attachWalk(active: ActiveWalk) {
  const startedAtMs = Date.parse(active.started_at);
  const clockOffsetMs = startedAtMs + active.elapsed_seconds * 1000 - Date.now();
  if (state.walkId !== active.walk_id) {
    resetTracker();
    state = {
      ...initialState(),
      walkId: active.walk_id,
      startedAtMs,
      clockOffsetMs,
      nextSequence: (active.last_sequence_no ?? -1) + 1,
      lastPointAtMs: Math.max(
        startedAtMs,
        active.last_point_recorded_at ? Date.parse(active.last_point_recorded_at) : 0,
      ),
    };
  } else {
    state.startedAtMs = startedAtMs;
    state.clockOffsetMs = clockOffsetMs;
  }
  emit();
}

function onFix(location: Location.LocationObject) {
  if (state.walkId === null || state.paused) return;
  const atMs = location.timestamp + state.clockOffsetMs;
  const accuracy = location.coords.accuracy ?? null;
  const fix: Fix = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy,
    atMs,
  };
  state.lastFixReceivedAt = Date.now();
  // 서버는 시각이 순번 순서로 늘어나고 산책 시작 이후인 좌표만 받는다.
  if (atMs > state.lastPointAtMs && atMs >= state.startedAtMs) {
    const previous = state.lastFix;
    if (
      previous &&
      accuracy !== null &&
      accuracy <= MAX_STATS_ACCURACY_M &&
      previous.accuracy !== null &&
      previous.accuracy <= MAX_STATS_ACCURACY_M
    ) {
      const seconds = (atMs - previous.atMs) / 1000;
      const meters = haversineM(previous, fix);
      if (seconds > 0 && meters / seconds <= MAX_SPEED_M_S) state.distanceM += meters;
    }
    state.lastFix = fix;
    state.lastPointAtMs = atMs;
    state.buffer.push({
      sequence_no: state.nextSequence++,
      latitude: Number(fix.latitude.toFixed(6)),
      longitude: Number(fix.longitude.toFixed(6)),
      recorded_at: new Date(atMs).toISOString(),
      accuracy_m: accuracy === null ? null : Number(accuracy.toFixed(2)),
    });
  }
  emit();
}

// 위치 권한을 요청하고 수집을 시작한다. 거부하면 permission이 "denied"가 되고 산책은 계속된다.
export async function startLocation() {
  if (state.walkId === null) return;
  if (!uploadTimer) uploadTimer = setInterval(() => void flushPoints(), UPLOAD_INTERVAL_MS);
  if (subscription) return;
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      state.permission = "denied";
      emit();
      return;
    }
    state.permission = "granted";
    subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 5000, distanceInterval: 3 },
      onFix,
    );
  } catch {
    if (state.permission !== "granted") state.permission = "denied";
  }
  emit();
}

function removeSubscription() {
  subscription?.remove();
  subscription = null;
}

// 서버에는 일시정지가 없다. 정지 중에는 좌표를 모으지 않고, 그 구간은 서버가 "불명확"으로 본다.
export function pauseTracking() {
  if (state.paused) return;
  removeSubscription();
  state.paused = true;
  state.pausedAt = Date.now();
  emit();
}

export async function resumeTracking() {
  if (!state.paused) return;
  state.pausedTotalMs += Date.now() - (state.pausedAt ?? Date.now());
  state.pausedAt = null;
  state.paused = false;
  emit();
  await startLocation();
}

// 위치 신호를 다시 잡는다(5-3).
export async function reconnectLocation() {
  removeSubscription();
  state.lastFixReceivedAt = null;
  await startLocation();
}

function stopTimers() {
  removeSubscription();
  if (uploadTimer) clearInterval(uploadTimer);
  uploadTimer = null;
  uploading = false;
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

// 보내지 못한 좌표를 서버에 보낸다. 실패하면 그대로 두고 다음 주기에 다시 보낸다.
export async function flushPoints(): Promise<boolean> {
  const walkId = state.walkId;
  if (walkId === null || uploading) return false;
  if (state.buffer.length === 0) return true;
  uploading = true;
  try {
    const batch = state.buffer.slice(0, BATCH_SIZE);
    const result = await postWalkPoints(walkId, batch);
    if (state.walkId !== walkId) return false;
    if (result.ok) {
      state.buffer.splice(0, batch.length);
      emit();
      return true;
    }
    if (result.status === 401) {
      state.authLost = true;
    } else if (result.status === 409) {
      // 순번이 어긋났거나 산책이 이미 끝났다. 서버의 마지막 순번으로 다시 맞춘다.
      const active = await fetchActiveWalk();
      if (active.ok && active.data.walk_id === walkId) {
        const next = (active.data.last_sequence_no ?? -1) + 1;
        state.buffer.forEach((point, index) => {
          point.sequence_no = next + index;
        });
        state.nextSequence = next + state.buffer.length;
      } else if (!active.ok && active.status === 404) {
        state.walkEnded = true;
        stopTimers();
      }
    }
    emit();
    return false;
  } finally {
    uploading = false;
  }
}

function recentFix(): Fix | null {
  const fix = state.lastFix;
  return fix && serverNowMs() - fix.atMs <= MAX_FIX_AGE_MS ? fix : null;
}

// 서버가 받는 범위(산책 시작 이후, 서버 현재 시각 이하)에 맞춘 지금 시각.
function eventTimeMs() {
  return Math.max(state.startedAtMs, serverNowMs() - 1000);
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

// 마커를 저장한다. 결과가 불확실했던 같은 항목을 다시 누르면 같은 키와 본문을 다시 보낸다.
export async function sendMarker(item: MarkerRequest): Promise<ApiResult<{ id: number }>> {
  const walkId = state.walkId;
  if (walkId === null) return noActiveWalk();
  let body = pendingMarkers.get(item.label);
  if (!body) {
    await flushPoints(); // 서버가 최근 좌표로 위치를 채울 수 있게 먼저 보낸다.
    const fix = recentFix();
    body = {
      marker_type: item.type,
      ...(item.memo ? { memo: item.memo } : {}),
      ...(fix
        ? {
            latitude: Number(fix.latitude.toFixed(6)),
            longitude: Number(fix.longitude.toFixed(6)),
            ...(fix.accuracy !== null ? { accuracy_m: Number(fix.accuracy.toFixed(2)) } : {}),
            position_recorded_at: new Date(fix.atMs).toISOString(),
          }
        : {}),
      recorded_at: new Date(eventTimeMs()).toISOString(),
      client_marker_id: newUuid(),
    };
    pendingMarkers.set(item.label, body);
  }
  const result = await postWalkMarker(walkId, body);
  if (!isUnknownOutcome(result)) pendingMarkers.delete(item.label);
  return result;
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
export function prepareIncident(label: string, type: IncidentType, description?: string) {
  const fix = recentFix();
  pendingIncident = {
    label,
    body: {
      incident_type: type,
      ...(description ? { description } : {}),
      ...(fix
        ? {
            latitude: Number(fix.latitude.toFixed(6)),
            longitude: Number(fix.longitude.toFixed(6)),
          }
        : {}),
      occurred_at: new Date(eventTimeMs()).toISOString(),
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
  const result = await postWalkIncident(walkId, draft.body);
  if (result.ok) pendingIncident = null;
  return result;
}

// 산책을 종료한다. 성공하면 수집을 멈추고 결과를 6-x가 쓸 수 있게 남긴다.
export async function finishWalk(): Promise<ApiResult<Walk>> {
  const walkId = state.walkId;
  if (walkId === null) return noActiveWalk();
  await flushPoints(); // 마지막 좌표를 먼저 보낸다. 실패해도 종료는 막지 않는다.
  const result = await endWalk(walkId);
  if (result.ok) {
    setEndedWalk(result.data);
    resetTracker();
  }
  return result;
}
