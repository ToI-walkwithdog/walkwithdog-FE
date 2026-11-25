import { useEffect, useRef } from "react";
import type { ComponentType } from "react";
import { useRouter } from "expo-router";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";

import CardBack from "../../assets/icons/vector-rectangle-327.svg";
import CardMiddle from "../../assets/icons/vector-rectangle-328.svg";
import CardFront from "../../assets/icons/vector-rectangle-329.svg";
import Paw from "../../assets/images/level-up-paw-mark.svg";
import Ribbon1 from "../../assets/images/level-up-ribbon-1.svg";
import Ribbon9 from "../../assets/images/level-up-ribbon-9.svg";
import Ribbon10 from "../../assets/images/level-up-ribbon-10.svg";
import Ribbon11 from "../../assets/images/level-up-ribbon-11.svg";
import Ribbon12 from "../../assets/images/level-up-ribbon-12.svg";
import Ribbon13 from "../../assets/images/level-up-ribbon-13.svg";
import Ribbon24 from "../../assets/images/level-up-ribbon-24.svg";
import Ribbon26 from "../../assets/images/level-up-ribbon-26.svg";
import { getLevelUpEvent } from "../../api/walkResult";
import { GradientView } from "../../components/GradientView";
import { Screen } from "../../components/Screen";
import { gradientLevelUpButton } from "../../theme/gradients";
import { colors, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const background = require("../../assets/images/level-up-background.png");

const confetti = [
  { Svg: Ribbon9, x: 22, y: 276, width: 33.156, height: 33.974, innerWidth: 28.78, innerHeight: 27.713, left: 0, top: -3.526, angle: -102.17 },
  { Svg: Ribbon9, x: 121, y: 458.61, width: 33.156, height: 33.974, innerWidth: 28.78, innerHeight: 27.713, left: 0, top: -3.526, angle: -102.17 },
  { Svg: Ribbon10, x: 284.08, y: 220.42, width: 21.876, height: 38.694, innerWidth: 12.936, innerHeight: 36.602, left: -3.223, top: -4.63, angle: -165.17 },
  { Svg: Ribbon10, x: 340, y: 402, width: 21.876, height: 38.694, innerWidth: 12.936, innerHeight: 36.602, left: -3.223, top: -4.63, angle: -165.17 },
  { Svg: Ribbon26, x: 21, y: 509, width: 29.431, height: 38.187, innerWidth: 12.936, innerHeight: 36.602, left: -3.223, top: -4.63, angle: 29.83 },
  { Svg: Ribbon1, x: 207.37, y: 181.24, width: 54.334, height: 70.499, innerWidth: 23.882, innerHeight: 67.573, left: -3.224, top: -4.63, angle: 29.83 },
  { Svg: Ribbon1, x: 51, y: 357, width: 54.334, height: 70.499, innerWidth: 23.882, innerHeight: 67.573, left: -3.224, top: -4.63, angle: 29.83 },
  { Svg: Ribbon11, x: 111.29, y: 168.16, width: 68.142, height: 47.392, innerWidth: 65.884, innerHeight: 20.433, left: -3.281, top: -5.004, angle: -26.17 },
  { Svg: Ribbon12, x: 31, y: 139, width: 41.124, height: 42.112, innerWidth: 35.421, innerHeight: 34.108, left: 0, top: -3.526, angle: 102.83 },
  { Svg: Ribbon13, x: 286, y: 117, width: 61.823, height: 37.597, innerWidth: 59.126, innerHeight: 18.338, left: -3.281, top: -5.004, angle: -20.17 },
  { Svg: Ribbon13, x: 317, y: 310, width: 61.823, height: 37.597, innerWidth: 59.126, innerHeight: 18.338, left: -3.281, top: -5.004, angle: -20.17 },
  { Svg: Ribbon24, x: 276, y: 479, width: 60.107, height: 58.66, innerWidth: 50.918, innerHeight: 49.031, left: 0, top: -3.526, angle: -12.17 },
] satisfies Array<{
  Svg: ComponentType<SvgProps>;
  x: number;
  y: number;
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  left: number;
  top: number;
  angle: number;
}>;

function ConfettiPiece({
  piece,
  screenHeight,
  topInset,
}: {
  piece: (typeof confetti)[number];
  screenHeight: number;
  topInset: number;
}) {
  const start = Math.min(1, (piece.y + 100) / (screenHeight + 200));
  const progress = useRef(new Animated.Value(start)).current;

  useEffect(() => {
    let active = true;
    let loop: Animated.CompositeAnimation | undefined;
    progress.setValue(start);
    const firstFall = Animated.timing(progress, {
      toValue: 1,
      duration: 9000 * (1 - start),
      easing: Easing.linear,
      useNativeDriver: true,
      isInteraction: false,
    });
    firstFall.start(({ finished }) => {
      if (!finished || !active) return;
      progress.setValue(0);
      loop = Animated.loop(
        Animated.timing(progress, {
          toValue: 1,
          duration: 9000,
          easing: Easing.linear,
          useNativeDriver: true,
          isInteraction: false,
        }),
      );
      loop.start();
    });
    return () => {
      active = false;
      firstFall.stop();
      loop?.stop();
    };
  }, [progress, start]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-100 - topInset, screenHeight + 100 - topInset],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 1, 1, 0],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 6, 0, -6, 0],
  });
  const Svg = piece.Svg;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.confettiPiece,
        {
          left: piece.x,
          width: piece.width,
          height: piece.height,
          opacity,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      <View
        style={{
          width: piece.innerWidth,
          height: piece.innerHeight,
          transform: [{ rotate: `${piece.angle}deg` }],
        }}
      >
        <Svg style={{ position: "absolute", left: piece.left, top: piece.top }} />
      </View>
    </Animated.View>
  );
}

