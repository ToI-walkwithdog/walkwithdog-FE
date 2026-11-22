import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Icon } from "../../components/Icon";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";
import { isValidShelterCode } from "../../data/shelterCodes";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const kongiImage = require("../../assets/images/dog-kongi.png");

export type ShelterCodeScreenState = "idle" | "filled" | "error";

export default function ShelterCodeScreen({
  initialState = "idle",
}: {
  initialState?: ShelterCodeScreenState;
}) {
  const router = useRouter();
  const [code, setCode] = useState(
    initialState === "filled"
      ? "428619"
      : initialState === "error"
        ? "428610"
        : "",
  );
  const [state, setState] = useState<ShelterCodeScreenState>(initialState);

  const onCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    setState(digits.length === 6 ? "filled" : "idle");
  };

  const submitCode = () => {
    if (code.length !== 6) return;
    if (!isValidShelterCode(code)) {
      setState("error");
      return;
    }
    router.replace("/4-4");
  };

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-4-1"
    >
      <View style={styles.root}>
        <View style={styles.contentFrame}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="뒤로"
              accessibilityRole="button"
              onPress={() => router.replace("/3")}
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

          <GradientView token={gradientCardCream} style={styles.walkCard}>
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
          </GradientView>

          <View style={styles.codeSection}>
            <Text style={styles.codeLabel}>보호소 발급 코드</Text>
            <PillTextInput
              accessibilityLabel="보호소 발급 코드"
              autoCapitalize="none"
              borderColor={
                state === "error"
                  ? "#FADADD"
                  : state === "filled"
                    ? colors.cream
                    : "#FDF3E7"
              }
              borderRadius={radii.card}
              fontFamily={fontFamilies.nanumSquareRoundExtraBold}
              fontSize={27}
              height={75}
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={onCodeChange}
              paddingHorizontal={18}
              placeholder="—  —  —  —  —  —"
              placeholderColor={colors.brown}
              style={[
                styles.codeInput,
                state === "error"
                  ? styles.codeInputError
                  : state === "filled"
                    ? styles.codeInputFilled
                    : styles.codeInputIdle,
              ]}
              textAlign="center"
              textColor={colors.brown}
              value={code}
            />
            {state === "idle" ? (
              <Text style={styles.codeHint}>
                *코드는 예약 당일 보호소에서 안내해 드려요!
              </Text>
            ) : state === "filled" ? (
              <Text style={styles.codeHint}>
                6자리를 입력했어요! 확인하고 출발하세요 :)
              </Text>
            ) : (
              <Text style={styles.errorHint}>
                코드가 맞지 않거나 만료되었어요 :({"\n"}
                담당자에게 확인 후 다시 입력해 주세요!
              </Text>
            )}
          </View>

          <View
            style={[
              styles.noticeCard,
              state === "error" ? styles.noticeCardError : null,
            ]}
          >
            <Text style={styles.noticeText}>
              코드 확인 후 준비물과 리드줄을 확인해 주세요.{"\n"}
              현재 코드는 목업이며 실제 확인은 연결되지 않았어요.
            </Text>
          </View>
        </View>

        <View style={styles.bottomActions}>
          {state === "filled" ? (
            <GradientView token={gradientButtonWarm} style={styles.primaryAction}>
              <Pressable
                accessibilityLabel="확인하고 시작하개!"
                accessibilityRole="button"
                onPress={submitCode}
                style={styles.primaryPressable}
              >
                <Text style={styles.primaryActionText}>확인하고 시작하개!</Text>
              </Pressable>
            </GradientView>
          ) : (
          <Pressable
            accessibilityLabel={
              state === "error" ? "코드 다시 입력하기" : "코드 확인 후 산책 시작"
            }
            accessibilityRole="button"
            onPress={state === "error" ? () => {
              setCode("");
              setState("idle");
            } : submitCode}
            style={[
              styles.primaryAction,
              state === "error" ? styles.primaryError : styles.primaryIdle,
            ]}
          >
            <Text style={styles.primaryActionText}>
              {state === "error" ? "코드 다시 입력하기" : "코드 확인 후 산책 시작"}
            </Text>
          </Pressable>
          )}
          <Pressable
            accessibilityLabel="예약 상세 보기"
            accessibilityRole="button"
            onPress={() => router.push("/8-3")}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryActionText}>예약 상세 보기</Text>
          </Pressable>
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
    top: 20,
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
    top: 76,
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
    top: 127,
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
    top: 240,
    width: 335,
  },
  codeLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
    lineHeight: 23.2,
  },
  codeInput: {
    marginTop: 2,
    width: 335,
  },
  codeInputIdle: {
    backgroundColor: colors.white,
  },
  codeInputFilled: {
    backgroundColor: colors.cream,
  },
  codeInputError: {
    backgroundColor: "#FADADD",
  },
  codeHint: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
    marginTop: 15,
  },
  errorHint: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
    marginTop: 15,
  },
  noticeCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    left: 20,
    padding: 16,
    position: "absolute",
    top: 391,
    width: 335,
  },
  noticeCardError: {
    top: 412,
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
  primaryAction: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    width: 335,
  },
  primaryIdle: {
    backgroundColor: colors.cream,
  },
  primaryFilled: {
    backgroundColor: colors.midLightOrange,
  },
  primaryError: {
    backgroundColor: colors.midLightOrange,
  },
  primaryActionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
  primaryPressable: {
    alignItems: "center",
    height: 49,
    justifyContent: "center",
    width: 335,
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
  secondaryActionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
