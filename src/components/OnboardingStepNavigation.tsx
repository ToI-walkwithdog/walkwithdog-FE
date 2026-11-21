import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, typography } from "../theme/tokens";
import { fontFamilies } from "../theme/typography";

type OnboardingStepNavigationProps = {
  bottom?: number;
  nextBold?: boolean;
  nextLabel?: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function OnboardingStepNavigation({
  bottom = 51,
  nextBold = false,
  nextLabel = "다음",
  onPrevious,
  onNext,
}: OnboardingStepNavigationProps) {
  return (
    <View style={[styles.frame, { bottom }]}>
      <Pressable
        accessibilityLabel="이전"
        accessibilityRole="button"
        onPress={onPrevious}
        style={[styles.button, styles.previousButton]}
      >
        <Text style={styles.buttonText}>이전</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="다음"
        accessibilityRole="button"
        onPress={onNext}
        style={[styles.button, styles.nextButton]}
      >
        <Text style={[styles.buttonText, nextBold && styles.boldButtonText]}>
          {nextLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: "center",
    height: 54,
    position: "absolute",
    width: 375,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: radii.navigation,
    height: 54,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 156,
  },
  previousButton: {
    left: 23,
  },
  nextButton: {
    left: 191,
  },
  buttonText: {
    color: colors.white,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.navigationLabel,
    lineHeight: 26,
    textAlign: "center",
  },
  boldButtonText: {
    fontFamily: fontFamilies.nanumSquareRoundBold,
  },
});
