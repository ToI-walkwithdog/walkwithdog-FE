import { StyleSheet, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";

import WalkMarkerPoop from "../assets/icons/walk-marker-poop.svg";
import WalkMarkerSniff from "../assets/icons/walk-marker-sniff.svg";
import type { RoutePoint } from "../api/walkRoute";
import type { MarkerType } from "../api/walks";
import { colors } from "../theme/tokens";
import { Icon } from "./Icon";

export type RouteMarker = {
  id: number;
  type: MarkerType;
  memo: string | null;
  latitude: number;
  longitude: number;
};

type Props = {
  width: number;
  height: number;
  segments: RoutePoint[][];
  markers: RouteMarker[];
  padding?: number;
};

const MARKER_SIZE = 32;

function MarkerIcon({ marker }: { marker: RouteMarker }) {
  if (marker.type === "SNIFF") return <WalkMarkerSniff height={18} width={18} />;
  if (marker.type === "POOP") return <WalkMarkerPoop height={18} width={18} />;
  if (marker.type === "DOG_ENCOUNTER") {
    return <Icon name="icon-dog-body" width={18} height={18} color={colors.brown} />;
  }
  // 포토스팟은 OTHER + 메모 "포토스팟"으로 저장된다.
  if (marker.type === "OTHER" && marker.memo === "포토스팟") {
    return <Icon name="icon-camera" width={18} height={18} color={colors.brown} />;
  }
  return <Icon name="icon-location" width={18} height={18} color={colors.brown} />;
}

// 자리 표시 지도 그림 위에 실제 경로(폴리라인)와 마커를 그린다. 지도 이미지의 좌표와는 무관하게,
// 경로와 마커가 모두 들어오는 사각형을 자리 표시 지도 영역(width x height)에 맞춰 투영한다.
// 구간 사이(정지·재개 간격)는 선으로 잇지 않는다. 좌표가 없으면 아무것도 그리지 않는다.
export function WalkRouteMap({ width, height, segments, markers, padding = 44 }: Props) {
  const routePoints = segments.flat();
  if (routePoints.length === 0) return null;

  const all = [...routePoints, ...markers];
  const lats = all.map((point) => point.latitude);
  const lons = all.map((point) => point.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  // 위도가 높을수록 경도 1도의 길이가 줄어드니 경도 쪽을 코사인으로 줄인다.
  const lonScale = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const spanX = (maxLon - minLon) * lonScale;
  const spanY = maxLat - minLat;
  const availableW = width - padding * 2;
  const availableH = height - padding * 2;
  const scale =
    spanX === 0 && spanY === 0
      ? 0
      : Math.min(
          spanX > 0 ? availableW / spanX : Number.POSITIVE_INFINITY,
          spanY > 0 ? availableH / spanY : Number.POSITIVE_INFINITY,
        );
  const offsetX = padding + (availableW - spanX * scale) / 2;
  const offsetY = padding + (availableH - spanY * scale) / 2;
  const project = (point: RoutePoint) => ({
    x: offsetX + (point.longitude - minLon) * lonScale * scale,
    y: offsetY + (maxLat - point.latitude) * scale,
  });

  const start = project(segments[0][0]);
  const lastSegment = segments[segments.length - 1];
  const end = project(lastSegment[lastSegment.length - 1]);

  return (
    <View pointerEvents="none" style={[styles.layer, { height, width }]}>
      <Svg height={height} width={width}>
        {segments.map((segment, index) =>
          segment.length >= 2 ? (
            <Polyline
              fill="none"
              key={index}
              points={segment
                .map((point) => {
                  const { x, y } = project(point);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(" ")}
              stroke={colors.deepOrange}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={4}
            />
          ) : null,
        )}
        <Circle cx={start.x} cy={start.y} fill={colors.brown} r={7.5} stroke={colors.white} strokeWidth={2} />
        <Circle cx={end.x} cy={end.y} fill={colors.orange} r={7.5} stroke={colors.white} strokeWidth={2} />
      </Svg>
      {markers.map((marker) => {
        const { x, y } = project(marker);
        return (
          <View
            key={marker.id}
            style={[styles.marker, { left: x - MARKER_SIZE / 2, top: y - MARKER_SIZE / 2 }]}
          >
            <MarkerIcon marker={marker} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    left: 0,
    position: "absolute",
    top: 0,
  },
  marker: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.lightOrange,
    borderRadius: MARKER_SIZE / 2,
    borderWidth: 1.5,
    height: MARKER_SIZE,
    justifyContent: "center",
    position: "absolute",
    width: MARKER_SIZE,
  },
});
