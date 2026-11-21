import { useState } from "react";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const kongiImage = require("../../assets/images/dog-kongi.png");
const boriImage = require("../../assets/images/dog-bori.png");

export type BookingCancellationScreenState =
  | "requested"
  | "confirmation"
  | "cancelled";

export function BookingCancellationScreen({
  state,
}: {
  state: BookingCancellationScreenState;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("일정이 변경되었어요");

  const isConfirmation = state === "confirmation";
  const isCancelled = state === "cancelled";

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID={
        isCancelled ? "screen-8-8" : isConfirmation ? "screen-8-7" : "screen-8-6"
      }
    >
      <View style={styles.root}>
        {!isCancelled ? (
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="뒤로"
              accessibilityRole="button"
              onPress={() => router.replace(isConfirmation ? "/8-6" : "/8-3")}
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
              <Image
                accessible={false}
                resizeMode="cover"
                source={isCancelled ? boriImage : kongiImage}
                style={styles.dogImage}
              />
              <View style={styles.dogInfo}>
                <Text style={styles.dogName}>{isCancelled ? "보리" : "콩이"}</Text>
                <Text style={styles.shelterName}>
                  {isCancelled ? "우와 보호소" : "행복 보호소"}
                </Text>
              </View>
              {isCancelled ? (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>취소 완료</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.schedule}>
              {isCancelled
                ? "11월 15일 · 15:00–16:00"
                : "11월 12일 · 13:00–14:00"}
            </Text>
          </View>

          {isConfirmation ? (
            <>
              <View style={styles.noticeCard}>
                <Text style={styles.noticeText}>
                  취소하면 보호소에 바로 전달돼요. 다시 산책하려면 새로운 예약을 신청해야 해요.
                </Text>
              </View>
              <Pressable
                accessibilityLabel="취소 사유"
                accessibilityRole="button"
                onPress={() => setReason("일정이 변경되었어요")}
                style={styles.reasonCard}
              >
                <Text style={styles.reasonTitle}>취소 사유 (선택)</Text>
                <Text style={styles.reasonText}>{reason}  ▾</Text>
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
                  ? "취소 내용이 보호소에 전달되었어요. 다른 일정으로 다시 만날 수 있어요."
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
                onPress={() =>
                  router.push(isConfirmation ? "/8-8" : "/8-7")
                }
                style={styles.primaryAction}
              >
                <Text style={styles.primaryActionText}>
                  {isConfirmation ? "예약 취소하기" : "예약 취소 진행"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel="예약 유지하기"
                accessibilityRole="button"
                onPress={() => router.replace("/8-3")}
                style={styles.secondaryAction}
              >
                <Text style={styles.secondaryActionText}>예약 유지하기</Text>
              </Pressable>
            </>
          )}
        </View>
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
