import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { setStartableRequest } from "../../api/bookingDraft";
import { HOME_STATUS_LABELS } from "../../api/bookingCodes";
import { routeForBooking } from "../../api/myBookings";
import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { dogImageSource } from "../../utils/dogImage";
import { formatSlotDate, formatSlotTime } from "../../utils/kst";
import { BookingLoadState } from "./BookingLoadState";
import { useBookingDetail } from "./useBookingDetail";

// 8-3(확정, 산책 완료), 8-4(승인 대기), 8-5(거절)가 같은 화면을 쓴다.
// 어떤 화면인지는 서버의 표시 상태가 정하고, 맞지 않는 경로로 들어왔으면 맞는 경로로 바꾼다.
export type BookingDetailScreenState = "confirmed" | "pending" | "rejected";

const ROUTE_STATE: Record<string, BookingDetailScreenState> = {
  "/8-3": "confirmed",
  "/8-4": "pending",
  "/8-5": "rejected",
};

export function BookingDetailScreen({
  state: routeState,
}: {
  state: BookingDetailScreenState;
}) {
  const router = useRouter();
  const { state: loaded, reload } = useBookingDetail();
  const detail = loaded.phase === "ready" ? loaded.detail : null;
  const target = detail ? routeForBooking(detail.display_status) : null;
  const wrongScreen = target !== null && ROUTE_STATE[target] !== routeState;

  useEffect(() => {
    if (target && wrongScreen) router.replace(target);
  }, [router, target, wrongScreen]);

  const testId =
    routeState === "confirmed"
      ? "screen-8-3"
      : routeState === "pending"
        ? "screen-8-4"
        : "screen-8-5";

  if (loaded.phase !== "ready" || wrongScreen || !detail) {
    return (
      <BookingLoadState
        failure={loaded.phase === "error" ? loaded.failure : null}
        onRetry={() => void reload()}
        testID={testId}
      />
    );
  }

  const state = routeState;
  const statusLabel = HOME_STATUS_LABELS[detail.display_status];
  const source = dogImageSource(detail.dog.image_url);
  const shelterName = detail.shelter?.name ?? detail.shelter_name ?? "";
  const completed = detail.display_status === "COMPLETED";
  const canEnterCode = detail.actions.can_enter_shelter_code;
  const canCancel = detail.actions.can_cancel;

  const title =
    state === "confirmed"
      ? completed
        ? `${detail.dog.name}와의 산책을 마쳤어요`
        : `${detail.dog.name}와 만날 준비 되셨나요?`
      : state === "pending"
        ? "보호소의 확인을 기다려요"
        : "아쉽게도 예약이 거절됐어요";

  const goCode = () => {
    // 4-x(보호소 코드)가 이어서 쓸 예약이다.
    setStartableRequest(detail);
    router.push("/4-1");
  };

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID={testId}
    >
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="뒤로"
            accessibilityRole="button"
            onPress={() => router.replace("/8-1")}
            style={styles.backButton}
          >
            <Icon
              name="icon-back"
              size={24}
              width={7.41}
              height={12}
              color={colors.brown}
            />
          </Pressable>
          <Text style={styles.headerTitle}>예약 상세</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>

          <GradientView token={gradientCardCream} style={styles.bookingCard}>
            <View style={styles.dogRow}>
              {source ? (
                <Image
                  accessible={false}
                  resizeMode="cover"
                  source={source}
                  style={styles.dogImage}
                />
              ) : (
                <View style={[styles.dogImage, styles.dogImageEmpty]}>
                  <Icon
                    name="icon-dog"
                    size={28}
                    width={28}
                    height={28}
                    color={colors.brown2}
                  />
                </View>
              )}
              <View style={styles.dogInfo}>
                <Text style={styles.dogName}>{detail.dog.name}</Text>
                <Text style={styles.shelterName}>{shelterName}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{statusLabel}</Text>
              </View>
            </View>
            <Text style={styles.schedule}>
              {formatSlotDate(detail.requested_start_at)} ·{" "}
              {formatSlotTime(detail.requested_start_at, detail.requested_end_at)}
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>예약 번호</Text>
              <Text style={styles.infoValue}>#{detail.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>활동 내용</Text>
              <Text style={styles.infoValue}>보호견 산책</Text>
            </View>
            {detail.max_walk_minutes !== null ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>산책 시간</Text>
                <Text style={styles.infoValue}>최대 {detail.max_walk_minutes}분</Text>
              </View>
            ) : null}
          </GradientView>

          {state === "confirmed" && !completed ? (
            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>방문 전 꼭 확인해요</Text>
              <Text style={styles.guideText}>
                • {shelterName}
                {detail.confirmed_visit?.address ? ` · ${detail.confirmed_visit.address}` : ""}
                {"\n"}
                {detail.confirmed_visit?.phone
                  ? `• 보호소 연락처 ${detail.confirmed_visit.phone}\n`
                  : ""}
                • 방문 전 보호소에서 만남 장소 확인{"\n"}
                • 편한 신발과 움직이기 좋은 복장{"\n"}
                • 현장에서 안전 교육과 준비물 수령
              </Text>
            </View>
          ) : state === "confirmed" ? (
            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>산책을 마친 예약이에요</Text>
              <Text style={styles.guideText}>산책 기록은 마이페이지의 산책 기록에서 볼 수 있어요.</Text>
            </View>
          ) : (
            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>
                {state === "pending" ? "승인 절차 안내" : "거절 사유"}
              </Text>
              <Text style={styles.guideText}>
                {state === "pending"
                  ? "보호소가 신청을 확인하고 있어요. 승인되면 예약이 확정돼요."
                  : detail.rejection_reason ?? "보호소 사정으로 예약이 거절됐어요."}
              </Text>
            </View>
          )}

          <Text style={styles.noticeText}>
            {state === "confirmed" && !completed
              ? "보호소에서 안내와 인계가 끝나면 발급 코드를 받아 입력해 주세요."
              : "보호소의 안내를 기다리거나 다른 예약을 선택해 주세요."}
          </Text>
        </View>

        <View style={styles.bottomActions}>
          {canEnterCode ? (
            <GradientView token={gradientButtonWarm} style={styles.primaryAction}>
              <Pressable
                accessibilityLabel="보호소 코드 입력하기"
                accessibilityRole="button"
                onPress={goCode}
                style={styles.primaryPressable}
              >
                <Text style={styles.primaryActionText}>보호소 코드 입력하기</Text>
              </Pressable>
            </GradientView>
          ) : (
            <GradientView token={gradientButtonWarm} style={styles.primaryAction}>
              <Pressable
                accessibilityLabel="목록으로"
                accessibilityRole="button"
                onPress={() => router.replace("/8-1")}
                style={styles.primaryPressable}
              >
                <Text style={styles.primaryActionText}>목록으로</Text>
              </Pressable>
            </GradientView>
          )}
          {canCancel ? (
            <Pressable
              accessibilityLabel="예약 취소하기"
              accessibilityRole="button"
              onPress={() => router.push("/8-7")}
              style={styles.secondaryAction}
            >
              <Text style={styles.secondaryActionText}>예약 취소하기</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

export function BookingDetailConfirmedRoute() {
  return <BookingDetailScreen state="confirmed" />;
}

export function BookingDetailPendingRoute() {
  return <BookingDetailScreen state="pending" />;
}

export function BookingDetailRejectedRoute() {
  return <BookingDetailScreen state="rejected" />;
}

const styles = StyleSheet.create({
  primaryPressable: { alignItems: "center", height: 49, justifyContent: "center", width: 335 },
  root: {
    flex: 1,
    width: "100%",
  },
  header: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    height: 56,
    paddingHorizontal: 16,
    width: 375,
  },
  backButton: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  headerTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
    marginLeft: 12,
  },
  body: {
    alignSelf: "center",
    height: 544,
    paddingHorizontal: 20,
    paddingTop: 12,
    width: 375,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.largeTitle,
    lineHeight: 36.25,
  },
  bookingCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    justifyContent: "center",
    marginTop: 8,
    minHeight: 230,
    padding: 16,
  },
  dogRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  dogImage: {
    borderRadius: 14,
    height: 72,
    width: 64,
  },
  dogImageEmpty: {
    alignItems: "center",
    backgroundColor: colors.cream,
    justifyContent: "center",
  },
  dogInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dogName: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 23,
  },
  shelterName: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
  },
  statusBadge: {
    alignItems: "center",
    backgroundColor: colors.lightOrange,
    borderRadius: 25,
    height: 29,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  statusText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.small,
  },
  schedule: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  infoLabel: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
  },
  infoValue: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.body,
  },
  guideCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    marginTop: 8,
    padding: 18,
  },
  guideTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
  },
  guideText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
  },
  noticeText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
    marginTop: 8,
  },
  bottomActions: {
    alignSelf: "center",
    bottom: 28,
    height: 110,
    justifyContent: "flex-end",
    position: "absolute",
    width: 335,
  },
  primaryAction: {
    alignItems: "center",
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
  },
  primaryActionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    marginTop: 12,
  },
  secondaryActionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
