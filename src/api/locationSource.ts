// 산책 화면이 위치를 얻는 단 하나의 창구. 트래커(기록)와 5-1 지도 마커가 같은 곳에서 위치를 받는다.
// 기본은 expo-location 그대로이고, 개발용 가짜 GPS는 __DEV__이면서 EXPO_PUBLIC_DEV_FAKE_GPS=true일 때만 켜진다.
// __DEV__는 프로덕션 빌드에서 false라서, 환경 변수가 켜져 있어도 가짜 GPS는 프로덕션에서 동작하지 않는다.
import * as Location from "expo-location";

export type LocationSample = {
  timestamp: number;
  coords: { latitude: number; longitude: number; accuracy: number | null };
};

export type LocationWatchOptions = {
  accuracy: "high" | "balanced";
  timeInterval: number;
  distanceInterval: number;
};

export type LocationWatch = { remove: () => void };

export const FAKE_GPS = __DEV__ && process.env.EXPO_PUBLIC_DEV_FAKE_GPS === "true";

// 가짜 GPS 코드는 켰을 때만 불러온다.
function fake(): typeof import("./fakeLocation") {
  return require("./fakeLocation");
}

// 권한을 요청한다(산책 시작 때). 가짜 GPS가 켜져 있으면 실제 권한 흐름을 건드리지 않고 허용으로 본다.
export async function requestLocationPermission(): Promise<boolean> {
  if (FAKE_GPS) return true;
  const permission = await Location.requestForegroundPermissionsAsync();
  return permission.granted;
}

// 이미 허용되어 있는지만 본다(묻지 않는다).
export async function hasLocationPermission(): Promise<boolean> {
  if (FAKE_GPS) return true;
  const permission = await Location.getForegroundPermissionsAsync();
  return permission.status === "granted";
}

export async function watchLocation(
  options: LocationWatchOptions,
  onSample: (sample: LocationSample) => void,
): Promise<LocationWatch> {
  if (FAKE_GPS) return fake().watchFakeLocation(onSample);
  return Location.watchPositionAsync(
    {
      accuracy: options.accuracy === "high" ? Location.Accuracy.High : Location.Accuracy.Balanced,
      timeInterval: options.timeInterval,
      distanceInterval: options.distanceInterval,
    },
    onSample,
  );
}
