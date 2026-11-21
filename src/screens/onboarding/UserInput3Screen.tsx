import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { OnboardingChoiceChip } from "../../components/OnboardingChoiceChip";
import { OnboardingRadioOption } from "../../components/OnboardingRadioOption";
import { OnboardingStepNavigation } from "../../components/OnboardingStepNavigation";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { UserInfoBackground } from "../../components/UserInfoBackground";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function UserInput3Screen() {
  const router = useRouter();
  const [hasExperience, setHasExperience] = useState(true);
  const [breed, setBreed] = useState("");
  const [dogSize, setDogSize] = useState("중형견");
  const [walkFrequency, setWalkFrequency] = useState("거의 매일");
  const [walkDifficulty, setWalkDifficulty] = useState("보통이었어요");
  const [difficultSituations, setDifficultSituations] = useState([
    "줄 당김",
  ]);

  const toggleSituation = (situation: string) => {
    setDifficultSituations((current) =>
      current.includes(situation)
        ? current.filter((value) => value !== situation)
        : [...current, situation],
    );
  };

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-2-4"
    >
      <View style={styles.root}>
        <UserInfoBackground />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          style={styles.scrollView}
        >
          <View style={styles.contentFrame}>
            <Text style={styles.title}>
              Your{"\n"}Pet Experience
            </Text>
            <Text style={styles.step}>Step 2 of 3</Text>

            <Text style={[styles.sectionLabel, styles.experienceLabel]}>
              04. 반려견을 돌본 경험이 있나요?
            </Text>
            <OnboardingRadioOption
              label="아직 경험이 없어요"
              onPress={() => setHasExperience(false)}
              selected={!hasExperience}
              style={styles.noExperienceOption}
            />
            <OnboardingRadioOption
              label="키우거나 돌본 경험이 있어요"
              onPress={() => setHasExperience(true)}
              selected={hasExperience}
              style={styles.hasExperienceOption}
            />

            <Text style={[styles.sectionLabel, styles.breedLabel]}>
              05. 돌본 반려견의 견종
            </Text>
            <PillTextInput
              accessibilityLabel="돌본 반려견의 견종"
              borderColor={colors.lightOrange}
              borderRadius={radii.inputPill}
              fontFamily={fontFamilies.nanumSquareRoundRegular}
              fontSize={typography.fontSizes.bodyLarge}
              height={44}
              onChangeText={setBreed}
              paddingHorizontal={12}
              placeholder="예: 믹스견, 푸들 / 모르면 모름"
              placeholderColor={colors.brown3}
              style={[styles.breedInput, styles.textInput]}
              value={breed}
            />

            <Text style={[styles.sectionLabel, styles.sizeLabel]}>
              06. 돌본 반려견의 크기
            </Text>
            <View style={styles.sizeOptions}>
              {["소형견", "중형견", "대형견"].map((size) => (
                <OnboardingChoiceChip
                  key={size}
                  label={size}
                  onPress={() => setDogSize(size)}
                  selected={dogSize === size}
                  style={size === "소형견" ? styles.sizeOne : size === "중형견" ? styles.sizeTwo : styles.sizeThree}
                />
              ))}
            </View>

            <Text style={[styles.sectionLabel, styles.frequencyLabel]}>
              07. 직접 산책시킨 빈도
            </Text>
            <View style={styles.frequencyOptions}>
              {["거의 매일", "주 3~4회", "주 1~2회", "거의 없음"].map(
                (frequency, index) => (
                  <OnboardingChoiceChip
                    key={frequency}
                    label={frequency}
                    onPress={() => setWalkFrequency(frequency)}
                    selected={walkFrequency === frequency}
                    style={
                      index === 0
                        ? styles.frequencyOne
                        : index === 1
                          ? styles.frequencyTwo
                          : index === 2
                            ? styles.frequencyThree
                            : styles.frequencyFour
                    }
                  />
                ),
              )}
            </View>

            <Text style={[styles.sectionLabel, styles.difficultyLabel]}>
              08. 산책 난이도는 어땠나요?
            </Text>
            <OnboardingRadioOption
              label="수월했어요"
              onPress={() => setWalkDifficulty("수월했어요")}
              selected={walkDifficulty === "수월했어요"}
              style={styles.easyOption}
            />
            <OnboardingRadioOption
              label="보통이었어요"
              onPress={() => setWalkDifficulty("보통이었어요")}
              selected={walkDifficulty === "보통이었어요"}
              style={styles.normalOption}
            />
            <OnboardingRadioOption
              label="어려웠어요"
              onPress={() => setWalkDifficulty("어려웠어요")}
              selected={walkDifficulty === "어려웠어요"}
              style={styles.hardOption}
            />

            <Text style={[styles.sectionLabel, styles.situationsLabel]}>
              09. 어려웠던 상황 (복수 선택)
            </Text>
            <View style={styles.situationOptions}>
              {["줄 당김", "짖음·흥분", "다른 개 반응", "특별히 없음"].map(
                (situation, index) => (
                  <OnboardingChoiceChip
                    key={situation}
                    label={situation}
                    onPress={() => toggleSituation(situation)}
                    selected={difficultSituations.includes(situation)}
                    style={
                      index === 0
                        ? styles.situationOne
                        : index === 1
                          ? styles.situationTwo
                          : index === 2
                            ? styles.situationThree
                            : styles.situationFour
                    }
                  />
                ),
              )}
            </View>
          </View>
        </ScrollView>

        <OnboardingStepNavigation
          bottom={38}
          onPrevious={() => router.replace("/2-3")}
          onNext={() => router.push("/2-5")}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 120,
  },
  contentFrame: {
    height: 1030,
    position: "relative",
    width: 375,
  },
  title: {
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
  sectionLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
    left: 30,
    lineHeight: 22,
    position: "absolute",
    width: 316,
  },
  experienceLabel: {
    top: 138,
  },
  noExperienceOption: {
    top: 172,
  },
  hasExperienceOption: {
    top: 222,
  },
  breedLabel: {
    top: 306,
  },
  textInput: {
    left: 30,
    position: "absolute",
    width: 306,
  },
  breedInput: {
    top: 340,
  },
  sizeLabel: {
    top: 410,
  },
  sizeOptions: {
    height: 44,
    left: 0,
    position: "absolute",
    top: 444,
    width: 375,
  },
  sizeOne: {
    left: 30,
    width: 94,
  },
  sizeTwo: {
    left: 136,
    width: 94,
  },
  sizeThree: {
    left: 242,
    width: 94,
  },
  frequencyLabel: {
    top: 520,
  },
  frequencyOptions: {
    height: 94,
    left: 0,
    position: "absolute",
    top: 554,
    width: 375,
  },
  frequencyOne: {
    left: 30,
    top: 0,
    width: 147,
  },
  frequencyTwo: {
    left: 189,
    top: 0,
    width: 147,
  },
  frequencyThree: {
    left: 30,
    top: 50,
    width: 147,
  },
  frequencyFour: {
    left: 189,
    top: 50,
    width: 147,
  },
  difficultyLabel: {
    top: 688,
  },
  easyOption: {
    top: 722,
  },
  normalOption: {
    top: 772,
  },
  hardOption: {
    top: 822,
  },
  situationsLabel: {
    top: 902,
  },
  situationOptions: {
    height: 94,
    left: 0,
    position: "absolute",
    top: 936,
    width: 375,
  },
  situationOne: {
    left: 32,
    top: 0,
    width: 147,
  },
  situationTwo: {
    left: 186,
    top: 0,
    width: 147,
  },
  situationThree: {
    left: 32,
    top: 50,
    width: 147,
  },
  situationFour: {
    left: 186,
    top: 50,
    width: 147,
  },
});
