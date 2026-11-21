import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function WalkRecordDetailScreen() {
  const router = useRouter();

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-9-2"
    >
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="뒤로"
            accessibilityRole="button"
            onPress={() => router.replace("/9-1")}
            style={styles.backButton}
          >
            <Icon name="icon-back" size={24} width={7.41} height={12} color={colors.brown} />
          </Pressable>
          <Text style={styles.headerTitle}>콩이와 산책</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.date}>2026.11.21 (토) 오후 3:20</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabels}>총 시간                      거리</Text>
            <Text style={styles.summaryNumbers}>32:15      2.4 km</Text>
            <Text style={styles.speedText}>평균 속도  4.5 km/h</Text>
          </View>
          <Text style={styles.sectionTitle}>보호소에 남긴 말</Text>
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              오늘은 냄새를 맡으며 천천히 걸었어요.{"\n"}
              담당자에게 상태와 특이사항을 전달했어요.
            </Text>
          </View>
          <View style={styles.handoverCard}>
            <Text style={styles.handoverTitle}>✓ 보호소 복귀·인계 완료</Text>
            <Text style={styles.handoverMeta}>행복 보호소 · 콩이</Text>
          </View>
        </View>
        <Pressable
          accessibilityLabel="산책 기록 목록으로"
          accessibilityRole="button"
          onPress={() => router.replace("/9-1")}
          style={styles.listButton}
        >
          <Text style={styles.listButtonText}>산책 기록 목록으로</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: "100%" },
  header: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    height: 56,
    paddingHorizontal: 20,
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
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.largeTitle,
    marginLeft: 8,
  },
  body: {
    alignSelf: "center",
    paddingHorizontal: 20,
    width: 375,
  },
  date: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
  },
  summaryCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    height: 110,
    justifyContent: "center",
    marginTop: 12,
    padding: 18,
  },
  summaryLabels: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
  },
  summaryNumbers: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 27,
  },
  speedText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 15,
  },
  sectionTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 19,
    marginTop: 20,
  },
  messageCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    marginTop: 12,
    padding: 16,
  },
  messageText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 14,
  },
  handoverCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    marginTop: 12,
    padding: 16,
  },
  handoverTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 16,
  },
  handoverMeta: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 14,
  },
  listButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    bottom: 28,
    height: 49,
    justifyContent: "center",
    position: "absolute",
    width: 335,
  },
  listButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
