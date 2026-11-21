import {
  StyleSheet,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from "react-native";

import { colors, radii, typography } from "../theme/tokens";
import { fontFamilies } from "../theme/typography";

type PillTextInputProps = Omit<TextInputProps, "style"> & {
  borderColor?: string;
  borderRadius?: number;
  fontSize?: number;
  fontFamily?: string;
  height?: number;
  paddingHorizontal?: number;
  placeholderColor?: string;
  textColor?: string;
  style?: StyleProp<TextStyle>;
};

export function PillTextInput({
  borderColor = colors.outer2,
  borderRadius = radii.pill,
  fontSize = typography.fontSizes.mediumTitle,
  fontFamily = fontFamilies.urbanistMedium,
  height = 56,
  paddingHorizontal = 22,
  placeholderColor = colors.brown2,
  textColor = colors.brown,
  style,
  ...props
}: PillTextInputProps) {
  return (
    <TextInput
      {...props}
      blurOnSubmit={props.blurOnSubmit ?? true}
      placeholderTextColor={placeholderColor}
      selectionColor={textColor}
      submitBehavior={props.submitBehavior ?? "blurAndSubmit"}
      style={[
        styles.input,
        { borderColor, borderRadius, fontFamily, fontSize, height, paddingHorizontal },
        { color: textColor },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    color: colors.text,
    paddingVertical: 0,
    textAlignVertical: "center",
  },
});
