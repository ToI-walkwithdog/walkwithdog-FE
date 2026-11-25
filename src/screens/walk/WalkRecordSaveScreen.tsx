import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { routeForFailure } from "../../api/auth";
import type { ApiFailure } from "../../api/client";
import {
  invalidateHistoryCache,
  isLevelEligibleWalk,
  loadWalkResult,
  markLevelPending,
  prepareLevelUp,
  resolveLevelUp,
  resolveResultWalkId,
  walkFailureMessage,
  type WalkResult,
} from "../../api/walkResult";
import { loadWalkRoute, type WalkRoute } from "../../api/walkRoute";
import { fetchWalkSummary, putWalkPrivateMemo, type WalkSummary } from "../../api/walks";
import { Icon } from "../../components/Icon";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { KakaoWebMap, type KakaoWebMapMarker } from "../../components/KakaoWebMap";
import { WalkRouteMap, type RouteMarker } from "../../components/WalkRouteMap";
import { gradientWalkMemoCard, gradientWalkSaveButton } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { formatWalkDateTime } from "../../utils/kst";
import {
  formatDurationClock,
  formatKm,
  paceToKmh,
  toNumber,
} from "../../utils/walkFormat";

const MEMO_MAX = 1000;
// 지도 영역(styles.mapArea)과 같은 크기다.
const MAP_WIDTH = 343;
const MAP_HEIGHT = 332;

const walkingMap = require("../../assets/images/walking-map.png");
const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY;
// 5-1과 같은 플래그다. 켜면 저장된 경로를 카카오 지도에 그리고, 열리지 않으면 기존 자리 표시 지도로 되돌린다.
const USE_KAKAO_WEB_MAP = process.env.EXPO_PUBLIC_WALK_MAP_KAKAO_WEB === "true";

