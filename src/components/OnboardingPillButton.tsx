import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, shadows, typography } from "../theme/tokens";
import { fontFamilies } from "../theme/typography";

type OnboardingPillButtonProps = {
  title: string;
  onPress: () => void;
};

export function OnboardingPillButton({
  title,
  onPress,
}: OnboardingPillButtonProps) {
  return (
    <View style={styles.frame}>
      <Pressable
        accessibilityLabel={title}
        accessibilityRole="button"
        onPress={onPress}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    alignSelf: "center",
    bottom: 54,
    height: 61,
    position: "absolute",
    width: 375,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.orange,
    borderRadius: radii.pill,
    elevation: 4,
    height: 61,
    justifyContent: "center",
    shadowColor: shadows.onboardingAction.color,
    shadowOffset: {
      width: shadows.onboardingAction.offsetX,
      height: shadows.onboardingAction.offsetY,
    },
    shadowOpacity: 1,
    shadowRadius: shadows.onboardingAction.blurRadius,
    width: 316,
  },
  buttonText: {
    color: colors.onboardingButtonText,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.title,
    letterSpacing: 1,
    lineHeight: 25,
    textAlign: "center",
  },
});
