import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const kongiImage = require("../../assets/images/dog-kongi.png");

export type BookingDetailScreenState =
  | "confirmed"
  | "pending"
  | "rejected";

export function BookingDetailScreen({
  state,
}: {
  state: BookingDetailScreenState;
}) {
  const router = useRouter();
  const statusLabel =
    state === "confirmed"
      ? "예약 확정"
      : state === "pending"
        ? "승인 대기"
        : "예약 거절";
  const testId =
    state === "confirmed"
      ? "screen-8-3"
      : state === "pending"
        ? "screen-8-4"
        : "screen-8-5";

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
          <Text style={styles.title}>
            {state === "confirmed"
              ? "콩이와 만날 준비 되셨나요?"
              : state === "pending"
                ? "보호소의 확인을 기다려요"
                : "아쉽게도 예약이 거절됐어요"}
          </Text>

          <GradientView token={gradientCardCream} style={styles.bookingCard}>
            <View style={styles.dogRow}>
              <Image
                accessible={false}
                resizeMode="cover"
                source={kongiImage}
                style={styles.dogImage}
              />
              <View style={styles.dogInfo}>
                <Text style={styles.dogName}>콩이</Text>
                <Text style={styles.shelterName}>행복 보호소</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{statusLabel}</Text>
              </View>
            </View>
            <Text style={styles.schedule}>11월 12일 · 13:00–14:00</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>예약 번호</Text>
              <Text style={styles.infoValue}>WG-1112-001</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>활동 내용</Text>
              <Text style={styles.infoValue}>보호견 산책</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>산책 시간</Text>
              <Text style={styles.infoValue}>최대 30분</Text>
            </View>
          </GradientView>

          {state === "confirmed" ? (
            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>방문 전 꼭 확인해요</Text>
              <Text style={styles.guideText}>
                • 행복 보호소 · 서울 성북구{"\n"}
                • 방문 전 보호소에서 만남 장소 확인{"\n"}
                • 편한 신발과 움직이기 좋은 복장{"\n"}
                • 현장에서 안전 교육과 준비물 수령
              </Text>
            </View>
          ) : (
            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>
                {state === "pending" ? "승인 절차 안내" : "거절 사유"}
              </Text>
              <Text style={styles.guideText}>
                {state === "pending"
                  ? "보호소가 신청 내용을 확인하고 있어요."
                  : "예약 일정이 이미 마감되었어요."}
              </Text>
            </View>
          )}

          <Text style={styles.noticeText}>
            {state === "confirmed"
              ? "보호소에서 안내와 인계가 끝나면 발급 코드를 받아 입력해 주세요."
              : "보호소의 안내를 기다리거나 다른 예약을 선택해 주세요."}
          </Text>
        </View>

        <View style={styles.bottomActions}>
          {state === "confirmed" ? (
            <>
              <GradientView token={gradientButtonWarm} style={styles.primaryAction}>
              <Pressable
                accessibilityLabel="보호소 코드 입력하기"
                accessibilityRole="button"
                onPress={() => router.push("/4-1")}
                style={styles.primaryAction}
              >
                <Text style={styles.primaryActionText}>보호소 코드 입력하기</Text>
              </Pressable>
              </GradientView>
              <Pressable
                accessibilityLabel="예약 취소하기"
                accessibilityRole="button"
                onPress={() => router.push("/8-6")}
                style={styles.secondaryAction}
              >
                <Text style={styles.secondaryActionText}>예약 취소하기</Text>
              </Pressable>
            </>
          ) : (
            <GradientView token={gradientButtonWarm} style={styles.primaryAction}>
            <Pressable
              accessibilityLabel="목록으로"
              accessibilityRole="button"
              onPress={() => router.replace("/8-1")}
              style={styles.primaryAction}
            >
              <Text style={styles.primaryActionText}>목록으로</Text>
            </Pressable>
            </GradientView>
          )}
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
    height: 230,
    justifyContent: "center",
    marginTop: 8,
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
