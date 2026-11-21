import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Icon } from "../../components/Icon";
import { GradientView } from "../../components/GradientView";
import { Screen } from "../../components/Screen";
import WalkRouteLine from "../../assets/icons/walk-route-line.svg";
import WalkRouteLocation from "../../assets/icons/walk-route-location.svg";
import WalkRouteDot from "../../assets/icons/walk-route-dot.svg";
import WalkMarkerSniff from "../../assets/icons/walk-marker-sniff.svg";
import WalkMarkerPoop from "../../assets/icons/walk-marker-poop.svg";
import { colors, radii, shadows, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";

const walkingMap = require("../../assets/images/walking-map.png");
const kongiImage = require("../../assets/images/dog-kongi.png");

export type WalkState =
  | "active"
  | "paused"
  | "ended"
  | "plusMenu"
  | "markerSelected"
  | "report"

type WalkScreenProps = {
  initialState?: WalkState;
};

const plusItems = [
  { label: "냄새 맡기", icon: "icon-pets" as const, top: 258 },
  { label: "배변", icon: "icon-dog-poop" as const, top: 306 },
  { label: "다른 개", icon: "icon-dog" as const, top: 354 },
  { label: "포토스팟", icon: "icon-camera" as const, top: 402 },
] as const;

export default function WalkScreen({ initialState = "active" }: WalkScreenProps) {
  const router = useRouter();
  const [state, setState] = useState<WalkState>(initialState);
  const walkStats = {
    time: "24:15",
    distance: "1.8 km",
    averageSpeed: "4.5 km/h",
  };
  const sheetTranslateY = useRef(new Animated.Value(683)).current;
  const plusTranslateX = useRef(new Animated.Value(164)).current;
  const plusOpacity = useRef(new Animated.Value(0)).current;

  const hasBottomSheet = state === "report";

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
    if (state === "plusMenu" || state === "markerSelected") {
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
  }, [plusOpacity, plusTranslateX, state]);

  return (
    <Screen
      backgroundColor={colors.walkBackgroundStart}
      safeAreaEdges={[]}
      testID={
        state === "active"
          ? "screen-5-1"
          : state === "paused"
            ? "screen-5-2"
            : state === "plusMenu" || state === "markerSelected"
              ? "screen-5-4"
              : "screen-5-5"
      }
    >
      <View style={styles.root}>
        <View style={styles.profileRow}>
          <View style={styles.profilePill}>
            <Image accessible={false} resizeMode="cover" source={kongiImage} style={styles.profileDog} />
            <Text style={styles.profileText}>콩이 · 행복 보호소</Text>
          </View>
          <Pressable
            accessibilityLabel="신고"
            accessibilityRole="button"
            onPress={() => setState("report")}
            style={styles.reportButton}
          >
            <Icon name="icon-warning" width={16} height={16} color={colors.cream} />
            <Text style={styles.reportText}>신고</Text>
          </Pressable>
        </View>

        <View style={styles.mapCard}>
          <Image
            accessible={false}
            resizeMode="cover"
            source={walkingMap}
            style={styles.mapImage}
          />
          {state === "paused" ? <View style={styles.pauseOverlay} /> : null}

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
          <WalkMarkerSniff
            height={32}
            preserveAspectRatio="xMidYMid meet"
            style={styles.markerSniff}
            width={32}
          />
          <WalkMarkerPoop
            height={32}
            preserveAspectRatio="xMidYMid meet"
            style={styles.markerPoop}
            width={32}
          />

          {state === "plusMenu" || state === "markerSelected" ? (
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
                <View key={item.label} style={[styles.plusMenuRow, { top: item.top - 234 }]}>
                  <View style={styles.plusMenuLabel}>
                    <Text style={styles.plusMenuLabelText}>{item.label}</Text>
                  </View>
                  <Pressable
                    accessibilityLabel={item.label}
                    accessibilityRole="button"
                    onPress={() => setState("active")}
                    style={styles.plusMenuButton}
                  >
                    <Icon name={item.icon} width={28} height={28} color={colors.brown} />
                  </Pressable>
                </View>
              ))}
            </Animated.View>
          ) : null}

          {state !== "plusMenu" && state !== "markerSelected" ? (
            <Pressable
              accessibilityLabel="산책 기록 추가"
              accessibilityRole="button"
              onPress={() => setState("plusMenu")}
              style={styles.addButton}
            >
              <Icon name="icon-add" width={24} height={24} color={colors.white} />
            </Pressable>
          ) : (
            <Pressable
              accessibilityLabel="산책 기록 메뉴 닫기"
              accessibilityRole="button"
              onPress={() => setState("active")}
              style={styles.addButton}
            >
              <View style={styles.closeIcon}>
                <Icon name="icon-add" width={24} height={24} color={colors.white} />
              </View>
            </Pressable>
          )}

          <View style={styles.statsCard}>
            {state === "paused" ? (
              <View style={styles.pausedBadge}>
                <Icon name="icon-pause" width={23} height={23} color={colors.brown} />
                <Text style={styles.pausedBadgeText}>일시정지됨</Text>
              </View>
            ) : null}
            <View style={styles.timeBlock}>
              <Text style={styles.statLabel}>산책 시간</Text>
              <Text style={styles.timeValue}>{walkStats.time}</Text>
            </View>
            <View style={styles.distanceBlock}>
              <Text style={styles.statLabel}>거리</Text>
              <Text style={styles.distanceValue}>{walkStats.distance}</Text>
            </View>
            <View style={styles.speedBlock}>
              <Text style={styles.statLabel}>평균 속도</Text>
              <Text style={styles.speedValue}>{walkStats.averageSpeed}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomControls}>
          {state === "paused" ? (
            <Pressable
              accessibilityLabel="이어 걷개"
              accessibilityRole="button"
              onPress={() => setState("active")}
              style={styles.resumeButton}
            >
              <Icon name="icon-play" width={29} height={29} color={colors.brown} />
              <Text style={styles.resumeText}>이어 걷개</Text>
            </Pressable>
          ) : (
            <GradientView token={gradientButtonWarm} style={styles.pauseButton}>
            <Pressable
              accessibilityLabel="정지하개"
              accessibilityRole="button"
              onPress={() => setState("paused")}
              style={styles.controlPressable}
            >
              <Icon name="icon-pause" width={14.5} height={16.9167} color={colors.brown} />
              <Text style={styles.pauseText}>정지하개</Text>
            </Pressable>
            </GradientView>
          )}
          <GradientView token={gradientCardCream} style={styles.stopButton}>
          <Pressable
            accessibilityLabel="종료"
            accessibilityRole="button"
            onPress={() => {
              setState("ended");
              router.push("/6-1");
            }}
            style={styles.controlPressable}
          >
            <Icon name="icon-stop" width={16} height={16} color={colors.brown} />
            <Text style={styles.stopText}>종료</Text>
          </Pressable>
          </GradientView>
        </View>

        {hasBottomSheet ? (
          <>
            <Pressable
              accessibilityLabel="시트 닫기"
              accessibilityRole="button"
              onPress={() => setState("active")}
              style={styles.dimLayer}
            />
            <Animated.View
              style={[
                styles.reportSheet,
                { transform: [{ translateY: sheetTranslateY }] },
              ]}
            >
              <ReportSheet
                onClose={() => setState("active")}
                onResult={(failed) => router.push(failed ? "/5-6" : "/5-7")}
              />
            </Animated.View>
          </>
        ) : null}
      </View>
    </Screen>
  );
}

