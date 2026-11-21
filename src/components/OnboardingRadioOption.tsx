import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, radii, typography } from "../theme/tokens";
import { fontFamilies } from "../theme/typography";

type OnboardingRadioOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function OnboardingRadioOption({
  label,
  selected,
  onPress,
  style,
}: OnboardingRadioOptionProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.option, style]}
    >
      <View style={[styles.radio, selected && styles.selectedRadio]} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    backgroundColor: colors.white,
    borderColor: colors.lightOrange,
    borderRadius: radii.inputPill,
    borderWidth: 1,
    height: 44,
    left: 30,
    position: "absolute",
    width: 306,
  },
  radio: {
    backgroundColor: colors.lightOrange,
    borderRadius: 12,
    height: 24,
    left: 13,
    position: "absolute",
    top: 9,
    width: 24,
  },
  selectedRadio: {
    backgroundColor: colors.brown,
  },
  label: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.subtitle,
    left: 47,
    lineHeight: 22,
    position: "absolute",
    top: 10,
  },
});
