import { useState } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { getSignupDraft } from "../../api/signupDraft";
import { ConsentCheckbox } from "../../components/ConsentCheckbox";
import { OnboardingActionButton } from "../../components/OnboardingActionButton";
import { PolicyContent } from "../../components/PolicyContent";
import { Screen } from "../../components/Screen";
import { colors, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function PrivacyDetailsScreen() {
  const router = useRouter();
  const [checked, setChecked] = useState([false, false]);
  const allChecked = checked.every(Boolean);

  const continueToRegister = () => {
    if (!allChecked) return;
    // 1-4에서 필수 동의를 마치지 않았다면 1-4로 돌아간다.
    const draft = getSignupDraft();
    if (draft.ageConfirmed && draft.collectionUseAgreed) {
      router.replace("/1-3");
    } else {
      router.back();
    }
  };

  const toggle = (index: number) =>
    setChecked((current) =>
      current.map((value, currentIndex) =>
        currentIndex === index ? !value : value,
      ),
    );

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-1-5"
    >
      <View style={styles.root}>
        <View style={styles.contentFrame}>
          <Text style={styles.headerTitle}>개인정보 처리방침</Text>

          <View style={styles.summaryCard}>
            <PolicyContent
              kind="privacy"
              textColor={colors.onboardingSummaryText}
            />
          </View>

          <View style={styles.footerLine} />
          <DetailConsentRow
            checked={checked[0]}
            label="개인정보 처리방침을 확인했습니다"
            onPress={() => toggle(0)}
            style={styles.firstConsentRow}
          />
          <DetailConsentRow
            checked={checked[1]}
            label="개인정보 수집·이용에 동의합니다"
            onPress={() => toggle(1)}
            style={styles.secondConsentRow}
          />
        </View>

        <OnboardingActionButton
          disabled={!allChecked}
          title="동의하고 닫기"
          onPress={continueToRegister}
        />
      </View>
    </Screen>
  );
}

type DetailConsentRowProps = {
  checked: boolean;
  label: string;
  onPress: () => void;
  style: StyleProp<ViewStyle>;
};

function DetailConsentRow({
  checked,
  label,
  onPress,
  style,
}: DetailConsentRowProps) {
  return (
    <View style={[styles.consentRow, style]}>
      <ConsentCheckbox
        accessibilityLabel={label}
        checked={checked}
        onPress={onPress}
        style={styles.consentCheckbox}
      />
      <Text style={styles.consentLabel}>{label}</Text>
    </View>
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
  headerTitle: {
    color: colors.black,
    fontFamily: fontFamilies.notoSansKRRegular,
    fontSize: typography.fontSizes.title,
    letterSpacing: -0.2,
    lineHeight: 30,
    position: "absolute",
    textAlign: "center",
    top: 44,
    width: 375,
  },
  summaryCard: {
    backgroundColor: colors.onboardingSummaryBackground,
    borderColor: colors.onboardingSummaryBorder,
    borderRadius: 15,
    borderWidth: 1.5,
    bottom: 244,
    left: 19,
    padding: 16,
    position: "absolute",
    top: 96,
    width: 338,
  },
  footerLine: {
    backgroundColor: colors.onboardingSummaryText,
    bottom: 228,
    height: 1,
    left: 25.5,
    position: "absolute",
    width: 324,
  },
  consentRow: {
    height: 25,
    left: 44,
    position: "absolute",
    width: 300,
  },
  firstConsentRow: {
    bottom: 186.5,
  },
  secondConsentRow: {
    bottom: 141.5,
  },
  consentCheckbox: {
    left: 0,
    top: 0,
  },
  consentLabel: {
    color: colors.black,
    fontFamily: fontFamilies.notoSansKRRegular,
    fontSize: typography.fontSizes.body,
    left: 33,
    lineHeight: 16.1,
    position: "absolute",
    top: 4.45,
  },
});
