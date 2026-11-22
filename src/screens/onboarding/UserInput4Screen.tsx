import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ConsentCheckbox } from "../../components/ConsentCheckbox";
import { OnboardingChoiceChip } from "../../components/OnboardingChoiceChip";
import { OnboardingRadioOption } from "../../components/OnboardingRadioOption";
import { OnboardingStepNavigation } from "../../components/OnboardingStepNavigation";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { UserInfoBackground } from "../../components/UserInfoBackground";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const TIME_OPTIONS = [
  { label: "평일 오전", style: "weekdayMorning" },
  { label: "평일 오후", style: "weekdayAfternoon" },
  { label: "주말 오전", style: "weekendMorning" },
  { label: "주말 오후", style: "weekendAfternoon" },
] as const;

export default function UserInput4Screen() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [availableTimes, setAvailableTimes] = useState(["주말 오전", "주말 오후"]);
  const [walkDuration, setWalkDuration] = useState("30분 ~ 1시간");
  const [comfortableDogSize, setComfortableDogSize] = useState(
    "소형견 (10kg 미만)",
  );
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const toggleAvailableTime = (time: string) => {
    setAvailableTimes((current) =>
      current.includes(time)
        ? current.filter((value) => value !== time)
        : [...current, time],
    );
  };

  const completeRegistration = () => {
    if (!city.trim() || !district.trim() || !termsAccepted || !privacyAccepted) {
      Alert.alert("입력 확인", "활동 지역을 입력하고 필수 동의를 확인해 주세요.");
      return;
    }
    Alert.alert("목업 안내", "현재 동의 내용은 실제로 저장되거나 전송되지 않아요.", [
      { text: "확인", onPress: () => router.push("/2-6") },
    ]);
  };

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-2-5"
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
              Your{"\n"}Walking Routine
            </Text>
            <Text style={styles.step}>Step 3 of 3</Text>

            <Text style={[styles.sectionLabel, styles.regionLabel]}>
              10. 활동하고 싶은 지역
            </Text>
            <PillTextInput
              accessibilityLabel="시·도 선택"
              borderColor={colors.lightOrange}
              borderRadius={radii.chip}
              fontFamily={fontFamilies.nanumSquareRoundRegular}
              fontSize={typography.fontSizes.subtitle}
              height={44}
              onChangeText={setCity}
              paddingHorizontal={8}
              placeholder="시·도 선택"
              placeholderColor={colors.brown}
              style={[styles.regionInput, styles.cityInput]}
              textAlign="center"
              value={city}
            />
            <PillTextInput
              accessibilityLabel="시·군·구 선택"
              borderColor={colors.lightOrange}
              borderRadius={radii.chip}
              fontFamily={fontFamilies.nanumSquareRoundRegular}
              fontSize={typography.fontSizes.subtitle}
              height={44}
              onChangeText={setDistrict}
              paddingHorizontal={8}
              placeholder="시·군·구 선택"
              placeholderColor={colors.brown}
              style={[styles.regionInput, styles.districtInput]}
              textAlign="center"
              value={district}
            />
            <Text style={styles.regionHint}>
              상세 주소 없이 보호소 방문 지역만 선택해요.
            </Text>

            <Text style={[styles.sectionLabel, styles.timeLabel]}>
              11. 산책 가능한 때 (복수 선택)
            </Text>
            <View style={styles.timeOptions}>
              {TIME_OPTIONS.map(({ label, style }) => (
                <OnboardingChoiceChip
                  key={label}
                  fontSize={typography.fontSizes.subtitle}
                  label={label}
                  onPress={() => toggleAvailableTime(label)}
                  selected={availableTimes.includes(label)}
                  style={styles[style]}
                />
              ))}
            </View>

            <Text style={[styles.sectionLabel, styles.durationLabel]}>
              12. 한 번에 가능한 산책 시간
            </Text>
            <OnboardingRadioOption
              label="30분 이내"
              onPress={() => setWalkDuration("30분 이내")}
              selected={walkDuration === "30분 이내"}
              style={styles.durationFirst}
            />
            <OnboardingRadioOption
              label="30분 ~ 1시간"
              onPress={() => setWalkDuration("30분 ~ 1시간")}
              selected={walkDuration === "30분 ~ 1시간"}
              style={styles.durationSecond}
            />
            <OnboardingRadioOption
              label="1시간 이상"
              onPress={() => setWalkDuration("1시간 이상")}
              selected={walkDuration === "1시간 이상"}
              style={styles.durationThird}
            />

            <Text style={[styles.sectionLabel, styles.comfortableSizeLabel]}>
              13. 편하게 산책할 수 있는 크기
            </Text>
            <OnboardingRadioOption
              label="소형견 (10kg 미만)"
              onPress={() => setComfortableDogSize("소형견 (10kg 미만)")}
              selected={comfortableDogSize === "소형견 (10kg 미만)"}
              style={styles.sizeFirst}
            />
            <OnboardingRadioOption
              label="중형견 (10~25kg)"
              onPress={() => setComfortableDogSize("중형견 (10~25kg)")}
              selected={comfortableDogSize === "중형견 (10~25kg)"}
              style={styles.sizeSecond}
            />
            <OnboardingRadioOption
              label="대형견 (25kg 이상)"
              onPress={() => setComfortableDogSize("대형견 (25kg 이상)")}
              selected={comfortableDogSize === "대형견 (25kg 이상)"}
              style={styles.sizeThird}
            />

            <Text style={styles.recommendationNote}>
              성향과 산책 경험도 함께 고려해 추천해요.{"\n"}
              사전 교육과 최종 활동 승인은 보호소가 확인해요.
            </Text>

            <Text style={[styles.sectionLabel, styles.agreementsLabel]}>
              14. 가입을 위한 필수 동의
            </Text>
            <ConsentCheckbox
              accessibilityLabel="이용약관 동의"
              borderColor={colors.lightOrange}
              borderRadius={radii.checkbox}
              checked={termsAccepted}
              onPress={() => setTermsAccepted((accepted) => !accepted)}
              size={20}
              style={[styles.checkbox, styles.termsCheckbox]}
            />
            <Text style={[styles.agreementLabel, styles.termsLabel]}>
              [필수] 이용약관 동의
            </Text>
            <Pressable
              accessibilityLabel="이용약관 보기"
              accessibilityRole="link"
              onPress={() => router.push({ pathname: "/policy-info", params: { kind: "terms" } })}
              style={[styles.viewLink, styles.termsLink]}
            >
              <Text style={styles.viewLinkText}>보기</Text>
            </Pressable>

            <ConsentCheckbox
              accessibilityLabel="개인정보 수집·이용 동의"
              borderColor={colors.lightOrange}
              borderRadius={radii.checkbox}
              checked={privacyAccepted}
              onPress={() => setPrivacyAccepted((accepted) => !accepted)}
              size={20}
              style={[styles.checkbox, styles.privacyCheckbox]}
            />
            <Text style={[styles.agreementLabel, styles.privacyLabel]}>
              [필수] 개인정보 수집·이용 동의
            </Text>
            <Pressable
              accessibilityLabel="개인정보 수집·이용 내용 보기"
              accessibilityRole="link"
              onPress={() => router.push({ pathname: "/policy-info", params: { kind: "privacy" } })}
              style={[styles.viewLink, styles.privacyLink]}
            >
              <Text style={styles.viewLinkText}>보기</Text>
            </Pressable>
          </View>
        </ScrollView>

        <OnboardingStepNavigation
          bottom={38}
          nextBold
          nextLabel="완료하개"
          onPrevious={() => router.replace("/2-4")}
          onNext={completeRegistration}
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
    height: 1100,
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
  regionLabel: {
    top: 138,
  },
  regionInput: {
    position: "absolute",
    width: 147,
  },
  cityInput: {
    left: 30,
    top: 172,
  },
  districtInput: {
    left: 189,
    top: 172,
  },
  regionHint: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.small,
    left: 30,
    lineHeight: 17,
    position: "absolute",
    top: 230,
    width: 316,
  },
  timeLabel: {
    top: 280,
  },
  timeOptions: {
    height: 94,
    left: 0,
    position: "absolute",
    top: 314,
    width: 375,
  },
  weekdayMorning: {
    left: 30,
    top: 0,
    width: 147,
  },
  weekdayAfternoon: {
    left: 189,
    top: 0,
    width: 147,
  },
  weekendMorning: {
    left: 30,
    top: 50,
    width: 147,
  },
  weekendAfternoon: {
    left: 189,
    top: 50,
    width: 147,
  },
  durationLabel: {
    top: 448,
  },
  durationFirst: {
    top: 482,
  },
  durationSecond: {
    top: 532,
  },
  durationThird: {
    top: 582,
  },
  comfortableSizeLabel: {
    top: 668,
  },
  sizeFirst: {
    top: 702,
  },
  sizeSecond: {
    top: 752,
  },
  sizeThird: {
    top: 802,
  },
  recommendationNote: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    left: 30,
    lineHeight: 20,
    position: "absolute",
    top: 870,
    width: 310,
  },
  agreementsLabel: {
    top: 946,
  },
  checkbox: {
    position: "absolute",
  },
  termsCheckbox: {
    left: 32,
    top: 982,
  },
  privacyCheckbox: {
    left: 32,
    top: 1024,
  },
  agreementLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    left: 64,
    lineHeight: 20,
    position: "absolute",
    width: 240,
  },
  termsLabel: {
    top: 982,
  },
  privacyLabel: {
    top: 1024,
  },
  viewLink: {
    alignItems: "center",
    height: 20,
    left: 306,
    justifyContent: "center",
    position: "absolute",
    width: 30,
  },
  termsLink: {
    top: 982,
  },
  privacyLink: {
    top: 1024,
  },
  viewLinkText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.smallBody,
    lineHeight: 18,
    textDecorationLine: "underline",
  },
});
