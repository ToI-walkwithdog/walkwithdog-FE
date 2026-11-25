import { useCallback, useEffect, useMemo, useRef, type ComponentType, type Ref } from "react";
import { StyleSheet } from "react-native";
import { WebView as BaseWebView, type WebViewMessageEvent, type WebViewProps } from "react-native-webview";

import type { RoutePoint } from "../api/walkRoute";
import type { MarkerType } from "../api/walks";
import { buildKakaoMapHtml, DEFAULT_CENTER } from "./kakaoWebMapHtml";

// react-native-webview의 타입에는 ref가 없지만 런타임에서는 injectJavaScript를 가진 ref를 받는다.
type WebViewHandle = { injectJavaScript: (script: string) => void };
const WebView = BaseWebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebViewHandle> }>;

export type KakaoWebMapMarker = { id: number; type: MarkerType } & RoutePoint;

type Props = {
  appKey: string;
  position: RoutePoint | null;
  // 아래 세 값은 자리만 잡아 둔 것이다(3단계). 아직 지도에 그리지 않는다.
  segments?: RoutePoint[][];
  markers?: KakaoWebMapMarker[];
  follow?: boolean;
  onReady?: () => void;
  onError?: (message: string) => void;
};

// 카카오 JS 키는 등록한 사이트 도메인에서만 쓸 수 있다. WebView에는 진짜 도메인이 없어서 baseUrl로 출처를 정한다.
// 이 값을 카카오 콘솔의 Web 플랫폼에 등록해야 한다. 기본값은 PC 확인 페이지(scripts/kakao-map-check.mjs)와 같다.
const BASE_URL = process.env.EXPO_PUBLIC_KAKAO_WEB_BASE_URL ?? "http://localhost:5173";
const LOAD_TIMEOUT_MS = 8000;

export function KakaoWebMap({ appKey, position, onReady, onError }: Props) {
  const webViewRef = useRef<WebViewHandle>(null);
  const readyRef = useRef(false);
  const settledRef = useRef(false);
  const centeredRef = useRef(false);
  const positionRef = useRef(position);
  positionRef.current = position;
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  // HTML은 키가 바뀔 때만 다시 만든다. 위치 변화는 아래 injectJavaScript로만 보낸다.
  const html = useMemo(() => buildKakaoMapHtml(appKey, positionRef.current ?? DEFAULT_CENTER), [appKey]);

  const fail = useCallback((message: string) => {
    if (settledRef.current) return;
    settledRef.current = true;
    onErrorRef.current?.(message);
  }, []);

  const pushPosition = useCallback(() => {
    const current = positionRef.current;
    if (!readyRef.current || !current) return;
    // 첫 위치에서만 지도 중심을 옮기고, 이후에는 마커만 옮긴다(카메라 따라가기는 3단계).
    const center = !centeredRef.current;
    centeredRef.current = true;
    webViewRef.current?.injectJavaScript(
      `window.__kakaoCmd(${JSON.stringify({ type: "position", ...current, center })});true;`,
    );
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!readyRef.current) fail(`지도 SDK가 ${LOAD_TIMEOUT_MS / 1000}초 안에 열리지 않았습니다.`);
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [fail]);

  useEffect(() => {
    pushPosition();
  }, [position, pushPosition]);

  const handleMessage = (event: WebViewMessageEvent) => {
    let message: { type?: string; message?: string };
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (message.type === "ready") {
      readyRef.current = true;
      if (!settledRef.current) {
        settledRef.current = true;
        onReadyRef.current?.();
      }
      pushPosition();
    } else if (message.type === "error") {
      fail(message.message ?? "지도를 열지 못했습니다.");
    }
  };

  return (
    <WebView
      ref={webViewRef}
      javaScriptEnabled
      onError={(event) => fail(event.nativeEvent.description)}
      onHttpError={(event) => fail(`HTTP ${event.nativeEvent.statusCode}`)}
      onMessage={handleMessage}
      originWhitelist={["*"]}
      source={{ html, baseUrl: BASE_URL }}
      style={StyleSheet.absoluteFill}
    />
  );
}
