import { useEffect, useState } from "react";
import * as Location from "expo-location";
import {
  KakaoMapView,
  initializeKakaoMapSDK,
  type CameraOptions,
} from "@react-native-kakao/map";
import { StyleSheet, Text, View } from "react-native";

import { colors, radii, typography } from "../theme/tokens";
import { fontFamilies } from "../theme/typography";

const defaultCamera: CameraOptions = {
  latitude: 37.5665,
  longitude: 126.978,
  zoomLevel: 16,
};

const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;

export function KakaoWalkMap() {
  const [initialized, setInitialized] = useState(false);
  const [camera, setCamera] = useState(defaultCamera);
  const [mapError, setMapError] = useState<string | null>(null);
  const [locationWarning, setLocationWarning] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!kakaoNativeAppKey) {
      setMapError("EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY를 설정해 주세요.");
      return () => {
        active = false;
      };
    }

    initializeKakaoMapSDK(kakaoNativeAppKey).then(
      () => {
        if (active) {
          setInitialized(true);
        }
      },
      (error: Error) => {
        if (active) {
          setMapError(`카카오 지도 초기화에 실패했습니다: ${error.message}`);
        }
      },
    );

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    let active = true;

    const centerOnCurrentLocation = async () => {
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (permission.status !== "granted") {
          if (active) {
            setLocationWarning(
              "위치 권한이 없어 서울시청 주변 지도를 표시합니다.",
            );
          }
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (active) {
          setCamera({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            zoomLevel: 17,
          });
        }
      } catch (error) {
        if (active) {
          const message =
            error instanceof Error ? error.message : "알 수 없는 오류";
          setLocationWarning(`현재 위치를 가져오지 못했습니다: ${message}`);
        }
      }
    };

    void centerOnCurrentLocation();

    return () => {
      active = false;
    };
  }, [initialized]);

  if (mapError) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.messageLayer]}>
        <Text style={styles.errorText}>{mapError}</Text>
      </View>
    );
  }

  if (!initialized) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.messageLayer]}>
        <Text style={styles.messageText}>카카오 지도를 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <>
      <KakaoMapView
        camera={camera}
        initialCamera={defaultCamera}
        onError={(error) =>
          setMapError(
            `카카오 지도 오류 (${error.code}): ${error.message}`,
          )
        }
        options={{ language: "ko", mapType: "normal" }}
        style={StyleSheet.absoluteFill}
      />
      {locationWarning ? (
        <View style={styles.locationWarning}>
          <Text style={styles.messageText}>{locationWarning}</Text>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  messageLayer: {
    alignItems: "center",
    backgroundColor: colors.cream,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  messageText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.small,
    textAlign: "center",
  },
  errorText: {
    color: colors.warning,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.small,
    textAlign: "center",
  },
  locationWarning: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    left: 12,
    padding: 12,
    position: "absolute",
    right: 12,
    top: 12,
  },
});
