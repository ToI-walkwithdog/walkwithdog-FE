import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { OnboardingStepNavigation } from "../../components/OnboardingStepNavigation";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { UserInfoBackground } from "../../components/UserInfoBackground";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function UserInput1Screen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [validationMessage, setValidationMessage] = useState<
    "name" | "age" | "phone" | null
  >(null);

  const requestVerification = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10 || digits.length === 11) {
      setPhoneVerified(false);
    }
  };

  const confirmVerification = () => {
    if (/^\d{6}$/.test(verificationCode)) {
      setPhoneVerified(true);
      setValidationMessage((current) =>
        current === "phone" ? null : current,
      );
    }
  };

  const goToNextStep = () => {
    if (!name.trim()) {
      setValidationMessage("name");
      return;
    }

    const parsedAge = Number(age);
    if (!/^\d{1,3}$/.test(age) || parsedAge < 1 || parsedAge > 999) {
      setValidationMessage("age");
      return;
    }

    if (!phoneVerified) {
      setValidationMessage("phone");
      return;
    }

    setValidationMessage(null);
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

          <Text style={[styles.fieldLabel, styles.ageLabel]}>02. 나이</Text>
          <PillTextInput
            accessibilityLabel="만 나이"
            borderColor={colors.lightOrange}
            borderRadius={radii.inputPill}
            fontFamily={fontFamilies.nanumSquareRoundRegular}
            fontSize={typography.fontSizes.subtitle}
            height={44}
            keyboardType="number-pad"
            onChangeText={(value) => {
              setAge(value);
              setValidationMessage((current) =>
                current === "age" ? null : current,
              );
            }}
            paddingHorizontal={17}
            placeholder="만 나이를 입력해 주세요"
            placeholderColor={colors.brown2}
            style={[styles.input, styles.ageInput]}
            value={age}
          />
          {validationMessage === "age" ? (
            <Text style={styles.ageError}>
              나이를 올바르게 입력해 주세요
            </Text>
          ) : (
            <Text style={styles.ageHint}>
              보호소별 활동 가능 연령을 확인하는 데 사용해요.
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
            이름과 연락처는 공개되지 않으며,{"\n"}
            활동 신청 시 해당 보호소에만 전달돼요.
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
