import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ComponentType,
  type Ref,
} from "react";
import { StyleSheet } from "react-native";
import { WebView as BaseWebView, type WebViewMessageEvent, type WebViewProps } from "react-native-webview";

import type { RoutePoint } from "../api/walkRoute";
import type { MarkerType } from "../api/walks";
import { colors } from "../theme/tokens";
import { buildKakaoMapHtml, DEFAULT_CENTER } from "./kakaoWebMapHtml";

// react-native-webview의 타입에는 ref가 없지만 런타임에서는 injectJavaScript와 reload를 가진 ref를 받는다.
type WebViewHandle = { injectJavaScript: (script: string) => void; reload: () => void };
const WebView = BaseWebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebViewHandle> }>;

// 지도에 그리는 마커 한 개. key가 같으면 같은 마커다(새로 만든 마커는 client_marker_id).
export type KakaoWebMapMarker = {
  key: string;
  type: MarkerType;
  memo: string | null;
  latitude: number;
  longitude: number;
  status: "pending" | "saved";
};

type Props = {
  appKey: string;
  position?: RoutePoint | null;
  segments?: RoutePoint[][];
  markers?: KakaoWebMapMarker[];
  follow?: boolean;
  // 저장된 경로를 보여 주는 모드: 내 위치와 따라가기 없이 경로 전체가 들어오게 맞춘다.
  readOnly?: boolean;
  onReady?: () => void;
  onError?: (message: string) => void;
  // 사용자가 지도를 끌거나 확대·축소해서 따라가기가 풀렸다.
  onUserMove?: () => void;
};

// 카카오 JS 키는 등록한 사이트 도메인에서만 쓸 수 있다. WebView에는 진짜 도메인이 없어서 baseUrl로 출처를 정한다.
// 이 값을 카카오 콘솔의 Web 플랫폼에 등록해야 한다. 기본값은 PC 확인 페이지(scripts/kakao-map-check.mjs)와 같다.
const BASE_URL = process.env.EXPO_PUBLIC_KAKAO_WEB_BASE_URL ?? "http://localhost:5173";
const LOAD_TIMEOUT_MS = 8000;
// 경로 선은 이 간격으로 모아서 보낸다. 마커와 내 위치는 바로 보낸다.
const ROUTE_FLUSH_MS = 1000;
const MAX_ERROR_LENGTH = 200;

// 앱의 마커 종류를 지도 아이콘으로 옮긴다. 포토스팟은 OTHER + 메모 "포토스팟"이다.
function iconFor(marker: KakaoWebMapMarker): string {
  if (marker.type === "OTHER" && marker.memo === "포토스팟") return "PHOTO";
  if (marker.type === "SNIFF" || marker.type === "POOP" || marker.type === "DOG_ENCOUNTER") return marker.type;
  return "OTHER";
}

function toWebMarker(marker: KakaoWebMapMarker) {
  return {
    key: marker.key,
    icon: iconFor(marker),
    status: marker.status,
    lat: marker.latitude,
    lng: marker.longitude,
  };
}

type Sent = { segmentLengths: number[]; markers: Map<string, KakaoWebMapMarker["status"]> };

