import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

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

  return (
    <Screen backgroundColor={colors.white} safeAreaEdges={[]} testID={failed ? "screen-5-6" : "screen-5-7"}>
      <View style={styles.root}>
        <View style={styles.body}>
          <Icon
            name={failed ? "icon-error" : "icon-check"}
            size={60}
            width={60}
            height={60}
            color={failed ? colors.orange3 : colors.brown}
          />
          <Text style={styles.title}>
            {failed ? "신고를 보내지 못했어요" : "보호소에 신고를 전달했어요"}
          </Text>
          <Text style={styles.subtitle}>
            {failed
              ? "네트워크 연결을 확인해 주세요."
              : "지금은 강아지와 나의 안전이 가장 중요해요."}
          </Text>
          <GradientView token={gradientCardCream} style={styles.card}>
            <Text style={styles.cardTitle}>{failed ? "부상 신고 전송 실패" : "부상 신고"}</Text>
            <Text style={styles.cardText}>콩이 · 행복 보호소</Text>
          </GradientView>
        </View>
        <View style={styles.actions}>
          <GradientView token={gradientButtonWarm} style={styles.primary}>
          <Pressable
            accessibilityLabel={failed ? "다시 전송하기" : "보호소 연락처 확인"}
            accessibilityRole="button"
            onPress={() => {
              if (failed) router.replace("/5-7");
            }}
            style={styles.primary}
          >
            <Text style={styles.primaryText}>
              {failed ? "다시 전송하기" : "보호소 연락처 확인"}
            </Text>
          </Pressable>
          </GradientView>
          <Pressable
            accessibilityLabel="산책 화면으로"
            accessibilityRole="button"
            onPress={() => router.replace("/5-1")}
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
    backgroundColor: colors.midLightOrange,
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
