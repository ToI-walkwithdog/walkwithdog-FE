import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function GPSLostScreen() {
  const router = useRouter();

  return (
    <Screen backgroundColor={colors.white} safeAreaEdges={[]} testID="screen-5-3">
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="뒤로"
            accessibilityRole="button"
            onPress={() => router.replace("/5-1")}
            style={styles.backButton}
          >
            <Icon name="icon-back" size={24} width={7.41} height={12} color={colors.brown} />
          </Pressable>
          <Text style={styles.headerTitle}>GPS 연결 끊김</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.headline}>위치 신호가 잠시 끊겼어요</Text>
          <Text style={styles.subheadline}>
            현재 산책은 유지하고 있어요.{"\n"}
            안전한 곳에서 위치 연결을 확인해 주세요.
          </Text>

          <GradientView token={gradientCardCream} style={styles.recordCard}>
            <Text style={styles.recordTitle}>콩이 · 행복 보호소</Text>
            <View style={styles.recordStatsRow}>
              <Text style={styles.recordTime}>24:15</Text>
              <Text style={styles.recordDistance}>1.8 km</Text>
            </View>
            <Text style={styles.recordHint}>마지막으로 확인된 기록</Text>
          </GradientView>

          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>
              신호가 끊긴 구간은 경로와 거리가{"\n"}
              정확히 기록되지 않을 수 있어요.
            </Text>
          </View>

          <Text style={styles.retryHint}>
            위치 접근과 기기의 위치 서비스를 확인하고,{"\n"}
            실외의 탁 트인 곳에서 다시 시도해 주세요!
          </Text>
        </View>

        <View style={styles.actions}>
          <GradientView token={gradientButtonWarm} style={styles.primary}>
          <Pressable
            accessibilityLabel="위치 다시 연결하기"
            accessibilityRole="button"
            onPress={() => router.replace("/5-1")}
            style={styles.primary}
          >
            <Text style={styles.primaryText}>위치 다시 연결하기</Text>
          </Pressable>
          </GradientView>
          <Pressable
            accessibilityLabel="기존 기록으로 산책 종료"
            accessibilityRole="button"
            onPress={() => router.replace("/3")}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>기존 기록으로 산책 종료</Text>
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
    flexDirection: "row",
    gap: 12,
    height: 56,
    width: 375,
  },
  backButton: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    marginLeft: 16,
    width: 24,
  },
  headerTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
    height: 25.2,
    lineHeight: 25.2,
  },
  body: {
    alignSelf: "center",
    height: 554,
    position: "relative",
    width: 375,
  },
  headline: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 26,
    height: 38,
    left: 20,
    lineHeight: 37.7,
    position: "absolute",
    top: 20,
    width: 335,
  },
  subheadline: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 16,
    height: 46,
    left: 20,
    lineHeight: 23.2,
    position: "absolute",
    top: 58,
    width: 335,
  },
  recordCard: {
    backgroundColor: "#FFFAF5",
    borderRadius: radii.card,
    height: 148,
    left: 20,
    paddingHorizontal: 18,
    position: "absolute",
    top: 144,
    width: 335,
  },
  recordTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 19,
    height: 28,
    left: 18,
    lineHeight: 27.55,
    position: "absolute",
    top: 18,
    width: 299,
  },
  recordStatsRow: {
    height: 41,
    left: 18,
    position: "absolute",
    top: 58,
    width: 299,
  },
  recordTime: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 28,
    height: 41,
    left: 0,
    lineHeight: 40.6,
    position: "absolute",
    top: 0,
  },
  recordDistance: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 28,
    height: 41,
    left: 150,
    lineHeight: 40.6,
    position: "absolute",
    top: 0,
  },
  recordHint: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
    height: 19,
    left: 18,
    lineHeight: 18.85,
    position: "absolute",
    top: 111,
    width: 299,
  },
  noticeCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    height: 72,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    position: "absolute",
    top: 312,
    width: 335,
  },
  noticeText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 14,
    height: 40,
    lineHeight: 20.3,
  },
  retryHint: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 14,
    height: 40,
    left: 20,
    lineHeight: 20.3,
    position: "absolute",
    top: 404,
    width: 335,
  },
  actions: {
    alignSelf: "center",
    bottom: 28,
    height: 118,
    position: "absolute",
    width: 335,
  },
  primary: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    height: 53,
    justifyContent: "center",
    left: 0,
    paddingHorizontal: 14,
    position: "absolute",
    top: 12,
    width: 335,
  },
  primaryText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 17,
    height: 25,
    lineHeight: 24.65,
    textAlign: "center",
  },
  secondary: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 53,
    justifyContent: "center",
    left: 0,
    paddingHorizontal: 14,
    position: "absolute",
    top: 77,
    width: 335,
  },
  secondaryText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 17,
    height: 25,
    lineHeight: 24.65,
    textAlign: "center",
  },
});
