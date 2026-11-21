import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function UserInput5Screen() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const requestPermission = async () => {
      try {
        await Location.requestForegroundPermissionsAsync();
        if (active) {
          router.replace("/3");
        }
      } catch (error) {
        console.error("Failed to request location permission", error);
      }
    };

    void requestPermission();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-2-6"
    >
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="뒤로"
            accessibilityRole="button"
            onPress={() => router.replace("/2-5")}
            style={styles.backButton}
          >
            <Icon
              color={colors.brown}
              height={12}
              name="icon-back"
              width={7.41}
            />
          </Pressable>
          <Text style={styles.headerTitle}>위치 권한 안내</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.headline}>가까운 산책 친구를 찾으려면</Text>
          <Text style={styles.subheadline}>위치 접근을 허용해 주세요 !</Text>

          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>
              가까운 보호소를 찾고 산책 중 이동 경로와 거리를 기록하는 데
              사용해요.
            </Text>
          </View>

          <View style={styles.settingsCard}>
            <Text style={styles.settingsTitle}>이미 권한을 거부했나요?</Text>
            <Text style={styles.settingsDescription}>
              기기 설정에서 같이걷개의 위치 접근을{"\n"}
              허용한 뒤 다시 시도해 주세요.
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
  },
  header: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: 12,
    height: 56,
    marginTop: 44,
    paddingLeft: 16,
    paddingRight: 20,
    width: 375,
  },
  backButton: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  headerTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.stepLabel,
    lineHeight: 25.2,
  },
  body: {
    alignSelf: "center",
    gap: 20,
    minHeight: 554,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    width: 375,
  },
  headline: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.permissionHeading,
    lineHeight: 37.7,
  },
  subheadline: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.permissionSubheading,
    lineHeight: 30.45,
  },
  noticeCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    padding: 16,
  },
  noticeText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
  },
  settingsCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    gap: 12,
    padding: 18,
  },
  settingsTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.stepLabel,
    lineHeight: 26.1,
  },
  settingsDescription: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
  },
});
