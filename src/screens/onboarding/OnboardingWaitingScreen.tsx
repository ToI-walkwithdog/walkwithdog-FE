import { useEffect } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { routeFromServer } from "../../api/auth";
import { OnboardingBackground } from "../../components/OnboardingBackground";
import { Screen } from "../../components/Screen";
import { colors, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function OnboardingWaitingScreen() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    // 서버의 온보딩 상태로 이동할 곳을 정한다. 알 수 없으면 2-2로 간다.
    const destination = routeFromServer().then((route) => route ?? "/2-2");
    const timeout = setTimeout(async () => {
      const target = await destination;
      if (!cancelled) router.replace(target);
    }, 1500);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-2-1"
    >
      <View style={styles.root}>
        <OnboardingBackground artworkOffsetY={-379} opacity={1} />

        <View style={styles.contentFrame}>
          <Text style={styles.primaryMessage}>
            정보 입력창으로{"\n"}넘어가는 중...🐾
          </Text>
          <Text style={styles.secondaryMessage}>
            안심하세요! 같이걷개는{"\n"}
            모든 정보를 안전히 보관합니다 :)
          </Text>
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
  contentFrame: {
    alignSelf: "center",
    flex: 1,
    width: 375,
  },
  primaryMessage: {
    color: colors.brown3,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.largeTitle,
    lineHeight: 32.5,
    position: "absolute",
    textAlign: "center",
    top: 348.5,
    width: 375,
  },
  secondaryMessage: {
    color: colors.mildBrown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 19.5,
    position: "absolute",
    textAlign: "center",
    top: 440.5,
    width: 375,
  },
});
