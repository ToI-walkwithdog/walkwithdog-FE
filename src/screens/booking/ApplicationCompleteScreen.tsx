import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const kongiImage = require("../../assets/images/dog-kongi.png");

export default function ApplicationCompleteScreen() {
  const router = useRouter();

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-7-5"
    >
      <View style={styles.root}>
        <View style={styles.body}>
          <Text style={styles.title}>신청 전달 완료!</Text>
          <Text style={styles.subtitle}>
            아직 예약 확정은 아니에요.{"\n"}
            보호소가 확인하면 결과를 알려드릴게요.
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
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>승인 대기</Text>
              </View>
            </View>
            <Text style={styles.schedule}>11월 13일 · 10:00–11:00</Text>
          </GradientView>

          <View style={styles.stepsCard}>
            <Text style={styles.stepActive}>01  신청 접수 완료</Text>
            <Text style={styles.step}>02  보호소 확인·승인</Text>
            <Text style={styles.step}>03  예약 확정 후 방문</Text>
          </View>

          <Text style={styles.noticeText}>
            예약 현황에서 진행 상태와{"\n"}
            보호소 안내를 확인할 수 있어요!
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <GradientView token={gradientButtonWarm} style={styles.primaryAction}>
          <Pressable
            accessibilityLabel="내 예약 현황 보기"
            accessibilityRole="button"
            onPress={() => console.log("내 예약 현황 보기 tapped")}
            style={styles.primaryAction}
          >
            <Text style={styles.primaryActionText}>내 예약 현황 보기</Text>
          </Pressable>
          </GradientView>
          <Pressable
            accessibilityLabel="홈으로"
            accessibilityRole="button"
            onPress={() => router.replace("/3")}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryActionText}>홈으로</Text>
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
  body: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 29,
    width: 375,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 28,
    lineHeight: 40.6,
  },
  subtitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.subtitle,
    lineHeight: 23.2,
  },
  bookingCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    height: 128,
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
  pendingBadge: {
    alignItems: "center",
    backgroundColor: colors.lightOrange,
    borderRadius: 25,
    height: 28,
    justifyContent: "center",
    width: 67,
  },
  pendingText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.small,
  },
  schedule: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
    marginTop: 4,
  },
  stepsCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    marginTop: 15,
    padding: 18,
  },
  stepActive: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 17,
    lineHeight: 24.65,
  },
  step: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 17,
    lineHeight: 24.65,
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
