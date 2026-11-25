import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { routeForFailure } from "../../api/auth";
import type { ApiFailure } from "../../api/client";
import {
  invalidateHistoryCache,
  loadWalkResult,
  resolveLevelUp,
  resolveResultWalkId,
  setLevelUpEvent,
  walkFailureMessage,
  type WalkResult,
} from "../../api/walkResult";
import { loadWalkRoute, type WalkRoute } from "../../api/walkRoute";
import { fetchWalkSummary, putWalkPrivateMemo, type WalkSummary } from "../../api/walks";
import { Icon } from "../../components/Icon";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
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

export default function WalkRecordSaveScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [result, setResult] = useState<WalkResult | null>(null);
  const [summary, setSummary] = useState<WalkSummary | null>(null);
  const [route, setRoute] = useState<WalkRoute | null>(null);
  const [message, setMessage] = useState("");
  const [memoError, setMemoError] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkingLevel, setCheckingLevel] = useState(false);
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
    // 인계를 접수한 뒤에만 메모를 저장할 수 있다.
    if (summaryResult.data.handover_status === "NOT_CONFIRMED") {
      router.replace("/6-1");
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

  const handleMemoFailure = async (failed: ApiFailure) => {
    const target = await routeForFailure(failed);
    if (target) {
      router.replace(target);
      return;
    }
    if (failed.code === null && failed.status === 409) {
      // 인계가 아직이거나 메모가 다른 곳에서 바뀌었다. 요약을 다시 조회해 판단한다.
      const fresh = await fetchWalkSummary(walk.id);
      if (fresh.ok && fresh.data.handover_status === "NOT_CONFIRMED") {
        Alert.alert("알림", "인계를 접수한 뒤에 메모를 저장할 수 있어요.", [
          { text: "확인", onPress: () => router.replace("/6-1") },
        ]);
        return;
      }
      if (fresh.ok) {
        const latest = fresh.data.private_memo;
        memoVersion.current = latest?.version ?? 0;
        setSummary(fresh.data);
        Alert.alert("메모가 바뀌었어요", "다른 곳에서 메모가 바뀌었어요. 최신 메모를 볼까요?", [
          { text: "내 내용 유지" },
          { text: "최신 메모 보기", onPress: () => setMessage(latest?.memo ?? "") },
        ]);
        return;
      }
    }
    if (failed.code === null && (failed.status === 403 || failed.status === 404)) {
      Alert.alert("알림", walkFailureMessage(failed), [
        { text: "확인", onPress: () => router.replace("/3") },
      ]);
      return;
    }
    Alert.alert("알림", walkFailureMessage(failed));
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
      // 서버는 빈 메모를 받지 않는다. 비어 있거나 저장된 메모와 같으면 저장 요청을 보내지 않는다.
      if (text && text !== (summary.private_memo?.memo ?? "")) {
        const saved = await putWalkPrivateMemo(walk.id, text, memoVersion.current);
        if (!saved.ok) {
          await handleMemoFailure(saved);
          return;
        }
        memoVersion.current = saved.data.version;
        invalidateHistoryCache();
      }
      // 서버의 레벨 평가를 확인한다. 평가가 끝나기를 정해진 횟수만 기다리고, 레벨업이 없으면 이력으로 간다.
      setCheckingLevel(true);
      const fresh = await fetchWalkSummary(walk.id);
      const event = fresh.ok
        ? await resolveLevelUp(walk.id, walk, fresh.data, () => cancelledRef.current)
        : null;
      if (cancelledRef.current) return;
      if (event) {
        setLevelUpEvent(event);
        router.replace("/6-3");
        return;
      }
      router.replace("/9-1");
    } finally {
      savingRef.current = false;
      setSaving(false);
      setCheckingLevel(false);
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
                  {checkingLevel ? "레벨을 확인하는 중..." : saving ? "저장하는 중..." : "산책 기록 저장"}
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
