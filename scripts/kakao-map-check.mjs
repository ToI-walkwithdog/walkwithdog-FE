// PC에서 카카오 지도 JS 키와 도메인 등록을 확인하는 작은 서버다.
// 실행: node scripts/kakao-map-check.mjs  →  http://localhost:5173
// 키는 .env.local의 EXPO_PUBLIC_KAKAO_JS_KEY에서 읽어 응답 HTML에만 넣는다. 파일에 쓰지 않고 출력하지도 않는다.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PORT = 5173;
const envPath = fileURLToPath(new URL("../.env.local", import.meta.url));

function readKey() {
  let text;
  try {
    text = readFileSync(envPath, "utf8");
  } catch {
    return null;
  }
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*EXPO_PUBLIC_KAKAO_JS_KEY\s*=\s*(.*)\s*$/);
    if (match) return match[1].replace(/^["']|["']$/g, "").trim() || null;
  }
  return null;
}

const page = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kakao map check</title>
<style>
  body { margin: 0; font: 14px/1.5 system-ui, sans-serif; }
  #map { width: 100%; height: 60vh; background: #eee; }
  #log { padding: 12px 16px; white-space: pre-wrap; }
  .ok { color: #0a7a2f; } .bad { color: #c0261c; font-weight: 600; }
</style>
</head>
<body>
<div id="map"></div>
<div id="log"></div>
<script>
  var logEl = document.getElementById("log");
  function line(text, cls) {
    var row = document.createElement("div");
    row.textContent = text;
    if (cls) row.className = cls;
    logEl.appendChild(row);
  }
  line("page origin: " + location.origin);
  var key = "__KAKAO_JS_KEY__";
  if (!key) {
    line("FAIL: EXPO_PUBLIC_KAKAO_JS_KEY is missing in .env.local", "bad");
  } else {
    var timer = setTimeout(function () {
      line("FAIL: SDK did not finish loading in 8 s (key/domain rejected, blocked, or offline)", "bad");
    }, 8000);
    window.addEventListener("error", function (event) {
      line("window error: " + event.message, "bad");
    });
    var script = document.createElement("script");
    script.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=" + encodeURIComponent(key) + "&autoload=false";
    script.onerror = function () {
      clearTimeout(timer);
      line("FAIL: sdk.js request failed (see DevTools Network tab: dapi.kakao.com status). Usually the domain " + location.origin + " is not registered for this JavaScript key, or the Kakao Map service is OFF.", "bad");
    };
    script.onload = function () {
      line("sdk.js script loaded", "ok");
      try {
        kakao.maps.load(function () {
          clearTimeout(timer);
          var center = new kakao.maps.LatLng(37.5172, 127.0473);
          var map = new kakao.maps.Map(document.getElementById("map"), { center: center, level: 4 });
          new kakao.maps.Marker({ position: center, map: map });
          line("OK: kakao.maps loaded and map created (Gangnam-gu, Seoul)", "ok");
        });
      } catch (error) {
        clearTimeout(timer);
        line("FAIL: " + (error && error.message ? error.message : String(error)), "bad");
      }
    };
    document.head.appendChild(script);
  }
</script>
</body>
</html>`;

createServer((req, res) => {
  if (req.url !== "/" && !req.url.startsWith("/?")) {
    res.writeHead(404).end("not found");
    return;
  }
  const key = readKey() ?? "";
  const html = page.replace("__KAKAO_JS_KEY__", () => key.replace(/[^A-Za-z0-9_-]/g, ""));
  res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
  res.end(html);
}).listen(PORT, "127.0.0.1", () => {
  console.log(`Kakao map check: http://localhost:${PORT}  (key ${readKey() ? "found" : "MISSING"} in .env.local)`);
});
