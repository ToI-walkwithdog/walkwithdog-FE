import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { routeForFailure } from "../../api/auth";
import { CANCEL_REASONS, type CancelReasonCode } from "../../api/bookingCodes";
import type { ApiFailure } from "../../api/client";
import { errorMessage } from "../../api/errorMessages";
import {
  bookingFailureMessage,
  invalidateBookingsCache,
  routeForBooking,
} from "../../api/myBookings";
import { cancelWalkRequest, fetchWalkRequestDetail } from "../../api/walkRequests";
import { BottomSheet } from "../../components/BottomSheet";
import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { dogImageSource } from "../../utils/dogImage";
import { formatSlotDate, formatSlotTime } from "../../utils/kst";
import { BookingLoadState } from "./BookingLoadState";
import { useBookingDetail } from "./useBookingDetail";

export type BookingCancellationScreenState =
  | "requested"
  | "confirmation"
  | "cancelled";

const DEFAULT_REASON: CancelReasonCode = "SCHEDULE_CHANGED";

function reasonLabel(code: CancelReasonCode | null): string {
  return CANCEL_REASONS.find((item) => item.code === code)?.label ?? "선택 안 함";
}

export function BookingCancellationScreen({
  state,
}: {
  state: BookingCancellationScreenState;
}) {
  const router = useRouter();
  const { state: loaded, reload } = useBookingDetail();
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reason, setReason] = useState<CancelReasonCode | null>(DEFAULT_REASON);

  const isConfirmation = state === "confirmation";
  const isCancelled = state === "cancelled";
  const testId = isCancelled ? "screen-8-8" : isConfirmation ? "screen-8-7" : "screen-8-6";
  const detail = loaded.phase === "ready" ? loaded.detail : null;

  // 서버의 현재 상태와 맞지 않는 화면이면 맞는 화면으로 보낸다.
  const redirect =
    detail === null
      ? null
      : isCancelled
        ? detail.status === "CANCELLED"
          ? null
          : routeForBooking(detail.display_status)
        : detail.status === "CANCELLED"
          ? "/8-8"
          : !detail.actions.can_cancel
            ? routeForBooking(detail.display_status)
            : null;

  const notifiedRef = useRef(false);
  useEffect(() => {
    if (!redirect) return;
    // 취소할 수 없는 예약이 8-6, 8-7로 들어온 경우에만 이유를 알려 준다.
    if (!isCancelled && redirect !== "/8-8" && !notifiedRef.current) {
      notifiedRef.current = true;
      Alert.alert("알림", errorMessage("REQUEST_STATE_CONFLICT"));
    }
    router.replace(redirect);
  }, [isCancelled, redirect, router]);

  if (!detail || redirect) {
    return (
      <BookingLoadState
        failure={loaded.phase === "error" ? loaded.failure : null}
        onRetry={() => void reload()}
        testID={testId}
      />
    );
  }

  const source = dogImageSource(detail.dog.image_url);
  const shelterName = detail.shelter?.name ?? detail.shelter_name ?? "";
  const backRoute = routeForBooking(detail.display_status);

  // 취소 결과가 불확실하거나 상태가 달라졌을 때 서버의 현재 상태로 이동한다.
  const goToCurrentState = async () => {
    const current = await fetchWalkRequestDetail(detail.id);
    router.replace(current.ok ? routeForBooking(current.data.display_status) : "/8-1");
  };

  const handleFailure = async (failure: ApiFailure) => {
    const route = await routeForFailure(failure);
    if (route) {
      router.replace(route);
      return;
    }
    setSheetOpen(false);
    switch (failure.code) {
      case "REQUEST_ALREADY_CANCELLED":
        invalidateBookingsCache();
        Alert.alert("알림", errorMessage(failure.code), [
          { text: "확인", onPress: () => router.replace("/8-8") },
        ]);
        return;
      case "REQUEST_STATE_CONFLICT":
      case "CANCEL_TIME_EXPIRED":
      case "WALK_RECORD_EXISTS":
        Alert.alert("알림", errorMessage(failure.code), [
          { text: "확인", onPress: () => void goToCurrentState() },
        ]);
        return;
    }
    if (failure.code === null && (failure.status === 404 || failure.status === 403)) {
      Alert.alert("알림", bookingFailureMessage(failure), [
        { text: "확인", onPress: () => router.replace("/8-1") },
      ]);
      return;
    }
    // 네트워크 오류, 시간 초과, REQUEST_LOCK_CONFLICT는 서버에서 취소됐을 수도 있다. 상태를 먼저 확인한다.
    const current = await fetchWalkRequestDetail(detail.id);
    if (current.ok && current.data.status === "CANCELLED") {
      invalidateBookingsCache();
      router.replace("/8-8");
      return;
    }
    Alert.alert("알림", errorMessage(failure.code));
  };

  const submit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const result = await cancelWalkRequest(detail.id, reason);
      if (result.ok) {
        // 취소가 끝났으니 목록 캐시를 무효화한다. 목록은 다시 보일 때 첫 페이지부터 새로 불러온다.
        invalidateBookingsCache();
        setSheetOpen(false);
        router.replace("/8-8");
        return;
      }
      await handleFailure(result);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID={testId}
    >
      <View style={styles.root}>
        {!isCancelled ? (
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="뒤로"
              accessibilityRole="button"
              onPress={() => router.replace(backRoute)}
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
            <Text style={styles.headerTitle}>예약 취소</Text>
          </View>
        ) : null}

        <View style={styles.body}>
          <Text style={styles.title}>
            {isCancelled ? "예약이 취소되었어요" : isConfirmation ? "예약을 취소할까요?" : "예약 취소를 요청하실까요?"}
          </Text>

          <View style={styles.bookingCard}>
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
              {isCancelled ? (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>취소 완료</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.schedule}>
              {formatSlotDate(detail.requested_start_at)} ·{" "}
              {formatSlotTime(detail.requested_start_at, detail.requested_end_at)}
            </Text>
          </View>

          {isConfirmation ? (
            <>
              <View style={styles.noticeCard}>
                <Text style={styles.noticeText}>
                  취소한 예약은 되돌릴 수 없어요. 필요하면 다시 신청해 주세요.
                </Text>
              </View>
              <Pressable
                accessibilityLabel="취소 사유"
                accessibilityRole="button"
                disabled={submitting}
                onPress={() => Alert.alert("취소 사유", "사유를 선택해 주세요.", [
                  ...CANCEL_REASONS.map((item) => ({
                    text: item.label,
                    onPress: () => setReason(item.code),
                  })),
                  { text: "닫기", style: "cancel" as const },
                ])}
                style={styles.reasonCard}
              >
                <Text style={styles.reasonTitle}>취소 사유 (선택)</Text>
                <Text style={styles.reasonText}>{reasonLabel(reason)}  ▾</Text>
              </Pressable>
              <Text style={styles.helpText}>
                방문이 어렵다면 미리 알려 주세요.{"\n"}
                보호소와 다른 산책 친구에게 도움이 돼요.
              </Text>
            </>
          ) : (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>
                {isCancelled
                  ? "예약이 취소되었어요. 다른 일정으로 다시 신청할 수 있어요."
                  : "예약 취소 전 보호소 일정과 산책 준비 사항을 확인해 주세요."}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomActions}>
          {isCancelled ? (
            <Pressable
              accessibilityLabel="예약 목록으로"
              accessibilityRole="button"
              onPress={() => router.replace("/8-1")}
              style={styles.secondaryAction}
            >
              <Text style={styles.secondaryActionText}>예약 목록으로</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                accessibilityLabel={isConfirmation ? "예약 취소하기" : "예약 취소 진행"}
                accessibilityRole="button"
                disabled={submitting}
                onPress={() => {
                  if (isConfirmation) setSheetOpen(true);
                  else router.replace("/8-7");
                }}
                style={styles.primaryAction}
              >
                <Text style={styles.primaryActionText}>
                  {isConfirmation ? "예약 취소하기" : "예약 취소 진행"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel="예약 유지하기"
                accessibilityRole="button"
                disabled={submitting}
                onPress={() => router.replace(backRoute)}
                style={styles.secondaryAction}
              >
                <Text style={styles.secondaryActionText}>예약 유지하기</Text>
              </Pressable>
            </>
          )}
        </View>

        <BottomSheet
          height={250}
          onClose={() => {
            if (!submitting) setSheetOpen(false);
          }}
          title="정말 취소할까요?"
          visible={sheetOpen}
        >
          <View style={styles.sheetBody}>
            <Text style={styles.sheetText}>
              {detail.dog.name}와의 {formatSlotDate(detail.requested_start_at)}{" "}
              {formatSlotTime(detail.requested_start_at, detail.requested_end_at)} 산책 예약을
              취소해요.
            </Text>
            <Pressable
              accessibilityLabel="예약 취소 확인"
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting }}
              disabled={submitting}
              onPress={() => void submit()}
              style={[styles.primaryAction, submitting && styles.disabledAction]}
            >
              <Text style={styles.primaryActionText}>
                {submitting ? "취소하는 중..." : "예약 취소하기"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="예약 유지하기"
              accessibilityRole="button"
              disabled={submitting}
              onPress={() => setSheetOpen(false)}
              style={styles.secondaryAction}
            >
              <Text style={styles.secondaryActionText}>예약 유지하기</Text>
            </Pressable>
          </View>
        </BottomSheet>
      </View>
    </Screen>
  );
}

