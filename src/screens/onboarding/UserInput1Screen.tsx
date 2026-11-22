import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { OnboardingStepNavigation } from "../../components/OnboardingStepNavigation";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { useMockSession } from "../../context/MockSession";
import { UserInfoBackground } from "../../components/UserInfoBackground";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}.${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
}

function isValidBirthDate(value: string) {
  const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12) {
    return false;
  }

  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  if (day < 1 || day > daysInMonth[month - 1]) {
    return false;
  }

  const today = new Date();
  return (
    year < today.getFullYear() ||
    (year === today.getFullYear() &&
      (month < today.getMonth() + 1 ||
        (month === today.getMonth() + 1 && day <= today.getDate())))
  );
}

export default function UserInput1Screen() {
  const router = useRouter();
  const { profile, updateProfile } = useMockSession();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [validationMessage, setValidationMessage] = useState<
    "name" | "birthDate" | "phone" | null
  >(null);

  const requestVerification = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10 || digits.length === 11) {
      setPhoneVerified(false);
      setVerificationRequested(true);
      Alert.alert("목업 인증", "실제 인증번호는 전송되지 않아요. 테스트 번호 123456을 입력해 주세요.");
    } else {
      setVerificationRequested(false);
      setValidationMessage("phone");
      Alert.alert("전화번호 확인", "전화번호를 올바르게 입력해 주세요.");
    }
  };

  const confirmVerification = () => {
    if (verificationRequested && verificationCode === "123456") {
      setPhoneVerified(true);
      setValidationMessage((current) =>
        current === "phone" ? null : current,
      );
      Alert.alert("목업 인증 완료", "실제 휴대폰 인증은 이루어지지 않았어요.");
    } else {
      setValidationMessage("phone");
      Alert.alert("인증 확인", "인증 요청 후 테스트 번호 123456을 입력해 주세요.");
    }
  };

  const goToNextStep = () => {
    if (!name.trim()) {
      setValidationMessage("name");
      return;
    }

    if (!isValidBirthDate(birthDate)) {
      setValidationMessage("birthDate");
      return;
    }

    if (!phoneVerified) {
      setValidationMessage("phone");
      return;
    }

    setValidationMessage(null);
    updateProfile({ ...profile, name: name.trim(), phone });
    router.push("/2-3");
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
              setValidationMessage((current) =>
                current === "name" ? null : current,
              );
            }}
            paddingHorizontal={17}
            placeholder="실명을 입력해 주세요"
            placeholderColor={colors.brown2}
            style={[styles.input, styles.nameInput]}
            value={name}
          />
          {validationMessage === "name" ? (
            <Text style={styles.nameError}>이름을 입력해 주세요</Text>
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
              setValidationMessage((current) =>
                current === "birthDate" ? null : current,
              );
            }}
            paddingHorizontal={17}
            placeholder="YYYY.MM.DD"
            placeholderColor={colors.brown2}
            style={[styles.input, styles.ageInput]}
            value={birthDate}
          />
          {validationMessage === "birthDate" ? (
            <Text style={styles.ageError}>
              생년월일을 올바르게 입력해 주세요
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
              setPhoneVerified(false);
              setVerificationRequested(false);
              setValidationMessage((current) =>
                current === "phone" ? null : current,
              );
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
              setValidationMessage((current) =>
                current === "phone" ? null : current,
              );
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
          {validationMessage === "phone" ? (
            <Text style={styles.phoneError}>휴대폰 인증을 완료해 주세요</Text>
          ) : null}

          <Text style={styles.privacyNote}>
            목업으로 앱에만 입력되며,{"\n"}
            보호소나 서버로 전송되지 않아요.
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
