import { useEffect, useRef, useState } from "react";
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

import { routeForStep, routeFromServer } from "../../api/auth";
import { errorMessage } from "../../api/errorMessages";
import {
  entryRouteForWalkingRoutine,
  fetchPolicyVersion,
  fetchSido,
  fetchSigungu,
  saveWalkingRoutine,
} from "../../api/onboarding";
import {
  COMFORTABLE_DOG_SIZE_CODES,
  TIME_SLOT_CODES,
  WALKING_DURATION_CODES,
} from "../../api/onboardingCodes";
import { setRegionCodes } from "../../api/onboardingDraft";
import { ConsentCheckbox } from "../../components/ConsentCheckbox";
import { OnboardingChoiceChip } from "../../components/OnboardingChoiceChip";
import { OnboardingRadioOption } from "../../components/OnboardingRadioOption";
import { OnboardingStepNavigation } from "../../components/OnboardingStepNavigation";
import {
  OptionListSheet,
  type SheetOption,
} from "../../components/OptionListSheet";
import { Screen } from "../../components/Screen";
import { SelectField } from "../../components/SelectField";
import { UserInfoBackground } from "../../components/UserInfoBackground";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const TIME_OPTIONS = [
  { label: "평일 오전", style: "weekdayMorning" },
  { label: "평일 오후", style: "weekdayAfternoon" },
  { label: "주말 오전", style: "weekendMorning" },
  { label: "주말 오후", style: "weekendAfternoon" },
] as const;

const MAX_REGIONS = 3;
// 선택한 지역 칩과 "+ 지역 추가" 버튼이 차지하는 높이. 아래 항목을 이만큼 내린다.
const REGION_EXTRA_HEIGHT = 56;

type ChosenRegion = { code: string; label: string };
type SheetKind = "sido" | "sigungu" | null;

