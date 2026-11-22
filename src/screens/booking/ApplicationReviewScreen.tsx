import { useRef } from "react";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { useMockSession } from "../../context/MockSession";
import { availableBookings } from "../../data/availableBookings";
import { dogs } from "../../data/dogs";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function ApplicationReviewScreen() {
  const router = useRouter();
  const submitting = useRef(false);
  const { draftDogId, draftScheduleIndex, applyForBooking, profile } = useMockSession();
  const booking = availableBookings.find((item) => item.dogId === draftDogId);
  const dog = dogs.find((item) => item.id === draftDogId);
  const schedule = booking?.schedules[draftScheduleIndex];
  if (!booking || !dog || !schedule) throw new Error("Selected booking is unavailable.");

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-7-4"
    >
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="뒤로"
            accessibilityRole="button"
            onPress={() => router.replace("/7-3")}
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
          <Text style={styles.headerTitle}>예약 확인</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>신청 내용을 확인해 주세요</Text>
          <Text style={styles.subtitle}>{dog.name}와의 만남을 준비해요 :)</Text>

          <GradientView token={gradientCardCream} style={styles.bookingCard}>
            <View style={styles.dogRow}>
              <Image
                accessible={false}
                resizeMode="cover"
                source={dog.image}
                style={styles.dogImage}
              />
              <View>
                <Text style={styles.dogName}>{dog.name}</Text>
                <Text style={styles.shelterName}>{booking.shelterName}</Text>
              </View>
            </View>
            <Text style={styles.schedule}>{schedule.date} · {schedule.time}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>예약 번호</Text>
              <Text style={styles.infoValue}>신청 후 확인</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>산책 시간</Text>
              <Text style={styles.infoValue}>최대 {booking.maxWalkMinutes}분</Text>
            </View>
          </GradientView>

          <View style={styles.applicantCard}>
            <Text style={styles.applicantTitle}>신청자 정보</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>신청자</Text>
              <Text style={styles.infoValue}>{profile.nickname} 님</Text>
            </View>
            <Text style={styles.applicantHint}>
              목업에서는 연락처가 보호소에 전달되지 않아요.{"\n"}
              연락처 변경은 내 정보 수정에서 할 수 있어요.
            </Text>
          </View>

          <Text style={styles.noticeText}>
            방문 전 사전 교육과 준비물 안내를 확인해 주세요!{"\n"}
            목업 신청은 보호소에 전송되지 않아요.
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <GradientView token={gradientButtonWarm} style={styles.primaryAction}>
          <Pressable
            accessibilityLabel="예약 신청하개"
            accessibilityRole="button"
            onPress={() => {
              if (submitting.current) return;
              submitting.current = true;
              applyForBooking();
              router.replace("/7-5");
            }}
            style={styles.primaryPressable}
          >
            <Text style={styles.primaryActionText}>예약 신청하개</Text>
          </Pressable>
          </GradientView>
          <Pressable
            accessibilityLabel="일정 다시 선택"
            accessibilityRole="button"
            onPress={() => router.replace("/7-3")}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryActionText}>일정 다시 선택</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
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
    height: 56,
    justifyContent: "center",
    width: 375,
  },
  backButton: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    left: 16,
    position: "absolute",
    width: 24,
  },
  headerTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
  },
  body: {
    alignSelf: "center",
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
  subtitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 21.75,
  },
  bookingCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    height: 183,
    justifyContent: "center",
    marginTop: 15,
    padding: 16,
  },
  dogRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  dogImage: {
    borderRadius: 14,
    height: 72,
    marginRight: 12,
    width: 64,
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
  schedule: {
    color: colors.brown3,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
    marginTop: 6,
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
  applicantCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    marginTop: 15,
    padding: 16,
  },
  applicantTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
  },
  applicantHint: {
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
    marginTop: 15,
  },
  bottomActions: {
    alignSelf: "center",
    bottom: 28,
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
