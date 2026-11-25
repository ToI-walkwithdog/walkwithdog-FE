import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  FeGaussianBlur,
  Filter,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";

import { fetchMe, routeForOnboarding } from "../../api/auth";
import { getToken } from "../../api/tokenStorage";
import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import {
  colors,
  radii,
  shadows,
  typography as typographyTokens,
} from "../../theme/tokens";
import { fontFamilies, textStyles } from "../../theme/typography";

const logo = require("../../assets/images/logo.png");
const heroDog = require("../../assets/images/dog-hero.png");
const WELCOME_DURATION_MS = 5000;

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const resolveDestination = async () => {
      if (!(await getToken())) return "/1-2" as const;
      const me = await fetchMe();
      if (!me.ok) return "/1-2" as const;
      return routeForOnboarding(me.data) ?? ("/1-2" as const);
    };

    const destination = resolveDestination();
    const timeout = setTimeout(async () => {
      const target = await destination;
      if (!cancelled) router.replace(target);
    }, WELCOME_DURATION_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-1-1"
    >
      <View style={styles.root}>
        <BackgroundBlobs />
        <View pointerEvents="none" style={styles.glowAnchor}>
          <View style={styles.greenCircleFrame}>
            <Svg
              height={206}
              style={styles.greenBlur}
              viewBox="0 0 206 206"
              width={206}
            >
              <Defs>
                <Filter
                  height={206}
                  id="greenBlur"
                  width={206}
                  x={0}
                  y={0}
                  filterUnits="userSpaceOnUse"
                >
                  <FeGaussianBlur stdDeviation={35} />
                </Filter>
              </Defs>
              <Circle
                cx={103}
                cy={103}
                fill={colors.boxOtherGreen}
                filter="url(#greenBlur)"
                r={33}
              />
            </Svg>
          </View>
          <View style={styles.purpleCircleFrame}>
            <Svg
              height={256}
              style={styles.purpleBlur}
              viewBox="0 0 260 256"
              width={260}
            >
              <Defs>
                <Filter
                  height={256}
                  id="purpleBlur"
                  width={260}
                  x={0}
                  y={0}
                  filterUnits="userSpaceOnUse"
                >
                  <FeGaussianBlur stdDeviation={35} />
                </Filter>
              </Defs>
              <Ellipse
                cx={130}
                cy={128}
                fill={colors.boxPurple}
                filter="url(#purpleBlur)"
                rx={60}
                ry={58}
              />
            </Svg>
          </View>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.contentFrame}>
            <View style={styles.friendlyLabel}>
              <View style={styles.friendlyDot} />
              <View style={styles.friendlyTextContainer}>
                <Text style={styles.labelText}>Friendly</Text>
              </View>
            </View>

            <View style={styles.smartLabel}>
              <View style={styles.smartDot} />
              <View style={styles.smartTextContainer}>
                <Text style={styles.labelText}>Smart</Text>
              </View>
            </View>

            <View style={styles.firstPaw}>
              <Icon name="icon-paw" size={29} color={colors.orange} />
            </View>
            <View style={styles.secondPaw}>
              <Icon name="icon-paw" size={29} color={colors.orange} />
            </View>

            <View style={styles.dogFrame}>
              <Image
                accessible={false}
                resizeMode="stretch"
                source={heroDog}
                style={styles.dogImage}
              />
            </View>

            <Image
              accessible={false}
              resizeMode="stretch"
              source={logo}
              style={styles.logo}
            />

            <Text style={styles.tagline}>
              AI가 찾아주는 나의 반려견, 이어주개!
            </Text>

          </View>
        </View>
      </View>
    </Screen>
  );
}

function BackgroundBlobs() {
  return (
    <View pointerEvents="none" style={styles.background}>
      <Svg
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 375 812"
        width="100%"
      >
        <Defs>
          <LinearGradient id="warmBase" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0%" stopColor={colors.cream} stopOpacity={0.62} />
            <Stop offset="54%" stopColor={colors.white} stopOpacity={1} />
            <Stop offset="100%" stopColor={colors.white} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect fill="url(#warmBase)" height={812} width={375} />
      </Svg>
    </View>
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
    top: 0,
    width: "100%",
  },
  glowAnchor: {
    alignSelf: "center",
    bottom: 351,
    height: 0,
    position: "absolute",
    width: 375,
  },
  greenCircleFrame: {
    height: 66,
    left: 40,
    position: "absolute",
    top: -178,
    width: 66,
  },
  greenBlur: {
    left: -70,
    position: "absolute",
    top: -70,
  },
  purpleCircleFrame: {
    height: 116,
    left: 206,
    position: "absolute",
    top: -315,
    width: 120,
  },
  purpleBlur: {
    left: -70,
    position: "absolute",
    top: -70,
  },
  bottomSheet: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    bottom: 0,
    elevation: 8,
    height: 351,
    position: "absolute",
    shadowColor: shadows.onboardingSheet.color,
    shadowOffset: {
      width: shadows.onboardingSheet.offsetX,
      height: shadows.onboardingSheet.offsetY,
    },
    shadowOpacity: 1,
    shadowRadius: shadows.onboardingSheet.blurRadius,
    width: "100%",
  },
  contentFrame: {
    alignSelf: "center",
    height: 351,
    overflow: "visible",
    width: 375,
  },
  friendlyLabel: {
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    height: 27,
    left: 27,
    position: "absolute",
    top: -257,
    width: 79,
  },
  friendlyDot: {
    backgroundColor: colors.boxOtherGreen,
    borderRadius: 8,
    height: 16,
    left: 5,
    position: "absolute",
    top: 6,
    width: 16,
  },
  friendlyTextContainer: {
    alignItems: "center",
    height: 27,
    justifyContent: "center",
    left: 24,
    position: "absolute",
    top: 0,
    width: 45,
  },
  smartLabel: {
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    height: 27,
    left: 281,
    position: "absolute",
    top: -115,
    width: 65,
  },
  smartDot: {
    backgroundColor: colors.boxPurple,
    borderRadius: 8,
    height: 16,
    left: 5,
    position: "absolute",
    top: 6,
    width: 16,
  },
  smartTextContainer: {
    alignItems: "center",
    height: 27,
    justifyContent: "center",
    left: 20,
    position: "absolute",
    top: 0,
    width: 40,
  },
  labelText: {
    ...textStyles.caption,
    color: colors.text,
    fontFamily: fontFamilies.gumiRomance,
    lineHeight:
      typographyTokens.fontSizes.caption *
      typographyTokens.lineHeightMultipliers.normal,
    textAlign: "center",
  },
  firstPaw: {
    left: 80,
    position: "absolute",
    top: -329,
  },
  secondPaw: {
    left: 292,
    position: "absolute",
    top: -167,
  },
  dogFrame: {
    height: 305,
    left: 80,
    overflow: "hidden",
    position: "absolute",
    top: -272,
    width: 215,
  },
  dogImage: {
    height: 321.87,
    left: -112.68,
    position: "absolute",
    top: -9.58,
    width: 483.75,
  },
  logo: {
    height: 46,
    left: 82,
    position: "absolute",
    top: 47,
    width: 210,
  },
  tagline: {
    ...textStyles.subtitle,
    color: colors.mildBrown,
    height: 20,
    left: 62.5,
    lineHeight:
      typographyTokens.fontSizes.subtitle *
      typographyTokens.lineHeightMultipliers.normal,
    letterSpacing: 0.8,
    position: "absolute",
    textAlign: "center",
    top: 105,
    width: 250,
  },
});
