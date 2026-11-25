import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  formatBirthDate,
  isValidBirthDate,
  toApiBirthDate,
} from "../../api/accountRules";
import { routeForStep, routeFromServer } from "../../api/auth";
import { errorMessage } from "../../api/errorMessages";
import { correctBirthDate } from "../../api/users";
import { GradientView } from "../../components/GradientView";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { UserInfoBackground } from "../../components/UserInfoBackground";
import { gradientButtonWarm } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

// 만 14세 미만으로 판정된 계정(AGE_REVIEW)이 생년월일을 다시 확인하는 화면.
export default function AgeReviewScreen() {
  const router = useRouter();
  const [birthDate, setBirthDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const submit = async () => {
    if (submittingRef.current) return;
    if (!isValidBirthDate(birthDate)) {
      setMessage(errorMessage("INVALID_BIRTH_DATE"));
      return;
    }

    submittingRef.current = true;
    try {
      const res = await correctBirthDate(toApiBirthDate(birthDate));
      if (res.ok) {
        const route = routeForStep(res.data.next_onboarding_step);
        if (route) router.replace(route);
        return;
      }
      if (res.status === 401) {
        router.replace("/1-2");
        return;
      }
      if (res.code === "AGE_REVIEW_NOT_REQUIRED") {
        const route = await routeFromServer();
        if (route) router.replace(route);
        return;
      }
      // AGE_BELOW_MINIMUM, AGE_ABOVE_MAXIMUM, INVALID_BIRTH_DATE, BIRTH_DATE_REQUIRED 등
      setMessage(errorMessage(res.code));
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-2-age-review"
    >
      <View style={styles.root}>
        <UserInfoBackground />

        <View style={styles.contentFrame}>
          <Text style={styles.title}>나이 확인</Text>

          <Text style={styles.description}>생년월일을 다시 확인해 주세요.</Text>

          <Text style={styles.fieldLabel}>생년월일</Text>
          <PillTextInput
            accessibilityLabel="생년월일"
            borderColor={colors.lightOrange}
            borderRadius={radii.inputPill}
            fontFamily={fontFamilies.nanumSquareRoundRegular}
            fontSize={typography.fontSizes.subtitle}
            height={44}
            keyboardType="number-pad"
            maxLength={10}
            onChangeText={(value) => {
              setBirthDate(formatBirthDate(value));
              setMessage(null);
            }}
            paddingHorizontal={17}
            placeholder="YYYY.MM.DD"
            placeholderColor={colors.brown2}
            style={styles.input}
            value={birthDate}
          />
          {message ? <Text style={styles.error}>{message}</Text> : null}

          <View style={styles.buttonFrame}>
            <GradientView token={gradientButtonWarm} style={styles.button}>
              <Pressable
                accessibilityLabel="확인하기"
                accessibilityRole="button"
                onPress={submit}
                style={styles.button}
              >
                <Text style={styles.buttonText}>확인하기</Text>
              </Pressable>
            </GradientView>
          </View>
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
  description: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.subtitle,
    left: 30,
    lineHeight: 22,
    position: "absolute",
    top: 138,
    width: 316,
  },
  fieldLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
    left: 30,
    lineHeight: 22,
    position: "absolute",
    top: 200,
    width: 316,
  },
  input: {
    left: 30,
    position: "absolute",
    top: 225,
    width: 306,
  },
  error: {
    color: colors.warning,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.small,
    left: 30,
    lineHeight: 17,
    position: "absolute",
    top: 271,
  },
  buttonFrame: {
    alignItems: "center",
    bottom: 54,
    height: 56,
    position: "absolute",
    width: 375,
  },
  button: {
    alignItems: "center",
    height: 56,
    justifyContent: "center",
    width: 316,
  },
  buttonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.title,
    lineHeight: 25,
    textAlign: "center",
  },
});
