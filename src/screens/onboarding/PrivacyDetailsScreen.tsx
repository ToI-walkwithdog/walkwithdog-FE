import { useState } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ConsentCheckbox } from "../../components/ConsentCheckbox";
import { OnboardingActionButton } from "../../components/OnboardingActionButton";
import { Screen } from "../../components/Screen";
import { colors, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function PrivacyDetailsScreen() {
  const router = useRouter();
  const [checked, setChecked] = useState([true, true]);

  const continueToRegister = () => {
    if (checked.every(Boolean)) {
      router.replace("/1-3");
    }
  };

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
            <Text style={styles.summaryTitle}>한 눈에 보는 요약</Text>
            <Text style={styles.summaryDetails}>
              <Text style={styles.summaryEmphasis}>수집 항목</Text>
              : 닉네임, 아이디, MBTI, 가구 정보 등{"\n"}
              <Text style={styles.summaryEmphasis}>이용 목적</Text>
              : 강아지 매칭 서비스 제공{"\n"}
              <Text style={styles.summaryEmphasis}>보유 기간</Text>
              : 회원 탈퇴 시까지{"\n"}
              <Text style={styles.summaryEmphasis}>국외 이전</Text>
              : Google LLC(Gemini, 미국)
            </Text>
          </View>

          <Text style={styles.sectionTitleOne}>
            제 1조 (개인정보 처리 목적)
          </Text>
          <Text style={styles.sectionBodyOne}>
            글로우는 회원 가입 및 관리, 매칭 서비스 제공, 서비스 개선,
            {"\n"}고충 처리를 위해 개인정보를 처리합니다.
          </Text>

          <Text style={styles.sectionTitleTwo}>제 2조 (용어의 정의)</Text>
          <Text style={styles.sectionBodyTwo}>
            아이디, 비밀번호, 닉네임, MBTI, 주거 형태, 가구 구성,
            {"\n"}주거 형태, 생활 패턴, 반려 경험, 경제적 여건, 산책 가능 시간
          </Text>

          <View style={styles.footerLine} />
          <DetailConsentRow
            checked={checked[0]}
            label="개인 정보 수집 이용에 동의"
            onPress={() =>
              setChecked((current) =>
                current.map((value, index) => (index === 0 ? !value : value)),
              )
            }
            style={styles.firstConsentRow}
          />
          <DetailConsentRow
            checked={checked[1]}
            label="국외 이전(Gemini API)에 동의"
            onPress={() =>
              setChecked((current) =>
                current.map((value, index) => (index === 1 ? !value : value)),
              )
            }
            style={styles.secondConsentRow}
          />
        </View>

        <OnboardingActionButton
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
    height: 156,
    left: 19,
    position: "absolute",
    top: 96,
    width: 338,
  },
  summaryTitle: {
    color: colors.onboardingSummaryText,
    fontFamily: fontFamilies.notoSansKRBold,
    fontSize: typography.fontSizes.bodyLarge,
    left: 20,
    lineHeight: 20,
    position: "absolute",
    top: 16,
  },
  summaryDetails: {
    color: colors.onboardingSummaryText,
    fontFamily: fontFamilies.notoSansKRRegular,
    fontSize: typography.fontSizes.bodyLarge,
    left: 20,
    lineHeight: 20,
    position: "absolute",
    top: 56,
    width: 298,
  },
  summaryEmphasis: {
    fontFamily: fontFamilies.notoSansKRBold,
  },
  sectionTitleOne: {
    color: colors.black,
    fontFamily: fontFamilies.notoSansKRRegular,
    fontSize: typography.fontSizes.mediumTitle,
    left: 17,
    lineHeight: 24,
    position: "absolute",
    top: 271,
  },
  sectionBodyOne: {
    color: colors.black,
    fontFamily: fontFamilies.notoSansKRRegular,
    fontSize: typography.fontSizes.body,
    left: 17,
    lineHeight: 17.5,
    position: "absolute",
    top: 296,
    width: 341,
  },
  sectionTitleTwo: {
    color: colors.black,
    fontFamily: fontFamilies.notoSansKRRegular,
    fontSize: typography.fontSizes.mediumTitle,
    left: 17,
    lineHeight: 24,
    position: "absolute",
    top: 366,
  },
  sectionBodyTwo: {
    color: colors.black,
    fontFamily: fontFamilies.notoSansKRRegular,
    fontSize: typography.fontSizes.body,
    left: 17,
    lineHeight: 17.5,
    position: "absolute",
    top: 391,
    width: 341,
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
