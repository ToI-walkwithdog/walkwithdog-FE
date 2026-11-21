import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, shadows, typography } from "../theme/tokens";
import { fontFamilies } from "../theme/typography";

type OnboardingActionButtonProps = {
  title: string;
  onPress: () => void;
  bottom?: number;
};

export function OnboardingActionButton({
  title,
  onPress,
  bottom = 54,
}: OnboardingActionButtonProps) {
  return (
    <View style={[styles.frame, { bottom }]}>
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
    height: 61,
    position: "absolute",
    width: 375,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.orange,
    borderRadius: radii.status,
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
    fontFamily: fontFamilies.notoSansKRRegular,
    fontSize: typography.fontSizes.title,
    letterSpacing: 1,
    lineHeight: 25,
    textAlign: "center",
  },
});
