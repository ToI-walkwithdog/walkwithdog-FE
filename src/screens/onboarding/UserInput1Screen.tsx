import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import {
  formatBirthDate,
  isValidBirthDate,
  isValidFullName,
  isValidPhoneNumber,
  toApiBirthDate,
} from "../../api/accountRules";
import { routeForStep, routeFromServer } from "../../api/auth";
import { errorMessage } from "../../api/errorMessages";
import {
  confirmPhoneVerification,
  entryRouteForBasicInfo,
  saveBasicInfo,
  sendPhoneVerification,
} from "../../api/onboarding";
import { OnboardingStepNavigation } from "../../components/OnboardingStepNavigation";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { UserInfoBackground } from "../../components/UserInfoBackground";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

type ValidationField = "name" | "birthDate" | "phone";
// text가 없으면 칸의 기본 안내 문구를 보여 준다.
type Validation = { field: ValidationField; text: string | null } | null;

export default function UserInput1Screen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [validation, setValidation] = useState<Validation>(null);

  const verificationIdRef = useRef<string | null>(null);
  const busyRef = useRef(false);

  const showError = (field: ValidationField, text: string | null = null) =>
    setValidation({ field, text });
  const clearError = (field: ValidationField) =>
    setValidation((current) => (current?.field === field ? null : current));

  useEffect(() => {
    let cancelled = false;
    // 이미 끝낸 단계면 서버 상태에 맞는 화면으로 간다.
    void entryRouteForBasicInfo().then((route) => {
      if (route && !cancelled) router.replace(route);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const requestVerification = async () => {
    if (!isValidPhoneNumber(phone)) {
      setVerificationRequested(false);
      showError("phone", errorMessage("INVALID_PHONE_NUMBER"));
      Alert.alert("전화번호 확인", "전화번호를 올바르게 입력해 주세요.");
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      const res = await sendPhoneVerification(phone.trim());
      if (res.ok) {
        // 200은 발송 요청 접수이며 문자 수신을 뜻하지 않는다.
        verificationIdRef.current = res.data.verification_id;
        setPhoneVerified(false);
        setVerificationRequested(true);
        clearError("phone");
        Alert.alert("인증번호 발송", "인증번호를 보냈어요. 5분 안에 입력해 주세요.");
        return;
      }
      verificationIdRef.current = null;
      setVerificationRequested(false);
      if (res.status === 401) {
        router.replace("/1-2");
        return;
      }
      if (res.code === "AGE_REVIEW_REQUIRED") {
        const route = await routeFromServer();
        if (route) router.replace(route);
        return;
      }
      showError("phone", errorMessage(res.code));
    } finally {
      busyRef.current = false;
    }
  };

  const confirmVerification = async () => {
    const verificationId = verificationIdRef.current;
    if (!verificationRequested || !verificationId) {
      showError("phone", "인증 요청을 먼저 해 주세요.");
      return;
    }
    if (verificationCode.length !== 6) {
      showError("phone", "인증번호 6자리를 입력해 주세요.");
      Alert.alert("인증 확인", "인증번호 6자리를 입력해 주세요.");
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      const res = await confirmPhoneVerification(verificationId, verificationCode);
      if (res.ok) {
        setPhoneVerified(true);
        clearError("phone");
        Alert.alert("인증 완료", "휴대폰 인증이 완료됐어요.");
      } else if (res.status === 401) {
        router.replace("/1-2");
      } else {
        // VERIFICATION_CODE_INVALID, VERIFICATION_EXPIRED, VERIFICATION_ATTEMPTS_EXCEEDED 등
        showError("phone", errorMessage(res.code));
      }
    } finally {
      busyRef.current = false;
    }
  };

  const goToNextStep = async () => {
    if (!isValidFullName(name)) {
      showError("name", errorMessage("INVALID_FULL_NAME"));
      return;
    }

    if (!isValidBirthDate(birthDate)) {
      showError("birthDate");
      return;
    }

    const verificationId = verificationIdRef.current;
    if (!phoneVerified || !verificationId) {
      showError("phone");
      return;
    }

    if (busyRef.current) return;
    busyRef.current = true;
    try {
      const res = await saveBasicInfo({
        full_name: name.normalize("NFC").trim(),
        birth_date: toApiBirthDate(birthDate),
        phone_verification_id: verificationId,
      });
      if (res.ok) {
        setValidation(null);
        router.push(routeForStep(res.data.next_step) ?? "/2-3");
        return;
      }
      if (res.status === 401) {
        router.replace("/1-2");
        return;
      }
      switch (res.code) {
        case "BASIC_INFO_ALREADY_COMPLETED":
        case "PREVIOUS_STEP_NOT_COMPLETED":
        case "AGE_BELOW_MINIMUM":
        case "AGE_REVIEW_REQUIRED": {
          // 만 14세 미만이면 계정이 나이 확인 대기로 바뀌고 서버 상태가 그 화면으로 안내한다.
          const route = await routeFromServer();
          if (route) router.replace(route);
          break;
        }
        case "INVALID_FULL_NAME":
          showError("name", errorMessage(res.code));
          break;
        case "INVALID_BIRTH_DATE":
        case "AGE_ABOVE_MAXIMUM":
          showError("birthDate", errorMessage(res.code));
          break;
        case "PHONE_VERIFICATION_REQUIRED":
        case "VERIFICATION_NOT_FOUND":
        case "PHONE_ALREADY_REGISTERED":
          setPhoneVerified(false);
          showError("phone", errorMessage(res.code));
          break;
        default:
          showError("phone", errorMessage(res.code));
          break;
      }
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-2-2"
    >
      <View style={styles.root}>
        <UserInfoBackground />

        <View style={styles.contentFrame}>
          <Text style={styles.title}>
            Basic{"\n"}Information
          </Text>
          <Text style={styles.step}>Step 1 of 3</Text>

          <Text style={[styles.fieldLabel, styles.nameLabel]}>01. 이름</Text>
          <PillTextInput
            accessibilityLabel="실명"
            borderColor={colors.lightOrange}
            borderRadius={radii.inputPill}
            fontFamily={fontFamilies.nanumSquareRoundRegular}
            fontSize={typography.fontSizes.subtitle}
            height={44}
            onChangeText={(value) => {
              setName(value);
              clearError("name");
            }}
            paddingHorizontal={17}
            placeholder="실명을 입력해 주세요"
            placeholderColor={colors.brown2}
            style={[styles.input, styles.nameInput]}
            value={name}
          />
          {validation?.field === "name" ? (
            <Text style={styles.nameError}>
              {validation.text ?? "이름을 입력해 주세요"}
            </Text>
          ) : null}

          <Text style={[styles.fieldLabel, styles.ageLabel]}>
            02. 생년월일
          </Text>
          <PillTextInput
            accessibilityLabel="생년월일"
            borderColor={colors.lightOrange}
            borderRadius={radii.inputPill}
            fontFamily={fontFamilies.nanumSquareRoundRegular}
            fontSize={typography.fontSizes.subtitle}
            height={44}
            maxLength={10}
            keyboardType="number-pad"
            onChangeText={(value) => {
              setBirthDate(formatBirthDate(value));
              clearError("birthDate");
            }}
            paddingHorizontal={17}
            placeholder="YYYY.MM.DD"
            placeholderColor={colors.brown2}
            style={[styles.input, styles.ageInput]}
            value={birthDate}
          />
          {validation?.field === "birthDate" ? (
            <Text style={styles.ageError}>
              {validation.text ?? "생년월일을 올바르게 입력해 주세요"}
            </Text>
          ) : (
            <Text style={styles.ageHint}>
              보호소별 활동 가능 연령을 확인하는 데 사용해요!
            </Text>
          )}

          <Text style={[styles.fieldLabel, styles.phoneLabel]}>
            03. 전화번호
          </Text>
          <PillTextInput
            accessibilityLabel="전화번호"
            borderColor={colors.lightOrange}
            borderRadius={radii.inputPill}
            fontFamily={fontFamilies.nanumSquareRoundRegular}
            fontSize={typography.fontSizes.subtitle}
            height={44}
            keyboardType="phone-pad"
            onChangeText={(value) => {
              setPhone(value.replace(/[^\d-]/g, ""));
              verificationIdRef.current = null;
              setPhoneVerified(false);
              setVerificationRequested(false);
              clearError("phone");
            }}
            paddingHorizontal={17}
            placeholder="010-0000-0000"
            placeholderColor={colors.brown2}
            style={[styles.input, styles.phoneInput]}
            value={phone}
          />
          <Pressable
            accessibilityLabel="인증 요청"
            accessibilityRole="button"
            onPress={requestVerification}
            style={[styles.smallButton, styles.requestButton]}
          >
            <Text style={styles.smallButtonText}>인증 요청</Text>
          </Pressable>

          <PillTextInput
            accessibilityLabel="인증번호 6자리"
            borderColor={colors.lightOrange}
            borderRadius={radii.inputPill}
            fontFamily={fontFamilies.nanumSquareRoundRegular}
            fontSize={typography.fontSizes.subtitle}
            height={44}
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={(value) => {
              setVerificationCode(value.replace(/\D/g, ""));
              setPhoneVerified(false);
              clearError("phone");
            }}
            paddingHorizontal={17}
            placeholder="인증번호 6자리"
            placeholderColor={colors.brown2}
            style={[styles.input, styles.codeInput]}
            value={verificationCode}
          />
          <Pressable
            accessibilityLabel="인증 확인"
            accessibilityRole="button"
            onPress={confirmVerification}
            style={[styles.smallButton, styles.confirmButton]}
          >
            <Text style={styles.smallButtonText}>확인</Text>
          </Pressable>
          {validation?.field === "phone" ? (
            <Text style={styles.phoneError}>
              {validation.text ?? "휴대폰 인증을 완료해 주세요"}
            </Text>
          ) : null}

          <Text style={styles.privacyNote}>
            입력한 정보는 산책 봉사 신청 확인에 사용돼요.
          </Text>

          <OnboardingStepNavigation
            onPrevious={() => router.replace("/1-6")}
            onNext={goToNextStep}
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
  fieldLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
    lineHeight: 22,
    left: 30,
    position: "absolute",
    width: 316,
  },
  nameLabel: {
    top: 138,
  },
  ageLabel: {
    top: 233,
  },
  phoneLabel: {
    top: 356,
  },
  input: {
    left: 30,
    position: "absolute",
    width: 306,
  },
  nameInput: {
    top: 163,
  },
  nameError: {
    color: colors.warning,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.small,
    left: 30,
    lineHeight: 17,
    position: "absolute",
    top: 210,
  },
  ageInput: {
    top: 258,
  },
  ageError: {
    color: colors.warning,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.small,
    left: 30,
    lineHeight: 17,
    position: "absolute",
    top: 304,
  },
  phoneInput: {
    top: 385,
    width: 207,
  },
  codeInput: {
    top: 434,
    width: 207,
  },
  ageHint: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.small,
    left: 30,
    lineHeight: 17,
    position: "absolute",
    top: 313,
    width: 315,
  },
  smallButton: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderColor: colors.lightOrange,
    borderRadius: radii.inputPill,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    left: 244,
    position: "absolute",
    width: 92,
  },
  requestButton: {
    top: 385,
  },
  confirmButton: {
    top: 434,
  },
  phoneError: {
    width: 315,
    color: colors.warning,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.small,
    left: 30,
    lineHeight: 17,
    position: "absolute",
    top: 480,
  },
  smallButtonText: {
    color: colors.cream,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 21,
    textAlign: "center",
  },
  privacyNote: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    left: 30,
    lineHeight: 20,
    position: "absolute",
    top: 496,
    width: 310,
  },
});