export function KakaoWebMap({
  appKey,
  position = null,
  segments = [],
  markers = [],
  follow = false,
  readOnly = false,
  onReady,
  onError,
  onUserMove,
}: Props) {
  const webViewRef = useRef<WebViewHandle>(null);
  const readyRef = useRef(false);
  const settledRef = useRef(false);
  const sentRef = useRef<Sent>({ segmentLengths: [], markers: new Map() });
  const lastRouteFlushRef = useRef(0);
  const routeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 가장 최근 props. 타이머와 메시지 처리에서 오래된 값을 쓰지 않으려고 ref에 둔다.
  const latest = useRef({ position, segments, markers, follow, readOnly, onReady, onError, onUserMove });
  latest.current = { position, segments, markers, follow, readOnly, onReady, onError, onUserMove };

  // HTML은 키와 모드가 바뀔 때만 다시 만든다. 이후 변화는 아래 injectJavaScript로만 보낸다.
  const html = useMemo(
    () =>
      buildKakaoMapHtml(appKey, {
        center: latest.current.position ?? DEFAULT_CENTER,
        routeColor: colors.deepOrange,
        markerBorderColor: colors.lightOrange,
        markerIconColor: colors.brown,
        readOnly,
      }),
    [appKey, readOnly],
  );

  const fail = useCallback((message: string) => {
    if (settledRef.current) return;
    settledRef.current = true;
    latest.current.onError?.(message.slice(0, MAX_ERROR_LENGTH));
  }, []);

  const inject = useCallback((cmds: unknown[]) => {
    if (!readyRef.current || cmds.length === 0) return;
    webViewRef.current?.injectJavaScript(`window.__kakaoCmds(${JSON.stringify(cmds)});true;`);
  }, []);

  // 지도에 이미 보낸 것과 비교해 바뀐 만큼만 보낸다. 줄어들었거나 구간이 바뀐 경우에만 전체를 다시 보낸다.
  const syncRoute = useCallback(() => {
    if (!readyRef.current) return;
    lastRouteFlushRef.current = Date.now();
    const { segments: current, readOnly: ro } = latest.current;
    const sent = sentRef.current;
    const shrank =
      current.length < sent.segmentLengths.length ||
      sent.segmentLengths.some((length, index) => current[index].length < length);
    if (shrank) {
      fullSync();
      return;
    }
    const cmds: unknown[] = [];
    current.forEach((segment, index) => {
      const sentLength = sent.segmentLengths[index] ?? 0;
      if (segment.length > sentLength) {
        cmds.push({
          t: "append",
          i: index,
          pts: segment.slice(sentLength).map((point) => [point.latitude, point.longitude]),
        });
        sent.segmentLengths[index] = segment.length;
      }
    });
    if (ro && cmds.length > 0) {
      fullSync();
      return;
    }
    inject(cmds);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
  }, [inject]);

  const scheduleRouteSync = useCallback(() => {
    if (routeTimerRef.current) return;
    const wait = Math.max(0, lastRouteFlushRef.current + ROUTE_FLUSH_MS - Date.now());
    routeTimerRef.current = setTimeout(() => {
      routeTimerRef.current = null;
      syncRoute();
    }, wait);
  }, [syncRoute]);

  const syncMarkers = useCallback(() => {
    if (!readyRef.current) return;
    const { markers: current } = latest.current;
    const sent = sentRef.current.markers;
    const cmds: unknown[] = [];
    const keys = new Set<string>();
    for (const marker of current) {
      keys.add(marker.key);
      if (sent.get(marker.key) !== marker.status) {
        cmds.push({ t: "marker", m: toWebMarker(marker) });
        sent.set(marker.key, marker.status);
      }
    }
    for (const key of [...sent.keys()]) {
      if (!keys.has(key)) {
        cmds.push({ t: "markerDel", key });
        sent.delete(key);
      }
    }
    inject(cmds);
  }, [inject]);

  // 페이지가 (다시) 열렸을 때 전체 상태를 한 번 보낸다.
  function fullSync() {
    const { segments: current, markers: currentMarkers, follow: following, position: here, readOnly: ro } =
      latest.current;
    sentRef.current = {
      segmentLengths: current.map((segment) => segment.length),
      markers: new Map(currentMarkers.map((marker) => [marker.key, marker.status])),
    };
    const cmds: unknown[] = [
      {
        t: "state",
        segments: current.map((segment) => segment.map((point) => [point.latitude, point.longitude])),
        markers: currentMarkers.map(toWebMarker),
        fit: ro && current.some((segment) => segment.length > 0),
      },
    ];
    if (!ro) {
      cmds.push({ t: "follow", on: following });
      if (here) cmds.push({ t: "position", lat: here.latitude, lng: here.longitude });
    }
    inject(cmds);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!readyRef.current) fail(`지도 SDK가 ${LOAD_TIMEOUT_MS / 1000}초 안에 열리지 않았습니다.`);
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [fail]);

  useEffect(
    () => () => {
      if (routeTimerRef.current) clearTimeout(routeTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (readyRef.current) scheduleRouteSync();
  }, [segments, scheduleRouteSync]);

  useEffect(() => {
    syncMarkers();
  }, [markers, syncMarkers]);

  useEffect(() => {
    if (readOnly || !position) return;
    inject([{ t: "position", lat: position.latitude, lng: position.longitude }]);
  }, [position, readOnly, inject]);

  useEffect(() => {
    if (readOnly) return;
    inject([{ t: "follow", on: follow }]);
  }, [follow, readOnly, inject]);

  // WebView에서 오는 메시지는 모양을 확인하고, 모르는 종류는 무시한다.
  const handleMessage = (event: WebViewMessageEvent) => {
    let message: unknown;
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (typeof message !== "object" || message === null) return;
    const { type, message: text } = message as { type?: unknown; message?: unknown };
    if (type === "ready") {
      readyRef.current = true;
      if (!settledRef.current) {
        settledRef.current = true;
        latest.current.onReady?.();
      }
      // 처음 열렸을 때와 WebView가 다시 열렸을 때 모두 전체 상태를 한 번 보낸다.
      fullSync();
    } else if (type === "userMoved") {
      latest.current.onUserMove?.();
    } else if (type === "error") {
      fail(typeof text === "string" ? text : "지도를 열지 못했습니다.");
    }
  };

  // WebView 프로세스가 죽으면(메모리 부족 등) 다시 열고, 다시 열리면 ready에서 전체 상태를 보낸다.
  const reload = () => {
    readyRef.current = false;
    webViewRef.current?.reload();
  };

  return (
    <WebView
      ref={webViewRef}
      javaScriptEnabled
      onContentProcessDidTerminate={reload}
      onError={(event) => fail(event.nativeEvent.description)}
      onHttpError={(event) => fail(`HTTP ${event.nativeEvent.statusCode}`)}
      onMessage={handleMessage}
      onRenderProcessGone={reload}
      originWhitelist={["*"]}
      source={{ html, baseUrl: BASE_URL }}
      style={StyleSheet.absoluteFill}
    />
  );
}
