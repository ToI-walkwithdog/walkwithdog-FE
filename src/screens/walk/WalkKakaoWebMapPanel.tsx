import { useEffect, useState } from "react";
import * as Location from "expo-location";

import type { RoutePoint } from "../../api/walkRoute";
import { KakaoWebMap } from "../../components/KakaoWebMap";

type Props = {
  appKey: string;
  onFail: (message: string) => void;
};

// 5-1 산책 화면 전용 증명용 지도. 권한은 새로 묻지 않고(산책 추적이 이미 받는다), 허용되어 있을 때만 현재 위치를 따라 마커를 옮긴다.
export function WalkKakaoWebMapPanel({ appKey, onFail }: Props) {
  const [position, setPosition] = useState<RoutePoint | null>(null);

  useEffect(() => {
    let active = true;
    let subscription: Location.LocationSubscription | null = null;
    (async () => {
      const permission = await Location.getForegroundPermissionsAsync();
      if (!active || permission.status !== "granted") return;
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 2000, distanceInterval: 2 },
        (location) => {
          if (active) {
            setPosition({ latitude: location.coords.latitude, longitude: location.coords.longitude });
          }
        },
      );
      if (!active) subscription.remove();
    })().catch(() => {});
    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);

  return <KakaoWebMap appKey={appKey} onError={onFail} position={position} />;
}
