import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function WalkHistoryScreen() {
  const router = useRouter();
  const records = [
    { name: "콩이와 산책", shelter: "행복 보호소", distance: "2.4 km" },
    { name: "백호와 산책", shelter: "행복 보호소", distance: "0.5 km" },
    { name: "초코와 산책", shelter: "행복 보호소", distance: "2 km" },
    { name: "콩이와 산책", shelter: "행복 보호소", distance: "13 km" },
  ];

  return (
    <Screen
      backgroundColor={colors.white}
      contentContainerStyle={styles.scrollContent}
      scroll
      safeAreaEdges={[]}
      testID="screen-9-1"
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="뒤로"
          accessibilityRole="button"
          onPress={() => router.replace("/3")}
          style={styles.backButton}
        >
          <Icon name="icon-back" size={24} width={7.41} height={12} color={colors.brown} />
        </Pressable>
        <Text style={styles.headerTitle}>산책 기록</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>함께 걸은 순간들</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumbers}>12회        28.4 km</Text>
          <Text style={styles.summaryLabels}>총 산책                    총 거리</Text>
        </View>

        <Text style={styles.recentTitle}>최근 산책</Text>
        <View style={styles.records}>
          {records.map((record, index) => (
            <Pressable
              accessibilityLabel={`${record.name} 상세`}
              accessibilityRole="button"
              key={`${record.name}-${index}`}
              onPress={() => router.push("/9-2")}
              style={styles.recordCard}
            >
              <View>
                <Text style={styles.recordName}>{record.name}</Text>
                <Text style={styles.recordMeta}>
                  11.21.  ·  {record.shelter}
                </Text>
              </View>
              <Text style={styles.recordDistance}>
                {record.distance}  ›
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        accessibilityLabel="홈으로"
        accessibilityRole="button"
        onPress={() => router.replace("/3")}
        style={styles.homeButton}
      >
        <Text style={styles.homeButtonText}>홈으로</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 28 },
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
    width: 375,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 27,
  },
  summaryCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    height: 100,
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 18,
  },
  summaryNumbers: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 27,
  },
  summaryLabels: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
  },
  recentTitle: {
    color: colors.mildLightBrown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 19,
    marginTop: 20,
  },
  records: { gap: 12, marginTop: 12 },
  recordCard: {
    alignItems: "center",
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    flexDirection: "row",
    height: 97,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  recordName: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 20,
  },
  recordMeta: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
  },
  recordDistance: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 24,
  },
  homeButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    marginTop: 16,
    width: 335,
  },
  homeButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
