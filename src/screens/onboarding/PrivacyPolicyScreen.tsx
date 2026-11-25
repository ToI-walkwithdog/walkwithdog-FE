import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { setConsentFromChecks, setPolicyVersion } from "../../api/signupDraft";
import { fetchPrivacyPolicy } from "../../api/users";
import { ConsentCheckbox } from "../../components/ConsentCheckbox";
import { Icon } from "../../components/Icon";
import { OnboardingActionButton } from "../../components/OnboardingActionButton";
import { OnboardingBackground } from "../../components/OnboardingBackground";
import { Screen } from "../../components/Screen";
import { colors, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const [checked, setChecked] = useState([false, false, false]);
  const allChecked = checked.every(Boolean);
  const toggleAll = () =>
    setChecked(allChecked ? [false, false, false] : [true, true, true]);

  const toggleCheck = (index: number) => {
    setChecked((current) =>
      current.map((isChecked, currentIndex) =>
        currentIndex === index ? !isChecked : isChecked,
      ),
    );
  };

  useEffect(() => {
    // 실패(503 POLICY_DOCUMENT_UNAVAILABLE 등)해도 가입 시점에 다시 조회한다.
    fetchPrivacyPolicy().then((res) => {
      if (res.ok) setPolicyVersion(res.data.document_version);
    });
  }, []);

  const openDetails = () => {
    setConsentFromChecks(checked);
    router.push("/1-5");
  };
  // 수집·이용 동의(0)와 만 14세 이상 확인(2)이 필요하다. 산책 책임 확인(1)은 선택이다.
  const requiredChecked = checked[0] && checked[2];
  const goNext = () => {
    if (!requiredChecked) return;
    setConsentFromChecks(checked);
    router.push("/1-5");
  };

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-1-4"
    >
      <View style={styles.root}>
        <OnboardingBackground artworkOffsetY={-504} opacity={0.5} />

        <View style={styles.contentFrame}>
          <View style={styles.infoIconFrame}>
            <View style={styles.infoIconImage}>
              <Icon
                name="icon-info"
                size={59}
                width={49.1667}
                height={53.6261}
                color={colors.orange}
              />
            </View>
          </View>

          <Text style={styles.title}>개인정보 처리방침</Text>
          <Text style={styles.subtitle}>
            서비스 이용을 위해{"\n"}아래 항목에 동의해 주세요.
          </Text>

          <View style={[styles.consentRow, { top: 280 }]}>
            <ConsentCheckbox
              accessibilityLabel="전체 동의"
              checked={allChecked}
              onPress={toggleAll}
              style={[styles.checkbox, { top: 0 }]}
            />
            <Text style={[styles.consentText, styles.allConsentText, { top: 4 }]}>
              전체 동의
            </Text>
          </View>
          <ConsentRow
            checked={checked[0]}
            checkboxTop={2}
            labelTop={7}
            onPress={toggleCheck}
            onOpenDetails={openDetails}
            rowIndex={0}
            top={332}
            withDetailsLink
          />
          <ConsentRow
            checked={checked[1]}
            checkboxTop={0}
            labelTop={4}
            onPress={toggleCheck}
            rowIndex={1}
            top={377}
            text="산책 중 발생하는 책임은 귀하에게 있습니다."
          />
          <ConsentRow
            checked={checked[2]}
            checkboxTop={0}
            labelTop={4}
            onPress={toggleCheck}
            rowIndex={2}
            top={420}
            text="만 14세 이상이며 모든 약관을 확인했습니다."
          />
        </View>

        <OnboardingActionButton
          disabled={!requiredChecked}
          title="다음"
          onPress={goNext}
        />
      </View>
    </Screen>
  );
}

type ConsentRowProps = {
  checked: boolean;
  checkboxTop: number;
  labelTop: number;
  onPress: (index: number) => void;
  onOpenDetails?: () => void;
  rowIndex: number;
  text?: string;
  top: number;
  withDetailsLink?: boolean;
};

function ConsentRow({
  checked,
  checkboxTop,
  labelTop,
  onPress,
  onOpenDetails,
  rowIndex,
  text,
  top,
  withDetailsLink = false,
}: ConsentRowProps) {
  return (
    <View style={[styles.consentRow, { top }]}>
      <ConsentCheckbox
        accessibilityLabel={
          withDetailsLink ? "개인정보 수집·이용 동의" : (text ?? "")
        }
        checked={checked}
        onPress={() => onPress(rowIndex)}
        style={[styles.checkbox, { top: checkboxTop }]}
      />

      <Text style={[styles.consentText, { top: labelTop }]}>
        {withDetailsLink ? (
          <>
            개인정보 수집·이용에 동의합니다.{" "}
            <Text
              accessibilityRole="link"
              onPress={onOpenDetails}
              style={styles.detailsLink}
            >
              전문보기
            </Text>
          </>
        ) : (
          text
        )}
      </Text>
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
  infoIconFrame: {
    height: 59,
    left: 160,
    position: "absolute",
    top: 94,
    width: 59,
  },
  infoIconImage: {
    left: 4.9167,
    position: "absolute",
    top: 4.9167,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.gumiRomance,
    fontSize: 32,
    letterSpacing: -0.32,
    left: 0,
    lineHeight: 48,
    position: "absolute",
    textAlign: "center",
    top: 174,
    width: 375,
  },
  subtitle: {
    color: colors.brown,
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typography.fontSizes.subtitle,
    left: 0,
    lineHeight: 20,
    position: "absolute",
    textAlign: "center",
    top: 227,
    width: 375,
  },
  consentRow: {
    height: 30,
    left: 38,
    position: "absolute",
    width: 300,
  },
  checkbox: {
    left: 0,
    position: "absolute",
  },
  consentText: {
    color: colors.black,
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typography.fontSizes.bodyLarge,
    left: 33,
    lineHeight: 17.25,
    position: "absolute",
    width: 300,
  },
  allConsentText: {
    fontFamily: fontFamilies.pretendardMedium,
  },
  detailsLink: {
    color: colors.policyLinkBlue,
    textDecorationLine: "underline",
  },
});
