import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientLevelUpButton } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function LevelUpScreen() {
  const router = useRouter();

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-6-3"
    >
      <View style={styles.root}>
        <View style={styles.confettiTopLeft} />
        <View style={styles.confettiTopRight} />

        <View style={styles.cardFrame}>
          <View style={[styles.levelCard, styles.levelCardBack]} />
          <View style={[styles.levelCard, styles.levelCardMiddle]} />
          <View style={[styles.levelCard, styles.levelCardFront]}>
            <Icon
              name="icon-paw-stamp"
              size={73}
              width={80}
              height={73}
              color={colors.brown}
            />
            <Text style={styles.levelText}>
              Level UP!{"\n"}
              <Text style={styles.levelTextBrown}>산책 레벨 4가 되었어요</Text>
            </Text>
            <Text style={styles.levelSubtext}>
              이제 더 많은 친구들과{"\n"}
              산책할 수 있어요!
            </Text>
          </View>
        </View>

        <GradientView token={gradientLevelUpButton} style={styles.continueButton}>
        <Pressable
          accessibilityLabel="이어하개"
          accessibilityRole="button"
          onPress={() => router.replace("/3")}
          style={styles.continueButton}
        >
          <Text style={styles.continueText}>이어하개!</Text>
        </Pressable>
        </GradientView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  confettiTopLeft: {
    backgroundColor: colors.cream,
    borderRadius: 180,
    height: 359,
    left: -100,
    position: "absolute",
    top: -101,
    width: 359,
  },
  confettiTopRight: {
    backgroundColor: colors.cream,
    borderRadius: 180,
    bottom: -27,
    height: 359,
    position: "absolute",
    right: -11,
    width: 359,
  },
  cardFrame: {
    height: 311,
    position: "absolute",
    top: 220,
    width: 238,
  },
  levelCard: {
    alignItems: "center",
    borderRadius: 18,
    height: 311,
    justifyContent: "center",
    position: "absolute",
    width: 238,
  },
  levelCardBack: {
    backgroundColor: colors.cream,
    top: 47,
  },
  levelCardMiddle: {
    backgroundColor: colors.white,
    top: 23,
  },
  levelCardFront: {
    backgroundColor: colors.white,
    top: 0,
  },
  levelText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 18,
    lineHeight: 24,
    marginTop: 24,
    textAlign: "center",
  },
  levelTextBrown: {
    color: colors.brown,
  },
  levelSubtext: {
    color: colors.deepOrange,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 18,
    lineHeight: 24,
    marginTop: 10,
    textAlign: "center",
  },
  continueButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27.5,
    bottom: 51,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    width: 331,
  },
  continueText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.title,
  },
});
