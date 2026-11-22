import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

type ReportResultScreenProps = {
  state: "failed" | "done";
};

export default function ReportResultScreen({ state }: ReportResultScreenProps) {
  const router = useRouter();
  const failed = state === "failed";
  const { report } = useLocalSearchParams<{ report?: string }>();

  return (
    <Screen backgroundColor={colors.white} safeAreaEdges={[]} testID={failed ? "screen-5-6" : "screen-5-7"}>
      <View style={styles.root}>
        <View style={styles.body}>
          <Icon
            name="icon-error"
            size={60}
            width={60}
            height={60}
            color={colors.orange3}
          />
          <Text style={styles.title}>
            신고가 전송되지 않았어요
          </Text>
          <Text style={styles.subtitle}>
            신고 전송 기능이 아직 연결되지 않았어요.{"\n"}
            보호소에 직접 연락해 주세요.
          </Text>
          <GradientView token={gradientCardCream} style={styles.card}>
            <Text style={styles.cardTitle}>{report ?? "신고"} · 전송되지 않음</Text>
            <Text style={styles.cardText}>콩이 · 행복 보호소</Text>
          </GradientView>
        </View>
        <View style={styles.actions}>
          <GradientView token={gradientButtonWarm} style={styles.primary}>
          <Pressable
            accessibilityLabel="보호소 연락처 확인"
            accessibilityRole="button"
            onPress={() => Alert.alert("연락처 미연결", "보호소 연락처가 아직 연결되지 않았어요. 별도로 확인해 직접 연락해 주세요.")}
            style={styles.primaryPressable}
          >
            <Text style={styles.primaryText}>
              보호소 연락처 확인
            </Text>
          </Pressable>
          </GradientView>
          <Pressable
            accessibilityLabel="산책 화면으로"
            accessibilityRole="button"
            onPress={() => router.dismissTo({ pathname: "/5-1", params: { closeReport: "1" } })}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>산책 화면으로</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  primaryPressable: { alignItems: "center", height: 49, justifyContent: "center", width: 335 },
  root: { flex: 1, width: "100%" },
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
    lineHeight: 39,
    marginTop: 12,
  },
  subtitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.subtitle,
  },
  card: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    marginTop: 20,
    padding: 18,
  },
  cardTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 20,
  },
  cardText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 16,
  },
  actions: {
    alignSelf: "center",
    bottom: 28,
    position: "absolute",
    width: 335,
  },
  primary: {
    alignItems: "center",
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
  },
  primaryText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
  secondary: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    marginTop: 12,
  },
  secondaryText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