export default function LevelUpScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // 서버가 레벨업을 확인한 산책에서만 이 화면에 온다(6-2가 이벤트를 넘긴다). 없으면 홈으로 보낸다.
  const event = getLevelUpEvent();

  useEffect(() => {
    if (!event) router.replace("/3");
  }, [event, router]);

  if (!event) return null;

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-6-3"
    >
      <View style={styles.root}>
        <Image
          accessible={false}
          resizeMode="stretch"
          source={background}
          style={[styles.background, { top: -top }]}
        />
        <View style={styles.frame} pointerEvents="box-none">
          {confetti.map((piece, index) => (
            <ConfettiPiece
              key={index}
              piece={piece}
              screenHeight={height}
              topInset={top}
            />
          ))}

          <View style={[styles.card, { top: 220 - top }]} pointerEvents="none">
            <CardBack style={styles.cardBack} />
            <CardMiddle style={styles.cardMiddle} />
            <CardFront style={styles.cardFront} />
            <Paw style={styles.paw} />
            <View style={styles.levelCopy}>
              <Text style={styles.levelText}>
                {`Level UP!\n산책 레벨 ${event.after_level}이 되었어요`}
              </Text>
              <Text style={styles.levelSubtext}>
                {"이제 더 많은 친구들과\n산책할 수 있어요!"}
              </Text>
            </View>
          </View>

          <GradientView token={gradientLevelUpButton} style={styles.continueButton}>
            <Pressable
              accessibilityLabel="이어하개!"
              accessibilityRole="button"
              onPress={() => router.replace("/3")}
              style={styles.continuePressable}
            >
              <Text style={styles.continueText}>이어하개!</Text>
            </Pressable>
          </GradientView>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
  },
  background: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
  frame: {
    alignSelf: "center",
    flex: 1,
    width: 375,
  },
  confettiPiece: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
  },
  card: {
    alignSelf: "center",
    height: 358,
    position: "absolute",
    width: 238,
  },
  cardBack: {
    left: 0.86,
    position: "absolute",
    top: 47,
  },
  cardMiddle: {
    left: 0.86,
    position: "absolute",
    top: 23,
  },
  cardFront: {
    left: 0.86,
    position: "absolute",
    top: 0,
  },
  paw: {
    left: 82.5,
    position: "absolute",
    top: 116,
  },
  levelCopy: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 213,
  },
  levelText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 18,
    lineHeight: 22,
    textAlign: "center",
  },
  levelSubtext: {
    color: colors.deepOrange,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 18,
    lineHeight: 22,
    marginTop: 16,
    textAlign: "center",
  },
  continueButton: {
    alignSelf: "center",
    bottom: 56,
    height: 56,
    position: "absolute",
    width: 331,
  },
  continuePressable: {
    alignItems: "center",
    height: 56,
    justifyContent: "center",
    width: 331,
  },
  continueText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.title,
    textAlign: "center",
  },
});
