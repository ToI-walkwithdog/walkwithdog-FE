// WebView에 넣는 카카오 지도 JS SDK 페이지다. 키는 호출할 때 문자열로만 넣고 어디에도 저장하지 않는다.
// RN → 웹: window.__kakaoCmds([{ t: ... }]), 웹 → RN: ReactNativeWebView.postMessage(JSON).
//   state    {segments: [[[lat,lng],...]], markers: [...], fit}  전체를 다시 그린다(처음, WebView가 다시 열렸을 때)
//   append   {i, pts}                     i번째 구간 선에 점을 이어 붙인다(없으면 새 구간)
//   marker   {m: {key, icon, status, lat, lng}}  마커를 추가하거나 바꾼다
//   markerDel {key}                       마커를 뺀다
//   position {lat, lng}                   내 위치 마커를 옮긴다(따라가기 중이면 카메라도 옮긴다)
//   follow   {on}                         카메라 따라가기를 켜고 끈다
// 웹 → RN: ready, userMoved(사용자가 지도를 끌거나 확대·축소함), error.
import { MARKER_ICON_SHAPES } from "./kakaoMarkerIcons";

export const DEFAULT_CENTER = { latitude: 37.5172, longitude: 127.0473 };

export type KakaoMapHtmlOptions = {
  center?: { latitude: number; longitude: number };
  routeColor: string;
  markerBorderColor: string;
  markerIconColor: string;
  readOnly: boolean;
};

export function buildKakaoMapHtml(appKey: string, options: KakaoMapHtmlOptions): string {
  const safeKey = appKey.replace(/[^A-Za-z0-9_-]/g, "");
  const center = options.center ?? DEFAULT_CENTER;
  // </script>로 페이지가 끊기지 않도록 "<"를 이스케이프한다.
  const config = JSON.stringify({
    center,
    routeColor: options.routeColor,
    markerBorderColor: options.markerBorderColor,
    markerIconColor: options.markerIconColor,
    readOnly: options.readOnly,
    icons: MARKER_ICON_SHAPES,
  }).replace(/</g, "\\u003c");
  return `<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
  html,body,#map{margin:0;width:100%;height:100%;background:#f5ecd9}
  .pin{width:32px;height:32px;border-radius:16px;box-sizing:border-box;background:#fff;display:flex;align-items:center;justify-content:center}
  .pin.pending{opacity:.6}
</style>
</head><body><div id="map"></div>
<script>
  var CFG = ${config};
  function send(message) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
  var map = null, positionMarker = null, lastPosition = null;
  var polylines = [], markers = {};
  var following = false, firstFix = false;

  function ll(pt) { return new kakao.maps.LatLng(pt[0], pt[1]); }

  function clearAll() {
    polylines.forEach(function (line) { line.setMap(null); });
    polylines = [];
    Object.keys(markers).forEach(function (key) { markers[key].setMap(null); });
    markers = {};
  }

  function appendSegment(i, pts) {
    var added = pts.map(ll);
    if (!polylines[i]) {
      polylines[i] = new kakao.maps.Polyline({
        map: map, path: added, strokeWeight: 6, strokeColor: CFG.routeColor,
        strokeOpacity: 1, strokeStyle: "solid"
      });
    } else {
      var path = polylines[i].getPath();
      polylines[i].setPath(path.concat(added));
    }
  }

  function pinElement(m) {
    var shape = CFG.icons[m.icon] || CFG.icons.OTHER;
    var d = document.createElement("div");
    d.className = "pin" + (m.status === "pending" ? " pending" : "");
    d.style.border = "1.5px solid " + CFG.markerBorderColor;
    var size = shape.viewBox.split(" ")[2] > 20 ? 18 : 16;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="' + shape.viewBox + '" fill="' + CFG.markerIconColor + '">';
    shape.paths.forEach(function (p) {
      svg += '<path d="' + p + '"' + (shape.evenodd ? ' fill-rule="evenodd" clip-rule="evenodd"' : '') + '/>';
    });
    d.innerHTML = svg + '</svg>';
    return d;
  }

  function upsertMarker(m) {
    if (markers[m.key]) markers[m.key].setMap(null);
    markers[m.key] = new kakao.maps.CustomOverlay({
      map: map, position: new kakao.maps.LatLng(m.lat, m.lng), content: pinElement(m),
      xAnchor: 0.5, yAnchor: 0.5, zIndex: 3
    });
  }

  function fitAll() {
    var bounds = new kakao.maps.LatLngBounds();
    var any = false;
    polylines.forEach(function (line) {
      line.getPath().forEach(function (p) { bounds.extend(p); any = true; });
    });
    Object.keys(markers).forEach(function (key) { bounds.extend(markers[key].getPosition()); any = true; });
    if (any) map.setBounds(bounds, 40, 40, 40, 40);
  }

  function moveCamera() {
    if (!following || !lastPosition) return;
    var target = ll(lastPosition);
    if (!firstFix) { firstFix = true; map.setLevel(3); map.setCenter(target); }
    else map.panTo(target);
  }

  function run(cmd) {
    switch (cmd.t) {
      case "state":
        clearAll();
        (cmd.segments || []).forEach(function (pts, i) { if (pts.length) appendSegment(i, pts); });
        (cmd.markers || []).forEach(upsertMarker);
        if (cmd.fit) fitAll();
        break;
      case "append": appendSegment(cmd.i, cmd.pts); break;
      case "marker": upsertMarker(cmd.m); break;
      case "markerDel":
        if (markers[cmd.key]) { markers[cmd.key].setMap(null); delete markers[cmd.key]; }
        break;
      case "position":
        lastPosition = [cmd.lat, cmd.lng];
        if (!positionMarker) positionMarker = new kakao.maps.Marker({ position: ll(lastPosition), map: map });
        else positionMarker.setPosition(ll(lastPosition));
        moveCamera();
        break;
      case "follow":
        following = !!cmd.on;
        if (following) moveCamera();
        break;
    }
  }

  window.__kakaoCmds = function (cmds) {
    if (!map || !Array.isArray(cmds)) return;
    cmds.forEach(function (cmd) {
      try { run(cmd); } catch (e) { send({ type: "error", message: "cmd " + cmd.t + ": " + (e && e.message) }); }
    });
  };

  function userMoved() {
    if (!following) return;
    following = false;
    send({ type: "userMoved" });
  }

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
          center: new kakao.maps.LatLng(CFG.center.latitude, CFG.center.longitude),
          level: 3
        });
        if (!CFG.readOnly) {
          // 끌기, 두 손가락 확대·축소, 휠은 사용자가 한 일이다. 코드가 부르는 panTo/setLevel은 여기에 걸리지 않는다.
          kakao.maps.event.addListener(map, "dragstart", userMoved);
          var el = document.getElementById("map");
          el.addEventListener("touchstart", function (e) { if (e.touches.length > 1) userMoved(); }, { passive: true });
          el.addEventListener("wheel", userMoved, { passive: true });
        }
        send({ type: "ready", origin: location.origin });
      });
    } catch (error) {
      send({ type: "error", message: String(error && error.message || error) });
    }
  };
  document.head.appendChild(script);
</script></body></html>`;
}