export default function WalkRecordSaveScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [result, setResult] = useState<WalkResult | null>(null);
  const [summary, setSummary] = useState<WalkSummary | null>(null);
  const [route, setRoute] = useState<WalkRoute | null>(null);
  const [kakaoMapFailed, setKakaoMapFailed] = useState(!KAKAO_JS_KEY);
  const [message, setMessage] = useState("");
  const [memoError, setMemoError] = useState("");
  const [saving, setSaving] = useState(false);
  // 레벨 평가를 기다리는 동안의 서버 상태. PENDING은 평가 중, FAILED는 서버가 다시 시도하는 지연이다.
  const [levelWaiting, setLevelWaiting] = useState<"PENDING" | "FAILED" | null>(null);
  const [messageInputHeight, setMessageInputHeight] = useState(73);
  const savingRef = useRef(false);
  const cancelledRef = useRef(false);
  // 서버에 저장된 메모의 버전. 메모가 없으면 0이다.
  const memoVersion = useRef(0);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const load = useCallback(async () => {
    setPhase("loading");
    const walkId = await resolveResultWalkId();
    if (walkId === null) {
      router.replace("/3");
      return;
    }
    const [loaded, summaryResult, routeResult] = await Promise.all([
      loadWalkResult(walkId),
      fetchWalkSummary(walkId),
      loadWalkRoute(walkId),
    ]);
    const failed = !loaded.ok ? loaded : !summaryResult.ok ? summaryResult : null;
    if (failed) {
      const target = await routeForFailure(failed);
      if (target) {
        router.replace(target);
        return;
      }
      setFailure(failed);
      setPhase("error");
      return;
    }
    if (!loaded.ok || !summaryResult.ok) return;
    // 메모는 인계를 접수한 산책(SELF_REPORTED, ISSUE_REPORTED)이거나 인계가 필요 없는 산책(NOT_REQUIRED)만 저장할 수 있다.
    // 인계가 필요한데 아직 접수하지 않았으면(NOT_CONFIRMED) 막고 인계부터 하게 한다.
    if (summaryResult.data.handover_status === "NOT_CONFIRMED") {
      Alert.alert("인계를 먼저 완료해 주세요", "인계를 접수한 뒤에 메모를 저장할 수 있어요.", [
        { text: "확인", onPress: () => router.replace("/6-1") },
      ]);
      return;
    }
    setResult(loaded.data);
    setSummary(summaryResult.data);
    // 경로는 못 불러와도 기록 저장은 막지 않는다. 자리 표시 지도만 보여 준다.
    setRoute(routeResult.ok ? routeResult.data : null);
    const saved = summaryResult.data.private_memo;
    memoVersion.current = saved?.version ?? 0;
    setMessage(saved?.memo ?? "");
    setPhase("ready");
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (phase !== "ready" || !result || !summary) {
    return (
      <Screen backgroundColor={colors.white} safeAreaEdges={[]} testID="screen-6-2">
        <View style={styles.loadState}>
          <Text style={styles.loadStateText}>
            {phase === "error" && failure ? walkFailureMessage(failure) : "불러오는 중..."}
          </Text>
          {phase === "error" ? (
            <>
              <Pressable
                accessibilityLabel="다시 시도"
                accessibilityRole="button"
                onPress={() => void load()}
                style={styles.loadStateButton}
              >
                <Text style={styles.loadStateButtonText}>다시 시도</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="홈으로"
                accessibilityRole="button"
                onPress={() => router.replace("/3")}
                style={styles.loadStateButton}
              >
                <Text style={styles.loadStateButtonText}>홈으로</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </Screen>
    );
  }

  const { walk } = result;
  const markers: RouteMarker[] = summary.markers.flatMap((marker) => {
    const latitude = toNumber(marker.latitude);
    const longitude = toNumber(marker.longitude);
    return latitude === null || longitude === null
      ? []
      : [{ id: marker.id, type: marker.marker_type, memo: marker.memo, latitude, longitude }];
  });

  // 카카오 지도에 그릴 경로. 점이 2개 미만이면 선을 그릴 수 없어 지도 대신 안내를 보여 준다.
  const routePointCount = route ? route.segments.reduce((sum, segment) => sum + segment.length, 0) : 0;
  const kakaoMarkers: KakaoWebMapMarker[] = markers.map((marker) => ({
    key: `srv-${marker.id}`,
    type: marker.type,
    memo: marker.memo,
    latitude: marker.latitude,
    longitude: marker.longitude,
    status: "saved",
  }));
  const showKakaoMap = USE_KAKAO_WEB_MAP && !kakaoMapFailed && route !== null && routePointCount >= 2;
  const showKakaoEmpty = USE_KAKAO_WEB_MAP && !kakaoMapFailed && route !== null && routePointCount < 2;

  // 메모를 저장한다. 계속 진행해도 되면 true, 멈춰야 하면 false를 돌려준다.
  // 첫 저장은 expected_version=0, 수정은 서버의 현재 버전을 쓴다. 서버에 이미 있는 메모를 조용히 덮어쓰지 않는다.
  const saveMemo = async (text: string): Promise<boolean> => {
    const saved = await putWalkPrivateMemo(walk.id, text, memoVersion.current);
    if (saved.ok) {
      memoVersion.current = saved.data.version;
      invalidateHistoryCache();
      return true;
    }
    const target = await routeForFailure(saved);
    if (target) {
      router.replace(target);
      return false;
    }
    if (saved.code === null && (saved.status === 403 || saved.status === 404)) {
      Alert.alert("알림", walkFailureMessage(saved), [
        { text: "확인", onPress: () => router.replace("/3") },
      ]);
      return false;
    }
    if (saved.code === null && saved.status === 422) {
      Alert.alert("알림", "메모 내용을 확인해 주세요. 메모는 비울 수 없고 1,000자까지 쓸 수 있어요.");
      return false;
    }
    // 409(버전이 다르거나 인계 전)나 응답 유실(네트워크, 시간 초과, 서버 오류)이다.
    // 실패로 단정하지 않고 요약을 다시 조회해 서버의 실제 상태로 판단한다.
    const fresh = await fetchWalkSummary(walk.id);
    if (!fresh.ok) {
      Alert.alert("알림", walkFailureMessage(saved));
      return false;
    }
    setSummary(fresh.data);
    if (fresh.data.handover_status === "NOT_CONFIRMED") {
      Alert.alert("인계를 먼저 완료해 주세요", "인계를 접수한 뒤에 메모를 저장할 수 있어요.", [
        { text: "확인", onPress: () => router.replace("/6-1") },
      ]);
      return false;
    }
    const latest = fresh.data.private_memo;
    if (latest && latest.memo === text) {
      // 응답만 유실됐고 서버에는 저장돼 있다.
      memoVersion.current = latest.version;
      invalidateHistoryCache();
      return true;
    }
    if (latest && latest.version !== memoVersion.current) {
      // 다른 곳에서 메모가 바뀌었다. 서버의 메모를 보여 주고 사용자가 정하게 한다.
      Alert.alert(
        "메모가 바뀌었어요",
        `다른 곳에서 저장한 메모가 있어요.\n\n${latest.memo}\n\n어떻게 할까요?`,
        [
          // 취소하면 버전을 그대로 두어, 다시 저장해도 같은 확인이 뜬다(조용히 덮어쓰지 않는다).
          { text: "서버 메모 사용", onPress: () => {
            memoVersion.current = latest.version;
            setMessage(latest.memo);
          } },
          { text: "내 메모로 덮어쓰기", onPress: () => {
            memoVersion.current = latest.version;
          } },
          { text: "닫기", style: "cancel" },
        ],
      );
      return false;
    }
    Alert.alert("알림", walkFailureMessage(saved));
    return false;
  };

  const save = async () => {
    if (savingRef.current) return;
    const text = message.trim();
    if (text.length > MEMO_MAX) {
      setMemoError(`메모는 ${MEMO_MAX}자 이하로 입력해 주세요.`);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      // 메모는 선택이다. 비어 있거나 저장된 메모와 같으면 저장 요청을 보내지 않는다(서버는 빈 메모를 받지 않는다).
      if (text && text !== (summary.private_memo?.memo ?? "")) {
        if (!(await saveMemo(text))) return;
      }
      // 레벨 평가는 메모와 무관하다. 평가를 확인하는 동안 서버 상태를 보여 준다.
      const fresh = await fetchWalkSummary(walk.id);
      if (!fresh.ok) {
        if (isLevelEligibleWalk(walk)) markLevelPending(walk.id);
        router.replace("/9-1");
        return;
      }
      setLevelWaiting(fresh.data.level_evaluation_status === "FAILED" ? "FAILED" : "PENDING");
      const outcome = await resolveLevelUp(
        walk.id,
        walk,
        fresh.data,
        (status) => setLevelWaiting(status),
        () => cancelledRef.current,
      );
      if (cancelledRef.current) return;
      if (outcome.kind === "level_up") {
        // 이미 본 레벨업은 다시 보여 주지 않는다.
        if (await prepareLevelUp(outcome.event)) {
          router.replace("/6-3");
          return;
        }
      } else if (outcome.kind === "needs_handover") {
        router.replace("/6-1");
        return;
      } else if (outcome.kind === "unresolved") {
        // 평가가 끝나지 않았다. 레벨업이 없다고 단정하지 않고, 이력을 다시 볼 때 확인한다.
        markLevelPending(walk.id);
        Alert.alert(
          outcome.status === "FAILED" ? "레벨 평가가 지연되고 있어요" : "레벨을 평가하고 있어요",
          "산책 기록에서 나중에 레벨 결과를 확인할 수 있어요.",
          [{ text: "확인", onPress: () => router.replace("/9-1") }],
        );
        return;
      }
      router.replace("/9-1");
    } finally {
      savingRef.current = false;
      setSaving(false);
      setLevelWaiting(null);
    }
  };

  return (
    <LinearGradient
      colors={[colors.walkBackgroundStart, colors.white]}
      end={{ x: 0, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.background}
    >
      <Screen
        backgroundColor="transparent"
        contentContainerStyle={styles.scrollContent}
        scroll
        safeAreaEdges={[]}
        testID="screen-6-2"
      >
        <View style={styles.root}>
          <View style={styles.titleArea}>
            <Text style={styles.title}>{result.dogName ? `${result.dogName}와의 산책` : "오늘의 산책"}</Text>
            <Text style={styles.date}>{formatWalkDateTime(walk.started_at)}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.mapArea}>
              {showKakaoMap && route && KAKAO_JS_KEY ? (
                <KakaoWebMap
                  appKey={KAKAO_JS_KEY}
                  markers={kakaoMarkers}
                  onError={(message) => {
                    if (__DEV__) console.warn("Kakao web map failed:", message);
                    setKakaoMapFailed(true);
                  }}
                  readOnly
                  segments={route.segments}
                />
              ) : (
                <>
              <Image
                accessible={false}
                resizeMode="stretch"
                source={walkingMap}
                style={styles.mapImage}
              />
              <LinearGradient
                colors={[colors.mapGradientStart, colors.mapGradientEnd]}
                end={{ x: 0, y: 0 }}
                locations={[0.07266, 0.3048]}
                start={{ x: 0, y: 1 }}
                style={styles.mapFade}
              />
              <View style={styles.mapTint} />
              {route && route.segments.length > 0 ? (
                <WalkRouteMap
                  height={MAP_HEIGHT}
                  markers={markers}
                  segments={route.segments}
                  width={MAP_WIDTH}
                />
              ) : null}
                </>
              )}
              {showKakaoEmpty ? (
                <Text style={styles.mapEmpty}>기록된 이동 경로가 없어요</Text>
              ) : null}
              <Pressable
                accessibilityLabel="지도 이미지 다운로드"
                accessibilityRole="button"
                onPress={() => Alert.alert("안내", "지도 이미지 다운로드는 아직 연결되지 않았어요.")}
                style={styles.downloadButton}
              >
                <Icon
                  name="icon-download"
                  size={24}
                  width={24}
                  height={24}
                  color={colors.brown}
                />
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>총 시간</Text>
                <Text style={styles.timeValue}>{formatDurationClock(walk.duration_seconds)}</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>거리</Text>
                <View style={styles.valueWithUnit}>
                  <Text style={styles.distanceValue}>{formatKm(walk.total_distance_m)}</Text>
                  <Text style={styles.orangeUnit}>km</Text>
                </View>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>평균 속도</Text>
                <View style={styles.valueWithUnit}>
                  <Text style={styles.speedValue}>{paceToKmh(walk.average_pace)}</Text>
                  <Text style={styles.orangeUnit}>km/h</Text>
                </View>
              </View>
            </View>
          </View>

          <GradientView token={gradientWalkMemoCard} style={styles.messageCard}>
            <Text style={styles.messageTitle}>작성할 메모 (보호소 미전송)</Text>
            <Text
              accessible={false}
              importantForAccessibility="no"
              onLayout={({ nativeEvent }) => {
                setMessageInputHeight(
                  Math.max(73, Math.ceil(nativeEvent.layout.height) + 28),
                );
              }}
              pointerEvents="none"
              style={[styles.messageText, styles.messageMeasurement]}
              textBreakStrategy="simple"
            >
              {message + "\u200B"}
            </Text>
            <PillTextInput
              accessibilityLabel="보호소 메시지"
              borderColor={colors.white}
              borderRadius={radii.card}
              blurOnSubmit={false}
              height={messageInputHeight}
              multiline
              onChangeText={(value) => {
                setMessage(value);
                setMemoError("");
              }}
              paddingHorizontal={14}
              placeholder={
                `${result.dogName || "강아지"}에게 하고 싶은 말과\n오늘 특이사항을 자유롭게 남겨주세요! (선택)`
              }
              placeholderColor={colors.brown}
              scrollEnabled={false}
              style={[styles.messageText, styles.messageInput]}
              submitBehavior="newline"
              textBreakStrategy="simple"
              value={message}
            />
          </GradientView>

          {memoError ? <Text style={styles.memoError}>{memoError}</Text> : null}
          <View style={styles.saveArea}>
            <GradientView token={gradientWalkSaveButton} style={styles.saveButton}>
              <Pressable
                accessibilityLabel="산책 기록 저장"
                accessibilityRole="button"
                accessibilityState={{ disabled: saving }}
                disabled={saving}
                onPress={() => void save()}
                style={[styles.saveButton, saving && styles.savingButton]}
              >
                <Text style={styles.saveButtonText}>
                  {levelWaiting === "FAILED"
                    ? "레벨 평가가 지연되고 있어요..."
                    : levelWaiting === "PENDING"
                      ? "레벨을 평가하는 중..."
                      : saving
                        ? "저장하는 중..."
                        : "산책 기록 저장"}
                </Text>
              </Pressable>
            </GradientView>
          </View>
          <View style={styles.homeIndicatorSpace} />
        </View>
      </Screen>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  loadStateText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 22,
    textAlign: "center",
    width: 300,
  },
  loadStateButton: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 44,
    justifyContent: "center",
    marginTop: 12,
    width: 200,
  },
  loadStateButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
  },
  savingButton: {
    opacity: 0.5,
  },
  memoError: {
    alignSelf: "center",
    color: colors.reportRed,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    marginTop: 8,
    width: 335,
  },
  background: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
  },
  root: {
    alignSelf: "center",
    minHeight: 792,
    width: 375,
  },
  titleArea: {
    alignSelf: "center",
    height: 78,
    position: "relative",
    width: 343,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.display,
    left: 8,
    lineHeight: 36,
    position: "absolute",
    top: 9,
  },
  date: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    left: 8,
    lineHeight: 20,
    position: "absolute",
    top: 45,
  },
  card: {
    alignSelf: "center",
    backgroundColor: colors.white,
    borderRadius: radii.large,
    height: 425,
    overflow: "hidden",
    width: 343,
  },
  mapArea: {
    backgroundColor: colors.cream,
    height: 332,
    overflow: "hidden",
    width: 343,
  },
  mapImage: {
    height: 600,
    left: 0,
    opacity: 0.75,
    position: "absolute",
    top: -140,
    width: 343,
  },
  mapEmpty: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: radii.large,
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 13,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: "absolute",
    top: 150,
  },
  mapFade: {
    height: 600,
    left: 0,
    position: "absolute",
    top: -140,
    width: 343,
  },
  mapTint: {
    backgroundColor: colors.cream,
    height: 332,
    left: 0,
    opacity: 0.25,
    position: "absolute",
    top: 0,
    width: 343,
  },
  route: {
    left: 99.55,
    position: "absolute",
    top: 45.51,
  },
  routeStart: {
    left: 183.5,
    position: "absolute",
    top: 275.5,
  },
  routeEnd: {
    left: 111.77,
    position: "absolute",
    top: 89.84,
  },
  recordMarker: {
    backgroundColor: colors.white,
    borderColor: colors.lightOrange,
    borderRadius: 16,
    borderWidth: 1.5,
    height: 32,
    position: "absolute",
    width: 32,
  },
  sniffMarker: {
    left: 160,
    top: 185,
  },
  poopMarker: {
    left: 78,
    top: 239,
  },
  dogMarker: {
    alignItems: "center",
    justifyContent: "center",
    left: 210,
    top: 132,
  },
  photoMarker: {
    alignItems: "center",
    justifyContent: "center",
    left: 157,
    top: 32,
  },
  markerIcon: {
    left: 5.5,
    position: "absolute",
    top: 5.5,
  },
  downloadButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radii.status,
    height: 40,
    justifyContent: "center",
    left: 287,
    position: "absolute",
    top: 16,
    width: 40,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    height: 93,
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  statBlock: {
    flex: 1,
    flexDirection: "column",
    gap: 5,
    minWidth: 0,
  },
  statLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.small,
    lineHeight: 18,
  },
  timeValue: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 30,
    lineHeight: 38,
  },
  valueWithUnit: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 3,
  },
  distanceValue: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 30,
    lineHeight: 38,
  },
  speedValue: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 30,
    lineHeight: 38,
  },
  orangeUnit: {
    color: colors.deepOrange,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 11,
    lineHeight: 18,
  },
  messageCard: {
    alignSelf: "center",
    minHeight: 153,
    paddingBottom: 20,
    paddingHorizontal: 18,
    paddingTop: 20,
    width: 343,
  },
  messageTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 18,
    lineHeight: 26,
  },
  messageText: {
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
    lineHeight: 22,
  },
  messageMeasurement: {
    left: 32,
    opacity: 0,
    position: "absolute",
    top: 74,
    width: 279,
  },
  messageInput: {
    borderWidth: 0,
    marginTop: 14,
    paddingBottom: 14,
    paddingTop: 14,
    textAlignVertical: "top",
    width: 307,
  },
  saveArea: {
    alignItems: "center",
    height: 104,
    padding: 24,
    width: 375,
  },
  saveButton: {
    alignItems: "center",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 327,
  },
  saveButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 18,
    lineHeight: 26,
  },
  homeIndicatorSpace: {
    height: 32,
  },
});
