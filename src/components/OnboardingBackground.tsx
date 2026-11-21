import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  FeGaussianBlur,
  Filter,
  G,
  Rect,
} from "react-native-svg";

import { colors } from "../theme/tokens";

type OnboardingBackgroundProps = {
  opacity?: number;
  artworkOffsetY?: number;
};

export function OnboardingBackground({
  opacity = 0.7,
  artworkOffsetY = -379,
}: OnboardingBackgroundProps) {
  return (
    <View pointerEvents="none" style={styles.background}>
      <Svg
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 375 812"
        width="100%"
      >
        <Defs>
          <Filter
            height={611.828}
            id="onboardingGlowBottom"
            width={611.828}
            x={287.086}
            y={980}
            filterUnits="userSpaceOnUse"
          >
            <FeGaussianBlur stdDeviation={67.957} />
          </Filter>
          <Filter
            height={668.828}
            id="onboardingGlowTop"
            width={682.828}
            x={436.086}
            y={0}
            filterUnits="userSpaceOnUse"
          >
            <FeGaussianBlur stdDeviation={67.957} />
          </Filter>
          <Filter
            height={929}
            id="onboardingGlowCenter"
            width={918}
            x={0}
            y={331.914}
            filterUnits="userSpaceOnUse"
          >
            <FeGaussianBlur stdDeviation={150} />
          </Filter>
          <Filter
            height={611.828}
            id="onboardingGlowRight"
            width={611.828}
            x={482.086}
            y={731}
            filterUnits="userSpaceOnUse"
          >
            <FeGaussianBlur stdDeviation={67.957} />
          </Filter>
        </Defs>
        <Rect fill={colors.white} height={812} width={375} />
        <G
          opacity={opacity}
          transform={`translate(-465 ${artworkOffsetY})`}
        >
          <Circle
            cx={593}
            cy={1285.91}
            fill={colors.onboardingGlowGold}
            fillOpacity={0.027453}
            filter="url(#onboardingGlowBottom)"
            r={170}
          />
          <Ellipse
            cx={777.5}
            cy={334.414}
            fill={colors.onboardingGlowGold}
            fillOpacity={0.17}
            filter="url(#onboardingGlowTop)"
            rx={205.5}
            ry={198.5}
          />
          <Ellipse
            cx={459}
            cy={796.414}
            fill={colors.onboardingGlowOrange}
            fillOpacity={0.217548}
            filter="url(#onboardingGlowCenter)"
            rx={159}
            ry={164.5}
          />
          <Circle
            cx={788}
            cy={1036.91}
            fill={colors.onboardingGlowGold}
            fillOpacity={0.118581}
            filter="url(#onboardingGlowRight)"
            r={169.5}
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: "100%",
  },
});
