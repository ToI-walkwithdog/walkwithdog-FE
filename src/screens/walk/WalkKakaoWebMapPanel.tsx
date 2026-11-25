import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { hasLocationPermission, watchLocation, type LocationWatch } from "../../api/locationSource";
import { getTrackerSnapshot, subscribeTracker } from "../../api/walkTracker";
import { buildRouteSegments, type RoutePoint } from "../../api/walkRoute";
import { Icon } from "../../components/Icon";
import { KakaoWebMap, type KakaoWebMapMarker } from "../../components/KakaoWebMap";
import { colors, radii } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

type Props = {
  appKey: string;
  onFail: (message: string) => void;
};

// 5-1 산책 화면 전용 카카오 웹 지도. 권한은 새로 묻지 않고(산책 추적이 이미 받는다), 허용되어 있을 때만 현재 위치를 따라 마커를 옮긴다.
// 경로와 마커는 트래커가 가진 이번 산책의 기록이다(앱을 다시 열면 서버에서 불러온 것까지 포함한다).
export function WalkKakaoWebMapPanel({ appKey, onFail }: Props) {
  const [position, setPosition] = useState<RoutePoint | null>(null);
  const [follow, setFollow] = useState(true);
  const snapshot = useSyncExternalStore(subscribeTracker, getTrackerSnapshot, getTrackerSnapshot);

  // 구간 나누기는 상세 화면(6-2)과 같은 규칙(walkRoute.ts)이다.
  const segments = useMemo(() => buildRouteSegments(snapshot.routePoints), [snapshot.routePoints]);
  const markers = useMemo<KakaoWebMapMarker[]>(
    () =>
      snapshot.markers.map((marker) => ({
        key: marker.key,
        type: marker.type,
        memo: marker.memo,
        latitude: marker.latitude,
        longitude: marker.longitude,
        status: marker.status,
      })),
    [snapshot.markers],
  );

  useEffect(() => {
    let active = true;
    let subscription: LocationWatch | null = null;
    (async () => {
      const granted = await hasLocationPermission();
      if (!active || !granted) return;
      subscription = await watchLocation(
        { accuracy: "balanced", timeInterval: 2000, distanceInterval: 2 },
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

  return (
    <>
      <KakaoWebMap
        appKey={appKey}
        follow={follow}
        markers={markers}
        onError={onFail}
        onUserMove={() => setFollow(false)}
        position={position}
        segments={segments}
      />
      {follow ? null : (
        <Pressable
          accessibilityLabel="내 위치로"
          accessibilityRole="button"
          onPress={() => setFollow(true)}
          style={styles.recenter}
        >
          <Icon name="icon-location" width={14} height={14} color={colors.brown} />
          <Text style={styles.recenterText}>내 위치로</Text>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  recenter: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.lightOrange,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: "absolute",
    right: 10,
    top: 10,
  },
  recenterText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 12,
  },
});
