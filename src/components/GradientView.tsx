import type { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import type { StyleProp, ViewStyle } from "react-native";

import type { GradientToken } from "../theme/gradients";

type GradientViewProps = {
  token: GradientToken;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function GradientView({
  token,
  style,
  children,
}: GradientViewProps) {
  return (
    <LinearGradient
      colors={[...token.colors]}
      locations={[...token.locations]}
      start={token.start}
      end={token.end}
      style={[{ borderRadius: token.radius, overflow: "hidden" }, style]}
    >
      {children}
    </LinearGradient>
  );
}
