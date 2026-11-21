import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const kongiImage = require("../../assets/images/dog-kongi.png");

export type CodeEntryResultScreenState = "success" | "error";

export function CodeEntryResultScreen({
  state,
}: {
  state: CodeEntryResultScreenState;
}) {
  const router = useRouter();
  const isSuccess = state === "success";

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID={isSuccess ? "screen-4-2" : "screen-4-3"}
    >
      <View style={styles.root}>
        <View style={styles.contentFrame}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="뒤로"
              accessibilityRole="button"
              onPress={() => router.replace("/4-1")}
              style={styles.backButton}
            >
              <Icon
                name="icon-back"
                size={24}
                width={11.1563}
                height={17.7662}
                color={colors.brown}
              />
            </Pressable>
            <Text style={styles.headerTitle}>보호소 코드 입력</Text>
          </View>

          <Text style={styles.description}>
            안전 교육과 강아지 인계 후,{"\n"}
            담당자에게 받은 6자리 코드를 입력해 주세요!
          </Text>

          <View style={styles.walkCard}>
            <Image
              accessible={false}
              resizeMode="cover"
              source={kongiImage}
              style={styles.dogImage}
            />
            <View style={styles.walkCardText}>
              <Text style={styles.walkCardTitle}>콩이 · 행복 보호소</Text>
              <Text style={styles.walkCardMeta}>
                11월 12일 · 13:00–14:00
              </Text>
            </View>
          </View>

          <View style={styles.codeSection}>
            <Text style={styles.codeLabel}>보호소 발급 코드</Text>
            <View
              style={[
                styles.codeField,
                isSuccess ? null : styles.errorCodeField,
              ]}
            >
              <Text style={styles.codeText}>
                {isSuccess ? "4  2  8  6  1  9" : "4  2  8  6  1  0"}
              </Text>
            </View>
            <Text
              style={[
                styles.codeHint,
                isSuccess ? styles.successHint : styles.errorHint,
              ]}
            >
              {isSuccess
                ? "6자리를 입력했어요! 확인하고 출발하세요 :)"
                : "코드가 맞지 않거나 만료되었어요 :(\n담당자에게 확인 후 다시 입력해 주세요!"}
            </Text>
          </View>

          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>
              코드가 확인되면 산책 시간이 바로 기록돼요.{"\n"}
              준비물과 리드줄 연결 상태를 먼저 확인해 주세요.
            </Text>
          </View>
        </View>

        <View style={styles.bottomActions}>
          {isSuccess ? (
            <Pressable
              accessibilityLabel="확인하고 시작하개"
              accessibilityRole="button"
              onPress={() => router.push("/4-4")}
              style={styles.successAction}
            >
              <Text style={styles.successActionText}>
                확인하고 시작하개!
              </Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityLabel="코드 다시 입력하기"
              accessibilityRole="button"
              onPress={() => router.replace("/4-1")}
              style={styles.errorAction}
            >
              <Text style={styles.errorActionText}>
                코드 다시 입력하기
              </Text>
            </Pressable>
          )}
          <Pressable
            accessibilityLabel="예약 상세 보기"
            accessibilityRole="button"
            onPress={
              () => console.log("예약 상세 보기 tapped")
            }
            style={[
              styles.secondaryAction,
              isSuccess ? null : styles.errorSecondaryAction,
            ]}
          >
            <Text style={styles.secondaryActionText}>
              예약 상세 보기
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

export function CodeEntrySuccessRoute() {
  return <CodeEntryResultScreen state="success" />;
}

export function CodeEntryErrorRoute() {
  return <CodeEntryResultScreen state="error" />;
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
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 36,
    left: 20,
    position: "absolute",
    top: 64,
    width: 335,
  },
  backButton: {
    alignItems: "center",
    height: 29,
    justifyContent: "center",
    width: 29,
  },
  headerTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.largeTitle,
    lineHeight: 36.25,
    marginLeft: 8,
  },
  description: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.bodyLarge,
    left: 20,
    lineHeight: 21.75,
    position: "absolute",
    top: 120,
  },
  walkCard: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    flexDirection: "row",
    height: 93,
    left: 20,
    padding: 16,
    position: "absolute",
    top: 171,
    width: 335,
  },
  dogImage: {
    borderRadius: 12,
    height: 68,
    width: 60,
  },
  walkCardText: {
    marginLeft: 12,
  },
  walkCardTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
    lineHeight: 24.65,
  },
  walkCardMeta: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
    lineHeight: 18.85,
  },
  codeSection: {
    left: 20,
    position: "absolute",
    top: 284,
    width: 335,
  },
  codeLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
    lineHeight: 23.2,
  },
  codeField: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    height: 75,
    justifyContent: "center",
    marginTop: 2,
  },
  errorCodeField: {
    backgroundColor: colors.boxPink,
  },
  codeText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 27,
    lineHeight: 39.15,
  },
  codeHint: {
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
    marginTop: 15,
  },
  successHint: {
    color: colors.brown2,
  },
  errorHint: {
    color: colors.brown,
  },
  noticeCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    left: 20,
    padding: 16,
    position: "absolute",
    top: 418,
    width: 335,
  },
  noticeText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
  },
  bottomActions: {
    alignItems: "center",
    alignSelf: "center",
    bottom: 0,
    height: 142,
    position: "absolute",
    width: 375,
  },
  successAction: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    width: 335,
  },
  successActionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
  errorAction: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    width: 335,
  },
  errorActionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    marginTop: 12,
    width: 335,
  },
  errorSecondaryAction: {
    marginTop: 0,
  },
  secondaryActionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
