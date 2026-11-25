import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  AccessibilityInfo,
  Alert,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { fetchMe, routeFromServer } from "../../api/auth";
import { errorMessage } from "../../api/errorMessages";
import { savePledge } from "../../api/users";
import { Icon } from "../../components/Icon";
import { OnboardingBackground } from "../../components/OnboardingBackground";
import { OnboardingPillButton } from "../../components/OnboardingPillButton";
import { Screen } from "../../components/Screen";
import { colors, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const pawStamp = require("../../assets/images/paw-1.png");

// 도장 효과. Figma 서약 화면의 "발바닥 도장"(111.4x111.4, 카드 오른쪽 아래) 자리에 찍는다.
// 크기는 1:1 한 값만 쓴다(원본 paw-1.png가 512x512).
const STAMP_SIZE = 104;
const STAMP_CENTER_X = 304.7;
const STAMP_CENTER_Y = 603.7;
const STAMP_INK_OPACITY = 0.75;
const STAMP_TILT = -8;
const STAMP_DROP_MS = 340; // 1.8배에서 1.0배로 떨어진다(ease-in).
const STAMP_HOLD_MS = 400; // 찍힌 뒤 잠시 머문다.
const STAMP_FADE_OUT_MS = 200;
const STAMP_REDUCED_FADE_MS = 400;

export default function PledgeScreen() {
  const router = useRouter();
  const submittingRef = useRef(false);
  const mountedRef = useRef(true);
  const reduceMotionRef = useRef(false);
  const stampAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const [busy, setBusy] = useState(false);
  const stampScale = useRef(new Animated.Value(1.8)).current;
  const stampOpacity = useRef(new Animated.Value(0)).current;
  const stampTilt = useRef(new Animated.Value(-14)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const pressY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    mountedRef.current = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotionRef.current = enabled;
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      reduceMotionRef.current = enabled;
    });
    return () => {
      // 화면을 떠나면 애니메이션을 멈추고, 끝난 뒤 이동이나 상태 변경을 하지 않는다.
      mountedRef.current = false;
      stampAnimationRef.current?.stop();
      subscription.remove();
    };
  }, []);

  const timing = (value: Animated.Value, toValue: number, duration: number, easing = Easing.out(Easing.quad)) =>
    Animated.timing(value, { toValue, duration, easing, useNativeDriver: true });

  // 도장 애니메이션. 끝까지 재생되면 true, 중간에 멈추면(요청 실패, 화면 이탈) false.
  const playStamp = (): Promise<boolean> => {
    const reduced = reduceMotionRef.current;
    stampScale.setValue(reduced ? 1 : 1.8);
    stampTilt.setValue(reduced ? STAMP_TILT : -14);
    stampOpacity.setValue(0);
    shakeX.setValue(0);
    pressY.setValue(0);

    // "동작 줄이기" 설정이면 흔들림과 튕김 없이 도장이 서서히 나타나기만 한다.
    const animation = reduced
      ? Animated.sequence([timing(stampOpacity, STAMP_INK_OPACITY, STAMP_REDUCED_FADE_MS), Animated.delay(STAMP_HOLD_MS)])
      : Animated.sequence([
          Animated.parallel([
            timing(stampScale, 1, STAMP_DROP_MS, Easing.in(Easing.cubic)),
            timing(stampTilt, STAMP_TILT, STAMP_DROP_MS, Easing.in(Easing.cubic)),
            timing(stampOpacity, STAMP_INK_OPACITY, 220),
          ]),
          // 닿는 순간: 도장이 살짝 눌렸다 튕기고, 카드가 눌리며 화면이 짧게 흔들린다.
          Animated.parallel([
            Animated.sequence([
              timing(stampScale, 0.93, 70),
              Animated.spring(stampScale, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }),
            ]),
            Animated.sequence([
              timing(shakeX, -5, 40),
              timing(shakeX, 5, 50),
              timing(shakeX, -3, 50),
              timing(shakeX, 2, 50),
              timing(shakeX, 0, 50),
            ]),
            Animated.sequence([timing(pressY, 4, 60), timing(pressY, 0, 240)]),
          ]),
          Animated.delay(STAMP_HOLD_MS),
        ]);
    stampAnimationRef.current = animation;
    return new Promise((resolve) => animation.start(({ finished }) => resolve(finished)));
  };

  const fadeOutStamp = () =>
    new Promise<void>((resolve) => {
      stampAnimationRef.current?.stop();
      shakeX.setValue(0);
      pressY.setValue(0);
      timing(stampOpacity, 0, STAMP_FADE_OUT_MS).start(() => resolve());
    });

  const handleFailure = async (status: number, code: string | null) => {
    if (status === 401) {
      router.replace("/1-2");
    } else if (code === "AGE_REVIEW_REQUIRED") {
      const route = await routeFromServer();
      if (route) router.replace(route);
    } else {
      Alert.alert("알림", errorMessage(code));
    }
  };

  // 서약 요청. 성공이면 null, 실패면 실패를 화면에 알리는 함수를 돌려준다(도장을 걷은 뒤 실행한다).
  const requestPledge = async (): Promise<null | (() => Promise<void>)> => {
    const me = await fetchMe();
    if (!me.ok) return () => handleFailure(me.status, me.code);
    if (!me.data.current_pledge_version) {
      return async () => Alert.alert("알림", errorMessage(null));
    }
    const res = await savePledge(me.data.current_pledge_version);
    // PLEDGE_VERSION_MISMATCH, PLEDGE_NOT_ALLOWED 등
    return res.ok ? null : () => handleFailure(res.status, res.code);
  };

  // 도장 애니메이션과 서약 요청을 함께 시작하고, 둘 다 끝나야 다음 화면으로 간다.
  const submitPledge = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setBusy(true);
    try {
      const stamp = playStamp();
      const failure = await requestPledge();
      if (!mountedRef.current) return;
      if (failure) {
        await fadeOutStamp();
        if (!mountedRef.current) return;
        await failure();
        return;
      }
      const played = await stamp;
      if (played && mountedRef.current) router.replace("/2-1");
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) setBusy(false);
    }
  };

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-1-6"
    >
      <View style={styles.root}>
        <OnboardingBackground />

        <Animated.View
          style={[styles.contentFrame, { transform: [{ translateX: shakeX }, { translateY: pressY }] }]}
        >
          <View style={styles.dogIconFrame}>
            <View style={styles.dogIconImage}>
              <Icon
                name="icon-dog"
                size={55}
                width={51.5625}
                height={47.4627}
                color={colors.orange}
              />
            </View>
          </View>

          <Text style={styles.title}>산책, 신중하개!</Text>
          <Text style={styles.subtitle}>
            보호견과 함께 산책하고{"\n"}건강도 챙겨 보세요 :)
          </Text>

          <View style={styles.pledgeCard}>
            <Text style={styles.cardTitle}>같이걷개 서약서</Text>

            <View style={styles.firstPledgeRow}>
              <Image
                accessible={false}
                resizeMode="contain"
                source={pawStamp}
                style={styles.bulletPaw}
              />
              <Text style={styles.pledgeText}>
                산책 승인 여부는 보호소에게 있어요!
              </Text>
            </View>

            <View style={styles.secondPledgeRow}>
              <Image
                accessible={false}
                resizeMode="contain"
                source={pawStamp}
                style={styles.bulletPaw}
              />
              <Text style={styles.pledgeText}>
                보호견과 함께 안전하게{"\n"}산책을 진행할 거예요!
              </Text>
            </View>

            <View style={styles.thirdPledgeRow}>
              <Image
                accessible={false}
                resizeMode="contain"
                source={pawStamp}
                style={styles.bulletPaw}
              />
              <Text style={styles.pledgeText}>
                위 내용을 모두 확인했어요
              </Text>
            </View>

            <Text style={styles.closingText}>
              보호견과 산책은 간단한 일이 아닙니다{"\n"}
              충분한 고민 후 결정해 주세요 :)
            </Text>
          </View>

          <View style={styles.decorativePawFrame}>
            <Icon
              name="icon-paw-stamp"
              size={111.437}
              width={80.023}
              height={73.389}
            />
          </View>
        </Animated.View>

        <View pointerEvents="none" style={styles.stampLayer}>
          <Animated.Image
            accessible={false}
            source={pawStamp}
            style={[
              styles.stamp,
              {
                opacity: stampOpacity,
                transform: [
                  { rotate: stampTilt.interpolate({ inputRange: [-360, 360], outputRange: ["-360deg", "360deg"] }) },
                  { scale: stampScale },
                ],
              },
            ]}
          />
        </View>

        <OnboardingPillButton
          title="약속했개!"
          disabled={busy}
          onPress={submitPledge}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
  },
  contentFrame: {
    alignSelf: "center",
    flex: 1,
    width: 375,
  },
  stampLayer: {
    alignSelf: "center",
    bottom: 0,
    position: "absolute",
    top: 0,
    width: 375,
  },
  stamp: {
    aspectRatio: 1,
    height: STAMP_SIZE,
    left: STAMP_CENTER_X - STAMP_SIZE / 2,
    position: "absolute",
    resizeMode: "contain",
    top: STAMP_CENTER_Y - STAMP_SIZE / 2,
    width: STAMP_SIZE,
  },
  dogIconFrame: {
    height: 55,
    left: 160,
    position: "absolute",
    top: 94,
    width: 55,
  },
  dogIconImage: {
    left: 1.71875,
    position: "absolute",
    top: 5.81851,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.gumiRomance,
    fontSize: 32,
    letterSpacing: -0.32,
    lineHeight: 48,
    position: "absolute",
    textAlign: "center",
    top: 174,
    width: 375,
  },
  subtitle: {
    color: colors.brown,
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typography.fontSizes.subtitle,
    lineHeight: 20,
    position: "absolute",
    textAlign: "center",
    top: 227,
    width: 375,
  },
  pledgeCard: {
    backgroundColor: colors.pledgeCardBackground,
    borderRadius: 15,
    height: 346,
    left: 22,
    position: "absolute",
    top: 307,
    width: 331,
  },
  cardTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.gumiRomance,
    fontSize: typography.fontSizes.title,
    letterSpacing: -0.2,
    lineHeight: 30,
    position: "absolute",
    textAlign: "center",
    top: 27.5,
    width: 331,
  },
  firstPledgeRow: {
    height: 33,
    left: 31,
    position: "absolute",
    top: 79,
    width: 280,
  },
  secondPledgeRow: {
    height: 38,
    left: 31,
    position: "absolute",
    top: 143,
    width: 280,
  },
  thirdPledgeRow: {
    height: 28,
    left: 31,
    position: "absolute",
    top: 196,
    width: 280,
  },
  bulletPaw: {
    height: 24,
    left: 0,
    position: "absolute",
    top: 2,
    width: 24,
  },
  pledgeText: {
    color: colors.pledgeText,
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typography.fontSizes.bodyLarge,
    left: 31,
    lineHeight: 17.25,
    position: "absolute",
    top: 5,
  },
  closingText: {
    color: colors.brown,
    fontFamily: fontFamilies.pretendardMedium,
    fontSize: typography.fontSizes.subtitle,
    height: 40,
    left: 33.5,
    lineHeight: 20,
    position: "absolute",
    textAlign: "center",
    top: 261,
    width: 264,
  },
  decorativePawFrame: {
    alignItems: "center",
    height: 111.437,
    justifyContent: "center",
    left: 249,
    position: "absolute",
    top: 548,
    width: 111.437,
  },
});