function ReportSheet({ onClose, onResult }: { onClose: () => void; onResult: (failed: boolean) => void }) {
  const options = [
    { label: "도주", icon: "icon-dog" as const, selected: true },
    { label: "부상", icon: "icon-medical-services" as const, selected: false },
    { label: "배변봉투 부족", icon: "icon-dog-poop" as const, selected: false },
    { label: "이물질 섭취", icon: "icon-warning" as const, selected: false },
    { label: "기타", icon: "icon-more" as const, selected: false },
  ];
  return (
    <View style={styles.reportSheetContent}>
      <View style={styles.sheetHandle} />
      <Text style={styles.reportTitle}>어떤 상황인가요?</Text>
      <Text style={styles.reportSubtitle}>현재 위치와 함께 보호소에 바로 알려드려요!</Text>
      {options.map((option, index) => (
        <Pressable
          key={option.label}
          accessibilityLabel={option.label}
          accessibilityRole="button"
          onPress={() => onResult(index === 1)}
          style={[
            styles.reportOption,
            { top: 121 + index * 70 },
            option.selected ? styles.reportOptionSelected : styles.reportOptionDefault,
          ]}
        >
          <View style={styles.reportOptionIcon}>
            <Icon name={option.icon} width={22} height={22} color={option.selected ? "#B2401F" : colors.brown} />
          </View>
          <Text style={[styles.reportOptionText, option.selected && styles.reportOptionTextSelected]}>
            {option.label}
          </Text>
        </Pressable>
      ))}
      <Pressable accessibilityLabel="보호소에 전화하기" accessibilityRole="button" onPress={() => onResult(false)} style={styles.callButton}>
        <Icon name="icon-phone" width={24} height={24} color={colors.brown} />
        <Text style={styles.callButtonText}>보호소에 전화하기</Text>
      </Pressable>
      <Pressable accessibilityLabel="취소" accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>취소</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
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
    borderRadius: 13,
    height: 26,
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
    alignSelf: "center",
    backgroundColor: colors.cream,
    borderRadius: radii.large,
    height: 634,
    left: 16,
    overflow: "hidden",
    position: "absolute",
    right: 16,
    top: 18,
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
  pauseOverlay: {
    backgroundColor: "#D9D9D9",
    bottom: 0,
    left: 0,
    opacity: 0.4,
    position: "absolute",
    right: 0,
    top: 0,
  },
  routeMarkerOne: {
    backgroundColor: colors.cream,
    borderColor: colors.orange,
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    left: 212,
    position: "absolute",
    top: 258,
    width: 32,
  },
  routeMarkerTwo: {
    backgroundColor: colors.cream,
    borderColor: colors.orange,
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    left: 174,
    position: "absolute",
    top: 360,
    width: 32,
  },
  routeMarkerEnd: {
    backgroundColor: colors.orange,
    borderRadius: 9,
    height: 18,
    left: 215,
    position: "absolute",
    top: 404,
    width: 18,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 28,
    elevation: 4,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    right: 12,
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
    bottom: 0,
    position: "absolute",
    right: 20,
    top: 234,
    width: 164,
    zIndex: 25,
  },
  plusMenuRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 44,
    justifyContent: "flex-end",
    position: "absolute",
    right: 0,
  },
  plusMenuLabel: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    marginRight: 8,
    paddingHorizontal: 12,
  },
  plusMenuLabelText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 13,
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
  distanceBlock: {
    alignItems: "center",
    height: 56,
    left: 112,
    position: "absolute",
    top: 13,
    width: 89,
  },
  speedBlock: {
    alignItems: "center",
    height: 56,
    left: 203,
    position: "absolute",
    top: 13,
    width: 104,
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
    marginTop: 2,
  },
  distanceValue: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.mediumTitle,
    lineHeight: 22,
  },
  speedValue: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.mediumTitle,
    lineHeight: 22,
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
    justifyContent: "center",
  },
  pauseButton: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: radii.control,
    flexDirection: "row",
    gap: 12,
    height: 55,
    justifyContent: "center",
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
    alignItems: "center",
    backgroundColor: colors.cardGradientEnd,
    borderRadius: radii.control,
    flexDirection: "row",
    gap: 8,
    height: 55,
    justifyContent: "center",
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
    flex: 1,
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
    left: 24,
    position: "absolute",
    width: 327,
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
  callButton: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 29,
    flexDirection: "row",
    gap: 8,
    height: 58,
    justifyContent: "center",
    left: 24,
    position: "absolute",
    top: 491,
    width: 327,
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
    left: 24,
    position: "absolute",
    top: 567,
    width: 327,
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
