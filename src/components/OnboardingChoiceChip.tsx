import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

import { colors, radii, typography } from "../theme/tokens";
import { fontFamilies } from "../theme/typography";

type OnboardingChoiceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  fontSize?: number;
};

export function OnboardingChoiceChip({
  label,
  selected,
  onPress,
  style,
  fontSize = typography.fontSizes.bodyLarge,
}: OnboardingChoiceChipProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selectedChip, style]}
    >
      <Text
        style={[
          styles.label,
          { fontSize },
          selected && styles.selectedLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.lightOrange,
    borderRadius: radii.chip,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    position: "absolute",
  },
  selectedChip: {
    backgroundColor: colors.lightOrange,
  },
  label: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    lineHeight: 21,
    textAlign: "center",
  },
  selectedLabel: {
    fontFamily: fontFamilies.nanumSquareRoundBold,
  },
});
