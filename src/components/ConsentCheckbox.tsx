import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { Icon } from "./Icon";
import { colors } from "../theme/tokens";

type ConsentCheckboxProps = {
  accessibilityLabel: string;
  checked: boolean;
  onPress: () => void;
  size?: number;
  borderColor?: string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function ConsentCheckbox({
  accessibilityLabel,
  checked,
  onPress,
  size = 25,
  borderColor = colors.orange,
  borderRadius = 5,
  style,
}: ConsentCheckboxProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={[
        styles.checkbox,
        style,
        { borderColor, borderRadius, height: size, width: size },
        !checked && styles.uncheckedBox,
      ]}
    >
      {checked && size === 25 && (
        <View style={styles.checkIconFrame}>
          <View style={styles.checkIcon}>
            <Icon
              name="icon-check"
              size={18}
              width={14.9918}
              height={14.357}
              color={colors.white}
            />
          </View>
        </View>
      )}
      {checked && size !== 25 && (
        <View style={[styles.compactCheckFrame, { height: size, width: size }]}>
          <Icon
            name="icon-check"
            size={size * 0.6}
            width={size * 0.6}
            height={size * 0.57}
            color={colors.white}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    backgroundColor: colors.lightOrange,
    borderColor: colors.orange,
    borderRadius: 5,
    borderWidth: 1,
    height: 25,
    position: "absolute",
    width: 25,
  },
  uncheckedBox: {
    backgroundColor: colors.white,
  },
  checkIconFrame: {
    height: 18,
    left: 4,
    position: "absolute",
    top: 4,
    width: 18,
  },
  compactCheckFrame: {
    alignItems: "center",
    justifyContent: "center",
    left: 0,
    position: "absolute",
    top: 0,
  },
  checkIcon: {
    left: 1.5,
    position: "absolute",
    top: 3.5,
  },
});
