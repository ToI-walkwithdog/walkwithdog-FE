import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const kongiImage = require("../../assets/images/dog-kongi.png");

export default function ApplicationReviewScreen() {
  const router = useRouter();

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
          <Text style={styles.subtitle}>콩이와의 첫 만남을 준비해요 :)</Text>

          <GradientView token={gradientCardCream} style={styles.bookingCard}>
            <View style={styles.dogRow}>
              <Image
                accessible={false}
                resizeMode="cover"
                source={kongiImage}
                style={styles.dogImage}
              />
              <View>
                <Text style={styles.dogName}>콩이</Text>
                <Text style={styles.shelterName}>행복 보호소</Text>
              </View>
            </View>
            <Text style={styles.schedule}>11월 13일 · 10:00–11:00</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>예약 번호</Text>
              <Text style={styles.infoValue}>WG-1112-001</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>산책 시간</Text>
              <Text style={styles.infoValue}>최대 30분</Text>
            </View>
          </GradientView>

          <View style={styles.applicantCard}>
            <Text style={styles.applicantTitle}>신청자 정보</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>신청자</Text>
              <Text style={styles.infoValue}>Glow 님</Text>
            </View>
            <Text style={styles.applicantHint}>
              등록된 연락처로 보호소의 연락이 가요!{"\n"}
              연락처 변경은 내 정보 수정에서 할 수 있어요 :)
            </Text>
          </View>

          <Text style={styles.noticeText}>
            방문 전 사전 교육과 준비물 안내를 확인해 주세요!{"\n"}
            예약은 보호소 승인 후 확정돼요 :)
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <GradientView token={gradientButtonWarm} style={styles.primaryAction}>
          <Pressable
            accessibilityLabel="예약 신청하개"
            accessibilityRole="button"
            onPress={() => router.push("/7-5")}
            style={styles.primaryAction}
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
