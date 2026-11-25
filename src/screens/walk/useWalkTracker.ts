import { useEffect, useState, useSyncExternalStore } from "react";

import { getTrackerSnapshot, subscribeTracker } from "../../api/walkTracker";

function two(value: number) {
  return String(value).padStart(2, "0");
}

// 산책 시간. 1시간 미만은 "24:15", 이상은 "1:24:15".
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours > 0 ? `${hours}:${two(minutes)}:${two(seconds)}` : `${two(minutes)}:${two(seconds)}`;
}

// 진행 중인 산책의 상태와 1초마다 갱신하는 시간, 거리, 평균 속도를 돌려준다.
export function useWalkTracker() {
  const snapshot = useSyncExternalStore(subscribeTracker, getTrackerSnapshot, getTrackerSnapshot);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // 서버 시각 기준 경과 시간이다. 일시정지는 GPS 수집만 멈추는 것이라 시간은 멈추지 않고,
  // 정지한 시간을 빼지도 않는다. 종료 뒤에는 서버가 확정한 duration_seconds를 쓴다.
  const elapsedMs =
    snapshot.walkId === null
      ? 0
      : Math.max(0, now + snapshot.clockOffsetMs - snapshot.startedAtMs);
  const distanceKm = snapshot.distanceM / 1000;
  const speedKmh = elapsedMs > 0 ? distanceKm / (elapsedMs / 3_600_000) : 0;

  return {
    snapshot,
    now,
    stats: {
      time: formatElapsed(elapsedMs),
      distance: `${distanceKm.toFixed(1)} km`,
      averageSpeed: `${speedKmh.toFixed(1)} km/h`,
    },
  };
}
