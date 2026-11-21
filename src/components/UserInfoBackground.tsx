import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, FeGaussianBlur, Filter } from "react-native-svg";

import { colors } from "../theme/tokens";

export function UserInfoBackground() {
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
            height={520}
            id="userInfoTopGlow"
            width={520}
            x={80}
            y={-160}
            filterUnits="userSpaceOnUse"
          >
            <FeGaussianBlur stdDeviation={40} />
          </Filter>
          <Filter
            height={460}
            id="userInfoBottomGlow"
            width={460}
            x={-170}
            y={510}
            filterUnits="userSpaceOnUse"
          >
            <FeGaussianBlur stdDeviation={40} />
          </Filter>
        </Defs>
        <Circle
          cx={340}
          cy={100}
          fill={colors.cream}
          filter="url(#userInfoTopGlow)"
          opacity={0.55}
          r={140}
        />
        <Circle
          cx={60}
          cy={740}
          fill={colors.cream}
          filter="url(#userInfoBottomGlow)"
          opacity={0.4}
          r={150}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
