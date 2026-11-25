import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { entryRouteForDogExperience } from "../../api/onboarding";
import { getOnboardingDraft, setHasExperience as saveHasExperience } from "../../api/onboardingDraft";
import { OnboardingStepNavigation } from "../../components/OnboardingStepNavigation";
import { Screen } from "../../components/Screen";
import { UserInfoBackground } from "../../components/UserInfoBackground";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function UserInput2Screen() {
  const router = useRouter();
  const [hasExperience, setHasExperience] = useState(
    getOnboardingDraft().hasExperience ?? false,
  );

  useEffect(() => {
    let cancelled = false;
    // 이미 끝낸 단계면 서버 상태에 맞는 화면으로 간다.
    void entryRouteForDogExperience().then((route) => {
      if (route && !cancelled) router.replace(route);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-2-3"
    >
      <View style={styles.root}>
        <UserInfoBackground />

        <View style={styles.contentFrame}>
          <Text style={styles.firstTitle}>
            Your{"\n"}Pet Experience
          </Text>
          <Text style={styles.step}>Step 2 of 3</Text>

          <Text style={styles.question}>
            04. 반려견을 돌본 경험이 있나요?
          </Text>

          <Pressable
            accessibilityLabel="아직 경험이 없어요"
            accessibilityRole="button"
            accessibilityState={{ selected: !hasExperience }}
            onPress={() => setHasExperience(false)}
            style={[styles.option, styles.firstOption]}
          >
            <View
              style={[
                styles.radio,
                !hasExperience && styles.selectedRadio,
              ]}
            />
            <Text style={styles.optionText}>아직 경험이 없어요</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="키우거나 돌본 경험이 있어요"
            accessibilityRole="button"
            accessibilityState={{ selected: hasExperience }}
            onPress={() => setHasExperience(true)}
            style={[styles.option, styles.secondOption]}
          >
            <View
              style={[styles.radio, hasExperience && styles.selectedRadio]}
            />
            <Text style={styles.optionText}>
              키우거나 돌본 경험이 있어요
            </Text>
          </Pressable>
          <Text style={styles.experienceHint}>
            직접 양육한 경험뿐 아니라 임시보호,{"\n"}
            봉사 활동에서 돌본 경험도 포함해요!
          </Text>

          <Text style={styles.secondTitle}>
            Your{"\n"}First Walk
          </Text>
          <Text style={styles.firstWalkHeading}>
            처음이어도 괜찮아요!
          </Text>
          <Text style={styles.firstWalkDetails}>
            차분한 강아지부터 산책을 시작해요.{"\n"}
            보호소의 사전 안내와 교육을 받고,{"\n"}
            첫 산책의 동행 여부도 함께 확인해요.{"\n\n"}
            처음이어도 괜찮아요. 다음 단계에서 산책 방식만 알려 주세요 :)
          </Text>

          <OnboardingStepNavigation
            onPrevious={() => router.replace("/2-2")}
            onNext={() => {
              saveHasExperience(hasExperience);
              router.push("/2-4");
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
    width: "100%",
  },
  contentFrame: {
    alignSelf: "center",
    flex: 1,
    width: 375,
  },
  firstTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.screenHeading,
    left: 23,
    lineHeight: 26,
    position: "absolute",
    top: 60,
  },
  step: {
    color: colors.orange,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.stepLabel,
    left: 266,
    lineHeight: 25,
    position: "absolute",
    top: 59,
    width: 100,
  },
  question: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
    left: 30,
    lineHeight: 22,
    position: "absolute",
    top: 138,
    width: 316,
  },
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
  firstOption: {
    top: 172,
  },
  secondOption: {
    top: 222,
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
  optionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.subtitle,
    left: 47,
    lineHeight: 22,
    position: "absolute",
    top: 10,
  },
  experienceHint: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    left: 30,
    lineHeight: 20,
    position: "absolute",
    top: 278,
    width: 306,
  },
  secondTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.screenHeading,
    left: 23,
    lineHeight: 26,
    position: "absolute",
    top: 382,
  },
  firstWalkHeading: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.stepLabel,
    left: 30,
    lineHeight: 22,
    position: "absolute",
    top: 453,
  },
  firstWalkDetails: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.subtitle,
    left: 30,
    lineHeight: 22,
    position: "absolute",
    top: 484,
    width: 306,
  },
});
