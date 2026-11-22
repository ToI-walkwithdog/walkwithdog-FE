import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { useMockSession } from "../../context/MockSession";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function WalkHistoryScreen() {
  const router = useRouter();
  const { records, selectRecord } = useMockSession();
  const distance = records.reduce((sum, record) => sum + record.distanceMeters, 0) / 1000;

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
          <Text style={styles.summaryNumbers}>{records.length}회        {distance.toFixed(1)} km</Text>
          <Text style={styles.summaryLabels}>총 산책                    총 거리</Text>
        </View>

        <Text style={styles.recentTitle}>최근 산책</Text>
        <View style={styles.records}>
          {records.map((record) => (
            <Pressable
              accessibilityLabel={`${record.displayName} 상세`}
              accessibilityRole="button"
              key={record.id}
              onPress={() => {
                selectRecord(record.id);
                router.push("/9-2");
              }}
              style={styles.recordCard}
            >
              <View>
                <Text style={styles.recordName}>{record.displayName}</Text>
                <Text style={styles.recordMeta}>
                  {record.displayDate}  ·  {record.shelterName}
                </Text>
              </View>
              <Text style={styles.recordDistance}>
                {record.displayDistance}  ›
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
