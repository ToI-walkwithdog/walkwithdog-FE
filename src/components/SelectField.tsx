import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, radii, typography } from "../theme/tokens";
import { fontFamilies } from "../theme/typography";

type SelectFieldProps = {
  accessibilityLabel: string;
  placeholder: string;
  value: string | null;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

// 2-5 지역 입력칸과 같은 크기와 모양의 선택 칸. 누르면 시트를 연다.
export function SelectField({
  accessibilityLabel,
  placeholder,
  value,
  onPress,
  disabled = false,
  style,
}: SelectFieldProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.field, disabled && styles.disabled, style]}
    >
      <Text numberOfLines={1} style={styles.text}>
        {value ?? placeholder}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.lightOrange,
    borderRadius: radii.chip,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 8,
    width: 147,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.subtitle,
    textAlign: "center",
  },
});
