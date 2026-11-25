// WebView에 넣는 카카오 지도 JS SDK 페이지다. 키는 호출할 때 문자열로만 넣고 어디에도 저장하지 않는다.
// RN → 웹: window.__kakaoCmd({ type: "position", ... }), 웹 → RN: ReactNativeWebView.postMessage(JSON).
export const DEFAULT_CENTER = { latitude: 37.5172, longitude: 127.0473 };

export function buildKakaoMapHtml(appKey: string, center = DEFAULT_CENTER): string {
  const safeKey = appKey.replace(/[^A-Za-z0-9_-]/g, "");
  return `<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>html,body,#map{margin:0;width:100%;height:100%;background:#f5ecd9}</style>
</head><body><div id="map"></div>
<script>
  function send(message) {
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
  var map = null, positionMarker = null;
  window.__kakaoCmd = function (cmd) {
    if (!map) return;
    if (cmd.type === "position") {
      var latLng = new kakao.maps.LatLng(cmd.latitude, cmd.longitude);
      if (!positionMarker) positionMarker = new kakao.maps.Marker({ position: latLng, map: map });
      else positionMarker.setPosition(latLng);
      if (cmd.center) map.setCenter(latLng);
    }
  };
  window.addEventListener("error", function (event) {
    send({ type: "error", message: "window error: " + event.message });
  });
  var script = document.createElement("script");
  script.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=${safeKey}&autoload=false";
  script.onerror = function () {
    send({ type: "error", message: "sdk.js request failed (origin " + location.origin + ")" });
  };
  script.onload = function () {
    try {
      kakao.maps.load(function () {
        map = new kakao.maps.Map(document.getElementById("map"), {
          center: new kakao.maps.LatLng(${center.latitude}, ${center.longitude}),
          level: 3
        });
        send({ type: "ready", origin: location.origin });
      });
    } catch (error) {
      send({ type: "error", message: String(error && error.message || error) });
    }
  };
  document.head.appendChild(script);
</script></body></html>`;
}
