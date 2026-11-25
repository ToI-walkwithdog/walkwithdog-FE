// 개발용 가짜 GPS(locationSource.ts가 __DEV__ + EXPO_PUBLIC_DEV_FAKE_GPS=true일 때만 불러온다).
// 서울 강남구의 합성 지점(실제 주소 아님) 둘레 약 300m를 걷는 닫힌 원형 경로를 걸음 속도로 돈다.
// - 위치는 "걷기 시작한 뒤 흐른 실제 시간"으로 정해서, 수집이 멈춘 동안(일시정지, 신호 끊김)에도 걷는 사람은 계속 움직인다.
// - 표본은 3~5초마다 한 번, 정확도 4~12m, 1~2m 흔들림. 흔들림 때문에 표본 사이 속도가 1.9m/s를 넘으면 흔들림을 줄인다.
// - 시각(timestamp)은 표본을 내보내는 순간의 실제 현재 시각이다. 앞당기거나 미루지 않는다.
// - 모든 구독자(기록, 지도 마커)에게 같은 표본을 한 번에 보낸다.
import type { LocationSample, LocationWatch } from "./locationSource";

const CENTER = { latitude: 37.5172, longitude: 127.0473 };
const LOOP_M = 300;
const RADIUS_M = LOOP_M / (2 * Math.PI);
const SPEED_M_S = 1.3;
const MAX_SAMPLE_SPEED_M_S = 1.9;
const SAMPLE_MIN_MS = 3000;
const SAMPLE_MAX_MS = 5000;
const M_PER_DEG_LAT = 111_320;

// 경로 끊김 확인용 시나리오(둘 다 기본 꺼짐).
const GAP = process.env.EXPO_PUBLIC_DEV_FAKE_GPS_GAP === "true";
const BAD_ACCURACY = process.env.EXPO_PUBLIC_DEV_FAKE_GPS_BAD_ACCURACY === "true";
const GAP_EVERY_MS = 60_000;
const GAP_LENGTH_MS = 20_000;
const BAD_ACCURACY_EVERY = 7;
const BAD_ACCURACY_M = 30;

type Point = { latitude: number; longitude: number };

const listeners = new Set<(sample: LocationSample) => void>();
let timer: ReturnType<typeof setTimeout> | null = null;
let walkStartedAt = 0;
let last: { point: Point; at: number } | null = null;
let sampleCount = 0;
let nextGapAt = 0;
let gapUntil = 0;

function between(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function offset(point: Point, northM: number, eastM: number): Point {
  const latitude = point.latitude + northM / M_PER_DEG_LAT;
  const longitude = point.longitude + eastM / (M_PER_DEG_LAT * Math.cos((point.latitude * Math.PI) / 180));
  return { latitude, longitude };
}

function distanceM(a: Point, b: Point) {
  const north = (b.latitude - a.latitude) * M_PER_DEG_LAT;
  const east = (b.longitude - a.longitude) * M_PER_DEG_LAT * Math.cos((a.latitude * Math.PI) / 180);
  return Math.hypot(north, east);
}

function loopPosition(distanceAlongM: number): Point {
  const angle = (2 * Math.PI * (distanceAlongM % LOOP_M)) / LOOP_M;
  return offset(CENTER, RADIUS_M * Math.cos(angle), RADIUS_M * Math.sin(angle));
}

function nextSample(now: number): LocationSample {
  const base = loopPosition((SPEED_M_S * (now - walkStartedAt)) / 1000);
  // 1~2m 흔들림. 앞 표본과의 속도가 너무 빨라지면 흔들림을 줄여 간다.
  const jitterM = between(1, 2);
  const jitterAngle = Math.random() * 2 * Math.PI;
  let point = base;
  for (const scale of [1, 0.5, 0.25, 0]) {
    point = offset(base, jitterM * scale * Math.cos(jitterAngle), jitterM * scale * Math.sin(jitterAngle));
    const seconds = last ? (now - last.at) / 1000 : 0;
    if (!last || seconds <= 0 || distanceM(last.point, point) / seconds <= MAX_SAMPLE_SPEED_M_S) break;
  }
  sampleCount += 1;
  const accuracy =
    BAD_ACCURACY && sampleCount % BAD_ACCURACY_EVERY === 0 ? BAD_ACCURACY_M : Number(between(4, 12).toFixed(1));
  last = { point, at: now };
  return {
    timestamp: now,
    coords: {
      latitude: Number(point.latitude.toFixed(7)),
      longitude: Number(point.longitude.toFixed(7)),
      accuracy,
    },
  };
}

function schedule(delayMs: number) {
  timer = setTimeout(tick, delayMs);
}

function tick() {
  timer = null;
  const now = Date.now();
  if (GAP && now >= nextGapAt) {
    // 20초 동안 표본을 내보내지 않는다. 걷는 사람은 계속 움직이므로 이어지는 첫 표본은 그만큼 떨어져 있다.
    gapUntil = now + GAP_LENGTH_MS;
    nextGapAt = now + GAP_EVERY_MS;
  }
  if (now >= gapUntil) {
    const sample = nextSample(now);
    listeners.forEach((listener) => listener(sample));
  }
  if (listeners.size > 0) schedule(between(SAMPLE_MIN_MS, SAMPLE_MAX_MS));
}

export function watchFakeLocation(onSample: (sample: LocationSample) => void): Promise<LocationWatch> {
  if (listeners.size === 0 && timer === null) {
    if (walkStartedAt === 0) {
      walkStartedAt = Date.now();
      nextGapAt = walkStartedAt + GAP_EVERY_MS;
    }
    // 처음 표본은 바로 낸다(실제 GPS도 구독 직후 곧 위치를 준다).
    schedule(0);
  }
  listeners.add(onSample);
  return Promise.resolve({
    remove: () => {
      listeners.delete(onSample);
      if (listeners.size === 0 && timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    },
  });
}
