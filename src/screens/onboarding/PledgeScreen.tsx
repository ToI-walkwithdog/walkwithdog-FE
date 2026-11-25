import { useRef } from "react";
import { useRouter } from "expo-router";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

import { fetchMe, routeFromServer } from "../../api/auth";
import { errorMessage } from "../../api/errorMessages";
import { savePledge } from "../../api/users";
import { Icon } from "../../components/Icon";
import { OnboardingBackground } from "../../components/OnboardingBackground";
import { OnboardingPillButton } from "../../components/OnboardingPillButton";
import { Screen } from "../../components/Screen";
import { colors, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const pawStamp = require("../../assets/images/paw-1.png");

export default function PledgeScreen() {
  const router = useRouter();
  const submittingRef = useRef(false);

  const handleFailure = async (status: number, code: string | null) => {
    if (status === 401) {
      router.replace("/1-2");
    } else if (code === "AGE_REVIEW_REQUIRED") {
      const route = await routeFromServer();
      if (route) router.replace(route);
    } else {
      Alert.alert("알림", errorMessage(code));
    }
  };

  const submitPledge = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      const me = await fetchMe();
      if (!me.ok) {
        await handleFailure(me.status, me.code);
        return;
      }
      if (!me.data.current_pledge_version) {
        Alert.alert("알림", errorMessage(null));
        return;
      }
      const res = await savePledge(me.data.current_pledge_version);
      if (res.ok) {
        router.replace("/2-1");
      } else {
        // PLEDGE_VERSION_MISMATCH, PLEDGE_NOT_ALLOWED 등
        await handleFailure(res.status, res.code);
      }
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-1-6"
    >
      <View style={styles.root}>
        <OnboardingBackground />

        <View style={styles.contentFrame}>
          <View style={styles.dogIconFrame}>
            <View style={styles.dogIconImage}>
              <Icon
                name="icon-dog"
                size={55}
                width={51.5625}
                height={47.4627}
                color={colors.orange}
              />
            </View>
          </View>

          <Text style={styles.title}>산책, 신중하개!</Text>
          <Text style={styles.subtitle}>
            보호견과 함께 산책하고{"\n"}건강도 챙겨 보세요 :)
          </Text>

          <View style={styles.pledgeCard}>
            <Text style={styles.cardTitle}>같이걷개 서약서</Text>

            <View style={styles.firstPledgeRow}>
              <Image
                accessible={false}
                resizeMode="contain"
                source={pawStamp}
                style={styles.bulletPaw}
              />
              <Text style={styles.pledgeText}>
                산책 승인 여부는 보호소에게 있어요!
              </Text>
            </View>

            <View style={styles.secondPledgeRow}>
              <Image
                accessible={false}
                resizeMode="contain"
                source={pawStamp}
                style={styles.bulletPaw}
              />
              <Text style={styles.pledgeText}>
                보호견과 함께 안전하게{"\n"}산책을 진행할 거예요!
              </Text>
            </View>

            <View style={styles.thirdPledgeRow}>
              <Image
                accessible={false}
                resizeMode="contain"
                source={pawStamp}
                style={styles.bulletPaw}
              />
              <Text style={styles.pledgeText}>
                위 내용을 모두 확인했어요
              </Text>
            </View>

            <Text style={styles.closingText}>
              보호견과 산책은 간단한 일이 아닙니다{"\n"}
              충분한 고민 후 결정해 주세요 :)
            </Text>
          </View>

          <View style={styles.decorativePawFrame}>
            <Icon
              name="icon-paw-stamp"
              size={111.437}
              width={80.023}
              height={73.389}
            />
          </View>
        </View>

        <OnboardingPillButton
          title="약속했개!"
          onPress={submitPledge}
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
  contentFrame: {
    alignSelf: "center",
    flex: 1,
    width: 375,
  },
  dogIconFrame: {
    height: 55,
    left: 160,
    position: "absolute",
    top: 94,
    width: 55,
  },
  dogIconImage: {
    left: 1.71875,
    position: "absolute",
    top: 5.81851,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.gumiRomance,
    fontSize: 32,
    letterSpacing: -0.32,
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
    lineHeight: 20,
    position: "absolute",
    textAlign: "center",
    top: 227,
    width: 375,
  },
  pledgeCard: {
    backgroundColor: colors.pledgeCardBackground,
    borderRadius: 15,
    height: 346,
    left: 22,
    position: "absolute",
    top: 307,
    width: 331,
  },
  cardTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.gumiRomance,
    fontSize: typography.fontSizes.title,
    letterSpacing: -0.2,
    lineHeight: 30,
    position: "absolute",
    textAlign: "center",
    top: 27.5,
    width: 331,
  },
  firstPledgeRow: {
    height: 33,
    left: 31,
    position: "absolute",
    top: 79,
    width: 280,
  },
  secondPledgeRow: {
    height: 38,
    left: 31,
    position: "absolute",
    top: 143,
    width: 280,
  },
  thirdPledgeRow: {
    height: 28,
    left: 31,
    position: "absolute",
    top: 196,
    width: 280,
  },
  bulletPaw: {
    height: 24,
    left: 0,
    position: "absolute",
    top: 2,
    width: 24,
  },
  pledgeText: {
    color: colors.pledgeText,
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typography.fontSizes.bodyLarge,
    left: 31,
    lineHeight: 17.25,
    position: "absolute",
    top: 5,
  },
  closingText: {
    color: colors.brown,
    fontFamily: fontFamilies.pretendardMedium,
    fontSize: typography.fontSizes.subtitle,
    height: 40,
    left: 33.5,
    lineHeight: 20,
    position: "absolute",
    textAlign: "center",
    top: 261,
    width: 264,
  },
  decorativePawFrame: {
    alignItems: "center",
    height: 111.437,
    justifyContent: "center",
    left: 249,
    position: "absolute",
    top: 548,
    width: 111.437,
  },
});
