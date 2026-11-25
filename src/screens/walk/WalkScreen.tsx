import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Animated,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { routeForFailure } from "../../api/auth";
import type { ApiFailure } from "../../api/client";
import { errorMessage } from "../../api/errorMessages";
import { fetchWalkRequestDetail } from "../../api/walkRequests";
import { incidentTypeForLabel, MARKER_ITEMS } from "../../api/walkCodes";
import { getWalkContext, setWalkContext, type WalkContext } from "../../api/walkSession";
import {
  discardWalk,
  GPS_LOST_AFTER_MS,
  pauseTracking,
  prepareIncident,
  recoverWalk,
  resumeTracking,
  sendMarker,
  startLocation,
} from "../../api/walkTracker";
import { Icon } from "../../components/Icon";
import { GradientView } from "../../components/GradientView";
import { Screen } from "../../components/Screen";
import { dogImageSource } from "../../utils/dogImage";
import { endWalkWithConfirm, sendPendingIncident } from "./walkFlow";
import { useWalkTracker } from "./useWalkTracker";
import { WalkKakaoWebMapPanel } from "./WalkKakaoWebMapPanel";
import WalkRouteLine from "../../assets/icons/walk-route-line.svg";
import WalkRouteLocation from "../../assets/icons/walk-route-location.svg";
import WalkRouteDot from "../../assets/icons/walk-route-dot.svg";
import WalkMarkerSniff from "../../assets/icons/walk-marker-sniff.svg";
import WalkMarkerPoop from "../../assets/icons/walk-marker-poop.svg";
import { colors, radii, shadows, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";

const walkingMap = require("../../assets/images/walking-map.png");
const USE_WALK_MAP_MOCKUP =
  process.env.EXPO_PUBLIC_WALK_MAP_MOCKUP !== "false";
const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY;
// 증명용(PoC) 카카오 웹 지도. 기본은 꺼짐이고, 켜면 WALK_MAP_MOCKUP보다 우선한다.
const USE_KAKAO_WEB_MAP =
  process.env.EXPO_PUBLIC_WALK_MAP_KAKAO_WEB === "true";
const KakaoWalkMap = lazy(() =>
  import("../../components/KakaoWalkMap").then((module) => ({
    default: module.KakaoWalkMap,
  })),
);

// 라우트가 처음 보여 줄 모습이다(5-1 active, 5-2 paused, 5-4 plusMenu, 5-5 report).
// 화면 안에서는 기록 상태(recordingState)와 메뉴 상태(overlayState)를 따로 둔다.
export type WalkState = "active" | "paused" | "plusMenu" | "report";

// 메뉴나 시트를 열고 닫는 것만 나타낸다. 열고 닫아도 GPS 기록은 멈추거나 다시 시작되지 않는다.
type OverlayState = "none" | "plusMenu" | "report";

type WalkScreenProps = {
  initialState?: WalkState;
};

const plusItems = [
  { label: "냄새 맡기", icon: "sniff" as const, top: 24, labelWidth: 71 },
  { label: "배변", icon: "poop" as const, top: 72, labelWidth: 48 },
  {
    label: "다른 개",
    icon: "icon-dog-body" as const,
    top: 120,
    labelWidth: 59,
  },
  {
    label: "포토스팟",
    icon: "icon-camera" as const,
    top: 168,
    labelWidth: 68,
  },
] as const;

export default function WalkScreen({ initialState = "active" }: WalkScreenProps) {
  const router = useRouter();
  const { closeReport } = useLocalSearchParams<{ closeReport?: string }>();
  // overlayState: 메뉴와 시트. recordingState(기록 중/정지)는 트래커의 snapshot.paused가 유일한 출처다.
  const [overlay, setOverlay] = useState<OverlayState>(
    initialState === "plusMenu" || initialState === "report" ? initialState : "none",
  );
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [loadFailure, setLoadFailure] = useState<ApiFailure | null>(null);
  const [context, setContext] = useState<WalkContext | null>(getWalkContext());
  const [markerBusy, setMarkerBusy] = useState(false);
  // 카카오 웹 지도가 열리지 않으면(키 없음 포함) 기존 자리 표시 지도로 되돌린다.
  const [webMapFailed, setWebMapFailed] = useState(!KAKAO_JS_KEY);
  const useKakaoWeb = USE_KAKAO_WEB_MAP && !webMapFailed;
  const showMockup = USE_KAKAO_WEB_MAP ? !useKakaoWeb : USE_WALK_MAP_MOCKUP;
  const [reportBusy, setReportBusy] = useState(false);
  const [endBusy, setEndBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const markerBusyRef = useRef(false);
  const reportBusyRef = useRef(false);
  const mountedAt = useRef(Date.now());
  const gpsLostShown = useRef(false);
  const endedHandled = useRef(false);
  const { snapshot, now, stats: walkStats } = useWalkTracker();

  // 서버의 진행 중인 산책을 불러와 이어 받는다. 앱을 다시 열었을 때도 같은 경로(recoverWalk)로 복구한다.
  const loadWalk = useCallback(async () => {
    setPhase("loading");
    const result = await recoverWalk();
    switch (result.kind) {
      case "auth":
        router.replace("/1-2");
        return;
      case "ended":
        // 서버에서 이미 끝난 산책이다. 안내와 이동은 아래 snapshot.ended 효과가 맡는다.
        return;
      case "none":
        discardWalk();
        Alert.alert("알림", "진행 중인 산책이 없어요.", [
          { text: "확인", onPress: () => router.replace("/3") },
        ]);
        return;
      case "error":
        setLoadFailure(result.failure);
        setPhase("error");
        return;
    }
    const active = result.active;
    void startLocation();
    if (initialState === "paused") pauseTracking();
    setPhase("ready");
    const cached = getWalkContext();
    if (cached && cached.walkRequestId === active.walk_request_id) {
      setContext(cached);
      return;
    }
    const detail = await fetchWalkRequestDetail(active.walk_request_id);
    if (detail.ok) {
      const next: WalkContext = {
        walkRequestId: detail.data.id,
        dogName: detail.data.dog.name,
        imageUrl: detail.data.dog.image_url,
        shelterName: detail.data.shelter?.name ?? detail.data.shelter_name ?? "",
        shelterPhone: detail.data.confirmed_visit?.phone ?? null,
      };
      setWalkContext(next);
      setContext(next);
    }
  }, [initialState, router]);

  useEffect(() => {
    void loadWalk();
  }, [loadWalk]);

  // 로그인이 끊겼으면 다시 로그인하게 한다. 보내지 못한 좌표는 트래커에 남고, 로그인 뒤 홈이 이 화면으로 되돌린다.
  // 서버가 이미 끝낸 산책(자동 종료 포함)이면 더 보내지 않고 안내한 뒤 결과 흐름(6-1)으로 보낸다.
  useEffect(() => {
    if (snapshot.authLost) {
      router.replace("/1-2");
      return;
    }
    const ended = snapshot.ended;
    if (!ended || endedHandled.current) return;
    endedHandled.current = true;
    const lines = [
      ended.endReason === "AUTO_TIMEOUT"
        ? "장시간 위치 기록이 수신되지 않아 산책이 자동 종료되었어요. 서버에 저장된 위치 기록까지만 산책 기록에 반영되었어요."
        : "산책이 이미 종료되었어요.",
    ];
    if (ended.unsentCount > 0) {
      lines.push(`전송하지 못한 위치 기록 ${ended.unsentCount}개는 저장되지 않았어요.`);
    }
    Alert.alert("알림", lines.join("\n"), [
      {
        text: "확인",
        onPress: () => {
          discardWalk();
          router.replace("/6-1");
        },
      },
    ]);
  }, [router, snapshot.authLost, snapshot.ended]);

  // 새 위치가 한동안 없으면 GPS 끊김 화면(5-3)으로 안내한다. 신호가 돌아오면 다시 안내할 수 있다.
  // 화면이 열린 시각부터 한 번은 기다린다. 5-3에서 돌아왔을 때 바로 다시 안내하지 않게 한다.
  const lastSignalAt = Math.max(snapshot.lastFixReceivedAt ?? 0, mountedAt.current);
  const gpsLost =
    phase === "ready" && !snapshot.paused && now - lastSignalAt > GPS_LOST_AFTER_MS;
  useEffect(() => {
    if (!gpsLost) {
      gpsLostShown.current = false;
      return;
    }
    if (!gpsLostShown.current) {
      gpsLostShown.current = true;
      router.push("/5-3");
    }
  }, [gpsLost, router]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 1800);
    return () => clearTimeout(timer);
  }, [notice]);

  const saveMarker = async (label: string) => {
    const item = MARKER_ITEMS.find((candidate) => candidate.label === label);
    if (!item || markerBusyRef.current) return;
    markerBusyRef.current = true;
    setMarkerBusy(true);
    try {
      const result = await sendMarker(item);
      if (result.ok) {
        setOverlay("none");
        setNotice(`${label}을(를) 기록했어요.`);
        return;
      }
      const route = await routeForFailure(result);
      if (route) {
        router.replace(route);
        return;
      }
      Alert.alert("알림", errorMessage(result.code));
    } finally {
      markerBusyRef.current = false;
      setMarkerBusy(false);
    }
  };

  const submitReport = async (label: string) => {
    const type = incidentTypeForLabel(label);
    if (!type || reportBusyRef.current) return;
    reportBusyRef.current = true;
    setReportBusy(true);
    try {
      prepareIncident(label, type);
      await sendPendingIncident(router);
    } finally {
      reportBusyRef.current = false;
      setReportBusy(false);
    }
  };

  const sheetTranslateY = useRef(new Animated.Value(683)).current;
  const plusTranslateX = useRef(new Animated.Value(164)).current;
  const plusOpacity = useRef(new Animated.Value(0)).current;

  const hasBottomSheet = overlay === "report";

  useEffect(() => {
    if (closeReport === "1") {
      setOverlay("none");
      router.setParams({ closeReport: "" });
    }
  }, [closeReport, router]);

  useEffect(() => {
    if (hasBottomSheet) {
      sheetTranslateY.setValue(683);
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [hasBottomSheet, sheetTranslateY]);

  useEffect(() => {
    if (overlay === "plusMenu") {
      plusTranslateX.setValue(164);
      plusOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(plusTranslateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(plusOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [plusOpacity, plusTranslateX, overlay]);

  if (phase !== "ready") {
    return (
      <Screen
        backgroundColor={colors.walkBackgroundStart}
        safeAreaEdges={[]}
        testID="screen-5-1"
      >
        <View style={styles.loadState}>
          <Text style={styles.loadStateText}>
            {phase === "error" ? errorMessage(loadFailure?.code) : "산책을 불러오는 중..."}
          </Text>
          {phase === "error" ? (
            <>
              <Pressable
                accessibilityLabel="다시 시도"
                accessibilityRole="button"
                onPress={() => void loadWalk()}
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

  const profileSource = dogImageSource(context?.imageUrl);

  return (
    <Screen
      backgroundColor={colors.walkBackgroundStart}
      safeAreaEdges={[]}
      testID={
        overlay === "plusMenu"
          ? "screen-5-4"
          : overlay === "report"
            ? "screen-5-5"
            : snapshot.paused
              ? "screen-5-2"
              : "screen-5-1"
      }
    >
      <View style={styles.root}>
        <View style={styles.contentFrame}>
          <View style={styles.profileRow}>
            <View style={styles.profilePill}>
              {profileSource ? (
                <Image accessible={false} resizeMode="cover" source={profileSource} style={styles.profileDog} />
              ) : (
                <View style={styles.profileDog}>
                  <Icon name="icon-dog" size={20} width={20} height={20} color={colors.brown2} />
                </View>
              )}
              <Text numberOfLines={1} style={styles.profileText}>
                {context ? `${context.dogName} · ${context.shelterName}` : "산책 중"}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="신고"
              accessibilityRole="button"
              onPress={() => setOverlay("report")}
              style={styles.reportButton}
            >
              <Icon name="icon-warning" width={16} height={16} color={colors.cream} />
              <Text style={styles.reportText}>신고</Text>
            </Pressable>
          </View>

          <View style={styles.mapCard}>
            {useKakaoWeb && KAKAO_JS_KEY ? (
              <WalkKakaoWebMapPanel
                appKey={KAKAO_JS_KEY}
                onFail={(message) => {
                  if (__DEV__) console.warn("Kakao web map failed:", message);
                  setWebMapFailed(true);
                }}
              />
            ) : showMockup ? (
              <Image
                accessible={false}
                resizeMode="stretch"
                source={walkingMap}
                style={styles.mapImage}
              />
            ) : (
              <Suspense fallback={<View style={StyleSheet.absoluteFill} />}>
                <KakaoWalkMap />
              </Suspense>
            )}
            {snapshot.paused ? <View style={styles.pauseOverlay} /> : null}
            {USE_KAKAO_WEB_MAP && webMapFailed ? (
              <Text style={styles.mapNotice}>카카오 지도를 열지 못해 임시 지도를 보여 드려요</Text>
            ) : null}

            {showMockup ? (
              <>
                <WalkRouteLine
                  height={283.089}
                  preserveAspectRatio="xMidYMid meet"
                  style={styles.routeLine}
                  width={47.105}
                />
                <WalkRouteLocation
                  height={23.288}
                  preserveAspectRatio="xMidYMid meet"
                  style={styles.routeLocation}
                  width={22.641}
                />
                <WalkRouteDot
                  height={18.293}
                  preserveAspectRatio="xMidYMid meet"
                  style={styles.routeDot}
                  width={18.293}
                />
                <View style={[styles.recordMarker, styles.markerSniff]}>
                  <View style={styles.recordMarkerIcon}>
                    <WalkMarkerSniff height={18} width={18} />
                  </View>
                </View>
                <View style={[styles.recordMarker, styles.markerPoop]}>
                  <View style={styles.recordMarkerIcon}>
                    <WalkMarkerPoop height={18} width={18} />
                  </View>
                </View>
              </>
            ) : null}

            {overlay === "plusMenu" ? (
              <Animated.View
                style={[
                  styles.plusMenu,
                  {
                    opacity: plusOpacity,
                    transform: [{ translateX: plusTranslateX }],
                  },
                ]}
              >
                {plusItems.map((item) => (
                  <View
                    key={item.label}
                    style={[styles.plusMenuRow, { top: item.top }]}
                  >
                    <View
                      style={[styles.plusMenuLabel, { width: item.labelWidth }]}
                    >
                      <Text style={styles.plusMenuLabelText}>{item.label}</Text>
                    </View>
                    <Pressable
                      accessibilityLabel={item.label}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: markerBusy }}
                      disabled={markerBusy}
                      onPress={() => void saveMarker(item.label)}
                      style={styles.plusMenuButton}
                    >
                      <View style={styles.plusMenuIcon}>
                        {item.icon === "sniff" ? (
                          <WalkMarkerSniff height={28} width={28} />
                        ) : item.icon === "poop" ? (
                          <WalkMarkerPoop height={28} width={28} />
                        ) : (
                          <Icon
                            name={item.icon}
                            width={28}
                            height={28}
                            color={colors.brown}
                          />
                        )}
                      </View>
                    </Pressable>
                  </View>
                ))}
              </Animated.View>
            ) : null}

            {overlay !== "plusMenu" ? (
              <Pressable
                accessibilityLabel="산책 기록 추가"
                accessibilityRole="button"
                onPress={() => setOverlay("plusMenu")}
                style={styles.addButton}
              >
                <Icon name="icon-add" width={24} height={24} color={colors.white} />
              </Pressable>
            ) : (
              <Pressable
                accessibilityLabel="산책 기록 메뉴 닫기"
                accessibilityRole="button"
                onPress={() => setOverlay("none")}
                style={styles.addButton}
              >
                <View style={styles.closeIcon}>
                  <Icon name="icon-add" width={24} height={24} color={colors.white} />
                </View>
              </Pressable>
            )}

            <View style={styles.statsCard}>
              {snapshot.paused ? (
                <View style={styles.pausedBadge}>
                  <Icon name="icon-pause" width={23} height={23} color={colors.brown} />
                  <Text style={styles.pausedBadgeText}>일시정지됨</Text>
                </View>
              ) : null}
              <View style={styles.timeBlock}>
                <Text style={styles.statLabel}>산책 시간</Text>
                <Text style={styles.timeValue}>{walkStats.time}</Text>
              </View>
              <View style={styles.metricsCard}>
                <View style={[styles.metricColumn, styles.distanceMetric]}>
                  <Text style={[styles.statLabel, styles.metricLabel]}>거리</Text>
                  <Text numberOfLines={1} style={styles.metricValue}>
                    {walkStats.distance}
                  </Text>
                </View>
                <View style={[styles.metricColumn, styles.speedMetric]}>
                  <Text style={[styles.statLabel, styles.metricLabel]}>평균 속도</Text>
                  <Text numberOfLines={1} style={styles.metricValue}>
                    {walkStats.averageSpeed}
                  </Text>
                </View>
                <View style={styles.metricDivider} />
              </View>
            </View>
          </View>

          <View style={styles.bottomControls}>
            {snapshot.paused ? (
              <Pressable
                accessibilityLabel="이어 걷개"
                accessibilityRole="button"
                onPress={() => void resumeTracking()}
                style={styles.resumeButton}
              >
                <Icon
                  name="icon-play"
                  width={12.2585}
                  height={14.9384}
                  color={colors.brown}
                />
                <Text style={styles.resumeText}>이어 걷개</Text>
              </Pressable>
            ) : (
              <GradientView token={gradientButtonWarm} style={styles.pauseButton}>
                <Pressable
                  accessibilityLabel="정지하개"
                  accessibilityRole="button"
                  onPress={() => pauseTracking()}
                  style={[styles.controlPressable, styles.pauseControlPressable]}
                >
                  <Icon
                    name="icon-pause"
                    width={14.5}
                    height={16.9167}
                    color={colors.brown}
                  />
                  <Text style={styles.pauseText}>정지하개</Text>
                </Pressable>
              </GradientView>
            )}
            <GradientView token={gradientCardCream} style={styles.stopButton}>
              <Pressable
                accessibilityLabel="종료"
                accessibilityRole="button"
                accessibilityState={{ disabled: endBusy }}
                disabled={endBusy}
                onPress={() => endWalkWithConfirm(router, setEndBusy)}
                style={styles.controlPressable}
              >
                <Icon name="icon-stop" width={16} height={16} color={colors.brown} />
                <Text style={styles.stopText}>{endBusy ? "종료 중..." : "종료"}</Text>
              </Pressable>
            </GradientView>
          </View>
        </View>

        {notice ? (
          <View pointerEvents="none" style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}

        {hasBottomSheet ? (
          <>
            <Pressable
              accessibilityLabel="시트 닫기"
              accessibilityRole="button"
              onPress={() => setOverlay("none")}
              style={styles.dimLayer}
            />
            <Animated.View
              style={[
                styles.reportSheet,
                { transform: [{ translateY: sheetTranslateY }] },
              ]}
            >
              <ReportSheet
                busy={reportBusy}
                onClose={() => setOverlay("none")}
                onOther={() => router.push("/5-5-other")}
                onResult={(report) => void submitReport(report)}
              />
            </Animated.View>
          </>
        ) : null}
      </View>
    </Screen>
  );
}

function ReportSheet({
  busy,
  onClose,
  onOther,
  onResult,
}: {
  busy: boolean;
  onClose: () => void;
  onOther: () => void;
  onResult: (report: string) => void;
}) {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState(false);
  const options = [
    { label: "도주", icon: "icon-dog" as const },
    { label: "부상", icon: "icon-medical-services" as const },
    { label: "배변봉투 부족", icon: "icon-dog-poop" as const },
    { label: "이물질 섭취", icon: "icon-warning" as const },
    { label: "기타", icon: "icon-more" as const },
  ];

  const continueReport = () => {
    if (!selectedReport) {
      setSelectionError(true);
      return;
    }

    if (selectedReport === "기타") {
      onOther();
      return;
    }

    onResult(selectedReport);
  };

  const isOtherSelected = selectedReport === "기타";

  return (
    <View style={styles.reportSheetContent}>
      <View style={styles.sheetHandle} />
      <Text style={styles.reportTitle}>어떤 상황인가요?</Text>
      <Text style={styles.reportSubtitle}>신고하면 보호소에 바로 전달돼요.</Text>
      {options.map((option, index) => (
        <Pressable
          key={option.label}
          accessibilityLabel={option.label}
          accessibilityRole="button"
          onPress={() => {
            setSelectedReport(option.label);
            setSelectionError(false);
          }}
          style={[
            styles.reportOption,
            { top: 121 + index * 70 },
            selectedReport === option.label
              ? styles.reportOptionSelected
              : styles.reportOptionDefault,
          ]}
        >
          <View style={styles.reportOptionIcon}>
            <Icon
              name={option.icon}
              width={22}
              height={22}
              color={selectedReport === option.label ? "#B2401F" : colors.brown}
            />
          </View>
          <Text
            style={[
              styles.reportOptionText,
              selectedReport === option.label
                ? styles.reportOptionTextSelected
                : null,
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
      {selectionError ? (
        <Text style={styles.reportSelectionError}>
          신고 유형을 선택해 주세요.
        </Text>
      ) : null}
      <Pressable
        accessibilityLabel={isOtherSelected ? "메시지 작성" : "신고 확인"}
        accessibilityRole="button"
        accessibilityState={{ disabled: busy }}
        disabled={busy}
        onPress={continueReport}
        style={[styles.callButton, busy && styles.busyButton]}
      >
        {isOtherSelected ? null : (
          <Icon name="icon-phone" width={24} height={24} color={colors.brown} />
        )}
        <Text style={styles.callButtonText}>
          {busy ? "전송 중..." : isOtherSelected ? "메시지 작성" : "신고 확인"}
        </Text>
      </Pressable>
      <Pressable accessibilityLabel="취소" accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>취소</Text>
      </Pressable>
    </View>
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
  notice: {
    alignSelf: "center",
    backgroundColor: colors.brown,
    borderRadius: 20,
    bottom: 130,
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: "absolute",
    zIndex: 60,
  },
  noticeText: {
    color: colors.white,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.body,
  },
  busyButton: {
    opacity: 0.5,
  },
  root: {
    flex: 1,
    width: "100%",
  },
  contentFrame: {
    alignSelf: "center",
    flex: 1,
    width: 375,
  },
  profileRow: {
    alignSelf: "center",
    height: 58,
    left: 20,
    position: "absolute",
    right: 20,
    top: 18,
    zIndex: 20,
  },
  profilePill: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    borderRadius: 29,
    flexDirection: "row",
    height: 39,
    left: 8,
    paddingHorizontal: 6,
    position: "absolute",
    top: 15,
    width: 232,
  },
  profileDog: {
    alignItems: "center",
    borderRadius: 13,
    height: 26,
    justifyContent: "center",
    width: 26,
  },
  profileText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 18,
    marginLeft: 4,
  },
  reportButton: {
    alignItems: "center",
    backgroundColor: colors.reportRed,
    borderRadius: 25,
    flexDirection: "row",
    gap: 4,
    height: 39,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: 15,
    width: 73,
  },
  reportText: {
    color: colors.cream,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
    lineHeight: 25,
  },
  mapCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.large,
    height: 634,
    left: 16,
    overflow: "hidden",
    position: "absolute",
    top: 18,
    width: 343,
  },
  mapNotice: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: radii.large,
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 11,
    left: 8,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
    position: "absolute",
    top: 8,
  },
  mapImage: {
    height: 743,
    left: 0,
    position: "absolute",
    top: -45,
    width: 343,
  },
  routeLine: {
    left: 190,
    position: "absolute",
    top: 125,
  },
  routeLocation: {
    left: 207,
    position: "absolute",
    top: 178,
  },
  routeDot: {
    left: 216,
    position: "absolute",
    top: 404,
  },
  markerSniff: {
    left: 212,
    position: "absolute",
    top: 258,
  },
  markerPoop: {
    left: 174,
    position: "absolute",
    top: 360,
  },
  recordMarker: {
    backgroundColor: colors.white,
    borderColor: colors.lightOrange,
    borderRadius: 16,
    borderWidth: 1.5,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    width: 32,
  },
  recordMarkerIcon: {
    left: 5.5,
    position: "absolute",
    top: 5.5,
  },
  pauseOverlay: {
    backgroundColor: "#D9D9D9",
    bottom: 0,
    left: 0,
    opacity: 0.4,
    position: "absolute",
    right: 0,
    top: 0,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 28,
    elevation: 4,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    right: 16,
    shadowColor: shadows.walkAddButton.color,
    shadowOffset: {
      width: shadows.walkAddButton.offsetX,
      height: shadows.walkAddButton.offsetY,
    },
    shadowOpacity: 1,
    shadowRadius: shadows.walkAddButton.blurRadius,
    top: 462,
    width: 56,
    zIndex: 30,
  },
  closeIcon: {
    transform: [{ rotate: "45deg" }],
  },
  plusMenu: {
    height: 284,
    position: "absolute",
    right: 16,
    top: 234,
    width: 164,
    zIndex: 25,
  },
  plusMenuRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 44,
    justifyContent: "flex-end",
    left: 6,
    paddingRight: 6,
    position: "absolute",
    width: 158,
  },
  plusMenuLabel: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    marginRight: 8,
    shadowColor: "#6B4721",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  plusMenuLabelText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 13,
    lineHeight: 18,
  },
  plusMenuButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.lightOrange,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
    shadowColor: shadows.walkAddButton.color,
    shadowOffset: {
      width: shadows.walkAddButton.offsetX,
      height: shadows.walkAddButton.offsetY,
    },
    shadowOpacity: 1,
    shadowRadius: shadows.walkAddButton.blurRadius,
    elevation: 4,
  },
  plusMenuIcon: {
    transform: [{ translateX: -1 }, { translateY: -1 }],
  },
  statsCard: {
    backgroundColor: colors.white,
    borderRadius: radii.status,
    bottom: 16,
    elevation: 4,
    height: 80,
    left: 12,
    position: "absolute",
    shadowColor: shadows.walkStatus.color,
    shadowOffset: {
      width: shadows.walkStatus.offsetX,
      height: shadows.walkStatus.offsetY,
    },
    shadowOpacity: 1,
    shadowRadius: shadows.walkStatus.blurRadius,
    width: 319,
  },
  metricsCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.small,
    height: 56,
    left: 112,
    position: "absolute",
    top: 12,
    width: 195,
  },
  metricColumn: {
    alignItems: "center",
    height: 56,
    justifyContent: "center",
    paddingBottom: 2,
    position: "absolute",
    top: 0,
  },
  distanceMetric: {
    left: 0,
    width: 89,
  },
  speedMetric: {
    left: 91,
    width: 104,
  },
  metricLabel: {
    alignSelf: "stretch",
    textAlign: "center",
  },
  metricValue: {
    alignSelf: "stretch",
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.mediumTitle,
    lineHeight: 22,
    marginTop: 4,
    textAlign: "center",
  },
  metricDivider: {
    backgroundColor: colors.lightOrange,
    height: 32,
    left: 90,
    opacity: 0.55,
    position: "absolute",
    top: 12,
    width: 1,
  },
  pausedBadge: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 50,
    flexDirection: "row",
    gap: 6,
    height: 38,
    justifyContent: "center",
    left: 78,
    position: "absolute",
    top: -55,
    width: 163,
  },
  pausedBadgeText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.bodyLarge,
  },
  timeBlock: {
    alignItems: "center",
    height: 56,
    left: 8,
    position: "absolute",
    top: 13,
    width: 98,
  },
  statLabel: {
    color: colors.brown3,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.small,
    lineHeight: 16,
  },
  timeValue: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.display,
    lineHeight: 32,
    marginTop: 5,
  },
  bottomControls: {
    alignSelf: "center",
    height: 55,
    left: 24,
    position: "absolute",
    right: 24,
    top: 672,
  },
  controlPressable: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  pauseControlPressable: {
    gap: 12,
  },
  pauseButton: {
    borderRadius: radii.control,
    height: 55,
    left: 0,
    position: "absolute",
    width: 205,
  },
  pauseText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.title,
  },
  resumeButton: {
    alignItems: "center",
    backgroundColor: "#FFD47E",
    borderRadius: radii.control,
    flexDirection: "row",
    gap: 12,
    height: 55,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    width: 205,
  },
  resumeText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.title,
  },
  stopButton: {
    borderRadius: radii.control,
    height: 55,
    position: "absolute",
    right: 0,
    width: 110,
  },
  stopText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.title,
  },
  dimLayer: {
    backgroundColor: "rgba(64,43,26,0.36)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 50,
  },
  reportSheet: {
    backgroundColor: colors.cardGradientStart,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    bottom: 0,
    height: 683,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 51,
  },
  reportSheetContent: {
    alignSelf: "center",
    flex: 1,
    width: 375,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: colors.mildLightBrown,
    borderRadius: 2,
    height: 4,
    position: "absolute",
    top: 13,
    width: 42,
  },
  reportTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.screenHeading,
    left: 24,
    lineHeight: 34,
    position: "absolute",
    top: 44,
  },
  reportSubtitle: {
    color: colors.mildBrown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    left: 24,
    lineHeight: 18,
    position: "absolute",
    top: 80,
  },
  reportOption: {
    alignItems: "center",
    borderRadius: 21,
    flexDirection: "row",
    height: 58,
    left: 20,
    position: "absolute",
    width: 335,
  },
  reportOptionSelected: {
    backgroundColor: "#FFE1DB",
  },
  reportOptionDefault: {
    backgroundColor: colors.white,
  },
  reportOptionIcon: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 19,
    height: 38,
    justifyContent: "center",
    marginLeft: 12,
    width: 38,
  },
  reportOptionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
    marginLeft: 16,
  },
  reportOptionTextSelected: {
    color: "#B2401F",
  },
  reportSelectionError: {
    color: colors.warning,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.small,
    left: 20,
    lineHeight: 17,
    position: "absolute",
    top: 465,
    width: 335,
  },
  callButton: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 29,
    flexDirection: "row",
    gap: 8,
    height: 58,
    justifyContent: "center",
    left: 20,
    position: "absolute",
    top: 491,
    width: 335,
  },
  callButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
  cancelButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    left: 20,
    position: "absolute",
    top: 567,
    width: 335,
  },
  cancelButtonText: {
    color: colors.brown3,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
    textDecorationLine: "underline",
  },
  reportResultContent: {
    flex: 1,
  },
  resultIconCircle: {
    alignItems: "center",
    height: 60,
    justifyContent: "center",
    left: 20,
    position: "absolute",
    top: 29,
    width: 60,
  },
  resultTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 27,
    left: 20,
    lineHeight: 39,
    position: "absolute",
    top: 100,
  },
  resultSubtitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.subtitle,
    left: 20,
    lineHeight: 23,
    position: "absolute",
    top: 145,
  },
  resultCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    left: 20,
    padding: 18,
    position: "absolute",
    top: 210,
    width: 335,
  },
  resultCardTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
  },
  resultCardText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
  },
  resultPrimary: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    bottom: 84,
    height: 49,
    justifyContent: "center",
    left: 20,
    position: "absolute",
    width: 335,
  },
  resultPrimaryText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
  resultSecondary: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    bottom: 28,
    height: 49,
    justifyContent: "center",
    left: 20,
    position: "absolute",
    width: 335,
  },
  resultSecondaryText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
  gpsRoot: {
    flex: 1,
    width: "100%",
  },
  gpsHeader: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: 12,
    height: 56,
    marginTop: 44,
    paddingHorizontal: 16,
    width: 375,
  },
  gpsBackButton: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  gpsHeaderTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
  },
  gpsBody: {
    alignSelf: "center",
    paddingHorizontal: 20,
    width: 375,
  },
  gpsHeadline: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 26,
  },
  gpsSubheadline: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.subtitle,
    marginTop: 12,
  },
  gpsRecordCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    marginTop: 20,
    padding: 18,
  },
  gpsRecordTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 19,
  },
  gpsRecordStats: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.display,
  },
  gpsRecordHint: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
  },
  gpsNoticeCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    marginTop: 20,
    padding: 16,
  },
  gpsNoticeText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
  },
  gpsRetryHint: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    marginTop: 20,
  },
  gpsActions: {
    alignSelf: "center",
    bottom: 28,
    position: "absolute",
    width: 335,
  },
  gpsPrimary: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
  },
  gpsPrimaryText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
  gpsSecondary: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    marginTop: 12,
  },
  gpsSecondaryText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