export default function UserInput4Screen() {
  const router = useRouter();
  const [sido, setSido] = useState<SheetOption | null>(null);
  const [sigungu, setSigungu] = useState<SheetOption | null>(null);
  // 고른 시·군·구(1~3개). currentIndex는 위 두 칸이 가리키는 항목이다.
  const [regions, setRegions] = useState<ChosenRegion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [sidoOptions, setSidoOptions] = useState<SheetOption[] | null>(null);
  const [sigunguOptions, setSigunguOptions] = useState<
    Record<string, SheetOption[]>
  >({});
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetFailed, setSheetFailed] = useState(false);
  const optionRequestRef = useRef(0);
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

  const submittingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    // 이미 끝낸 단계면 서버 상태에 맞는 화면으로 간다.
    void entryRouteForWalkingRoutine().then((route) => {
      if (route && !cancelled) router.replace(route);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  // 고른 지역 코드를 draft에 둔다. 저장할 때 이 값을 보낸다.
  useEffect(() => {
    setRegionCodes(regions.map((region) => region.code));
  }, [regions]);

  const loadOptions = async (kind: "sido" | "sigungu", sidoCode?: string) => {
    const requestId = ++optionRequestRef.current;
    setSheetLoading(true);
    setSheetFailed(false);
    const res =
      kind === "sido" ? await fetchSido() : await fetchSigungu(sidoCode ?? "");
    if (requestId !== optionRequestRef.current) return;
    setSheetLoading(false);
    if (!res.ok) {
      setSheetFailed(true);
      return;
    }
    const options = res.data.regions.map((region) => ({
      code: region.region_code,
      name: region.region_name,
    }));
    if (kind === "sido") {
      setSidoOptions(options);
    } else if (sidoCode) {
      setSigunguOptions((current) => ({ ...current, [sidoCode]: options }));
    }
  };

  const openSheet = (kind: "sido" | "sigungu") => {
    setSheet(kind);
    setSheetLoading(false);
    setSheetFailed(false);
    if (kind === "sido") {
      if (!sidoOptions) void loadOptions("sido");
    } else if (sido && !sigunguOptions[sido.code]) {
      void loadOptions("sigungu", sido.code);
    }
  };

  const retrySheet = () => {
    if (sheet === "sido") void loadOptions("sido");
    else if (sheet === "sigungu" && sido) void loadOptions("sigungu", sido.code);
  };

  const closeSheet = () => {
    optionRequestRef.current += 1;
    setSheet(null);
  };

  const removeCurrentRegion = () => {
    if (currentIndex === null) return;
    setRegions((current) => current.filter((_, index) => index !== currentIndex));
    setCurrentIndex(null);
  };

  // 시·도를 바꾸면 시·군·구를 비운다.
  const selectSido = (option: SheetOption) => {
    if (sido?.code !== option.code) {
      removeCurrentRegion();
      setSido(option);
      setSigungu(null);
    }
    closeSheet();
  };

  const selectSigungu = (option: SheetOption) => {
    const alreadyChosen = regions.some(
      (region, index) => region.code === option.code && index !== currentIndex,
    );
    if (!alreadyChosen) {
      const item = { code: option.code, label: option.name };
      if (currentIndex !== null) {
        setRegions((current) =>
          current.map((region, index) => (index === currentIndex ? item : region)),
        );
      } else if (regions.length < MAX_REGIONS) {
        setRegions((current) => [...current, item]);
        setCurrentIndex(regions.length);
      }
      setSigungu(option);
    }
    closeSheet();
  };

  const removeRegion = (index: number) => {
    setRegions((current) => current.filter((_, position) => position !== index));
    if (currentIndex === null) return;
    if (index === currentIndex) {
      setCurrentIndex(null);
      setSigungu(null);
    } else if (index < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const addAnotherRegion = () => {
    setCurrentIndex(null);
    setSido(null);
    setSigungu(null);
  };

  const sheetOptions =
    sheet === "sido" ? sidoOptions : sido ? (sigunguOptions[sido.code] ?? null) : null;

  const completeRegistration = async () => {
    if (regions.length === 0 || !termsAccepted || !privacyAccepted) {
      Alert.alert("입력 확인", "활동 지역을 입력하고 필수 동의를 확인해 주세요.");
      return;
    }
    if (availableTimes.length === 0) {
      Alert.alert("입력 확인", errorMessage("TIME_SLOTS_REQUIRED"));
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      const [terms, privacy] = await Promise.all([
        fetchPolicyVersion("terms"),
        fetchPolicyVersion("privacy"),
      ]);
      // 503 POLICY_DOCUMENT_UNAVAILABLE 등: 저장하지 않고 화면에 머문다.
      if (!terms.ok || !privacy.ok) {
        Alert.alert(
          "알림",
          errorMessage(!terms.ok ? terms.code : !privacy.ok ? privacy.code : null),
        );
        return;
      }

      const res = await saveWalkingRoutine({
        region_codes: regions.map((region) => region.code),
        available_time_slot_codes: availableTimes.map(
          (time) => TIME_SLOT_CODES[time],
        ),
        walking_duration_code: WALKING_DURATION_CODES[walkDuration],
        comfortable_dog_size_code: COMFORTABLE_DOG_SIZE_CODES[comfortableDogSize],
        agreements: {
          terms: { document_version: terms.data.document_version, agreed: true },
          privacy: {
            document_version: privacy.data.document_version,
            agreed: true,
          },
        },
      });

      if (res.ok) {
        // 모든 단계가 끝났으면(null) 위치 안내(2-6)로, 아니면 서버가 알려준 단계로 간다.
        const step = res.data.next_onboarding_step;
        const target = step === null ? "/2-6" : (routeForStep(step) ?? "/2-6");
        Alert.alert("동의 완료", "동의 내용이 저장됐어요.", [
          { text: "확인", onPress: () => router.push(target) },
        ]);
        return;
      }
      if (res.status === 401) {
        router.replace("/1-2");
      } else if (
        res.code === "WALKING_ROUTINE_ALREADY_COMPLETED" ||
        res.code === "PREVIOUS_STEP_NOT_COMPLETED" ||
        res.code === "ONBOARDING_NOT_ALLOWED"
      ) {
        const route = await routeFromServer();
        if (route) router.replace(route);
      } else {
        // POLICY_VERSION_MISMATCH는 다음 제출에서 최신 버전을 다시 조회한다.
        Alert.alert("알림", errorMessage(res.code));
      }
    } finally {
      submittingRef.current = false;
    }
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
            <SelectField
              accessibilityLabel="시·도 선택"
              onPress={() => openSheet("sido")}
              placeholder="시·도 선택"
              style={[styles.regionInput, styles.cityInput]}
              value={sido?.name ?? null}
            />
            <SelectField
              accessibilityLabel="시·군·구 선택"
              disabled={!sido}
              onPress={() => openSheet("sigungu")}
              placeholder="시·군·구 선택"
              style={[styles.regionInput, styles.districtInput]}
              value={sigungu?.name ?? null}
            />
            <Text style={styles.regionHint}>
              상세 주소 없이 보호소 방문 지역만 선택해요.
            </Text>
            {regions.map((region, index) => (
              <OnboardingChoiceChip
                key={region.code}
                fontSize={typography.fontSizes.small}
                label={`${region.label} ✕`}
                onPress={() => removeRegion(index)}
                selected
                style={[styles.regionChip, { left: 30 + index * 104 }]}
              />
            ))}
            {currentIndex !== null && regions.length < MAX_REGIONS ? (
              <Pressable
                accessibilityLabel="지역 추가"
                accessibilityRole="button"
                onPress={addAnotherRegion}
                style={styles.addRegionButton}
              >
                <Text style={styles.addRegionText}>+ 지역 추가</Text>
              </Pressable>
            ) : null}

            <View style={styles.belowRegion}>
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
          </View>
        </ScrollView>

        <OnboardingStepNavigation
          bottom={38}
          nextBold
          nextLabel="완료하개"
          onPrevious={() => router.replace("/2-4")}
          onNext={completeRegistration}
        />

        <OptionListSheet
          failed={sheetFailed}
          loading={sheetLoading}
          onClose={closeSheet}
          onRetry={retrySheet}
          onSelect={sheet === "sido" ? selectSido : selectSigungu}
          options={sheetOptions}
          selectedCode={sheet === "sido" ? (sido?.code ?? null) : (sigungu?.code ?? null)}
          title={sheet === "sido" ? "시·도 선택" : "시·군·구 선택"}
          visible={sheet !== null}
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
    height: 1100 + REGION_EXTRA_HEIGHT,
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
  belowRegion: {
    height: 1100,
    left: 0,
    position: "absolute",
    top: REGION_EXTRA_HEIGHT,
    width: 375,
  },
  regionChip: {
    height: 44,
    top: 254,
    width: 98,
  },
  addRegionButton: {
    height: 24,
    justifyContent: "center",
    left: 30,
    position: "absolute",
    top: 306,
  },
  addRegionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.smallBody,
    textDecorationLine: "underline",
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