export function BookingCancellationStartedRoute() {
  return <BookingCancellationScreen state="cancelled" />;
}

export function BookingCancellationConfirmRoute() {
  return <BookingCancellationScreen state="confirmation" />;
}

export function BookingCancellationCompleteRoute() {
  return <BookingCancellationScreen state="cancelled" />;
}

const styles = StyleSheet.create({
  root: { flex: 1, width: "100%" },
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
    paddingHorizontal: 20,
    paddingTop: 29,
    width: 375,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 27,
    lineHeight: 39.15,
  },
  bookingCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    height: 128,
    justifyContent: "center",
    marginTop: 20,
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
  dogInfo: { flex: 1, marginLeft: 12 },
  dogName: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 23,
  },
  shelterName: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 14,
  },
  statusBadge: {
    backgroundColor: colors.lightOrange,
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 12,
  },
  schedule: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 16,
  },
  noticeCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    marginTop: 20,
    padding: 16,
  },
  noticeText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 14,
    lineHeight: 20.3,
  },
  reasonCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    marginTop: 20,
    padding: 16,
  },
  reasonTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 17,
  },
  reasonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 15,
  },
  helpText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 15,
    lineHeight: 21.75,
    marginTop: 20,
  },
  bottomActions: {
    alignSelf: "center",
    bottom: 28,
    position: "absolute",
    width: 335,
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
  },
  disabledAction: {
    opacity: 0.5,
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
  sheetBody: {
    alignSelf: "center",
    width: 335,
  },
  sheetText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 14,
    lineHeight: 20.3,
    marginBottom: 16,
  },
});
