import { useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { ConsentCheckbox } from "../../components/ConsentCheckbox";
import { Icon } from "../../components/Icon";
import { OnboardingActionButton } from "../../components/OnboardingActionButton";
import { OnboardingBackground } from "../../components/OnboardingBackground";
import { Screen } from "../../components/Screen";
import { colors, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const [checked, setChecked] = useState([true, true, true]);

  const toggleCheck = (index: number) => {
    setChecked((current) =>
      current.map((isChecked, currentIndex) =>
        currentIndex === index ? !isChecked : isChecked,
      ),
    );
  };

  const openDetails = () => router.push("/1-5");
  const agreeAll = () => {
    setChecked([true, true, true]);
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
            현재 개인정보 안내는 목업이에요.{"\n"}실제 동의는 저장되지 않아요.
          </Text>

          <ConsentRow
            checked={checked[0]}
            checkboxTop={2}
            labelTop={7}
            onPress={toggleCheck}
            onOpenDetails={openDetails}
            rowIndex={0}
            top={304}
            withDetailsLink
          />
          <ConsentRow
            checked={checked[1]}
            checkboxTop={0}
            labelTop={4}
            onPress={toggleCheck}
            rowIndex={1}
            top={349}
            text="산책 중 발생하는 책임은 귀하에게 있습니다."
          />
          <ConsentRow
            checked={checked[2]}
            checkboxTop={0}
            labelTop={4}
            onPress={toggleCheck}
            rowIndex={2}
            top={392}
            text="만 14세 이상이며 모든 약관을 확인했습니다."
          />
        </View>

        <OnboardingActionButton title="전체 동의" onPress={agreeAll} />
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
  detailsLink: {
    color: colors.policyLinkBlue,
    textDecorationLine: "underline",
  },
});
