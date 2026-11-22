import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../../components/Screen";
import { useMockSession } from "../../context/MockSession";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm } from "../../theme/gradients";
import { UserInfoBackground } from "../../components/UserInfoBackground";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const ITEMS = [
  "리드줄 · 하네스",
  "배변봉투",
  "물 · 휴대용 물그릇",
  "물티슈",
] as const;

export default function WalkChecklistScreen() {
  const router = useRouter();
  const { clearMarkers } = useMockSession();
  const [checked, setChecked] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const checkedCount = checked.filter(Boolean).length;
  const complete = checkedCount === ITEMS.length;

  const toggleItem = (index: number) => {
    setChecked((current) =>
      current.map((value, itemIndex) =>
        itemIndex === index ? !value : value,
      ),
    );
  };

  return (
    <Screen
      backgroundColor={colors.white}
      scroll
      safeAreaEdges={[]}
      testID="screen-4-4"
    >
      <View style={styles.root}>
        <UserInfoBackground />

        <View style={styles.contentFrame}>
          <Text style={styles.title}>
            Ready For{"\n"}Walking?
          </Text>
          <Text style={styles.step}>출발 전 확인</Text>
          <Text style={styles.description}>
            보호소에서 받은 물품을 체크해 주세요 :){"\n"}
            빠짐없이 챙기고 안전하게 출발해요!
          </Text>

          <View style={styles.checklistSection}>
            <Text style={styles.sectionTitle}>
              01. 산책 준비물을 받았나요?
            </Text>
            {ITEMS.map((item, index) => (
              <Pressable
                accessibilityLabel={item}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: checked[index] }}
                key={item}
                onPress={() => toggleItem(index)}
                style={[styles.checkItem, { top: 38 + index * 54 }]}
              >
                <View
                  style={[
                    styles.checkDot,
                    checked[index] && styles.checkedDot,
                  ]}
                />
                <Text style={styles.checkItemText}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.safetySection}>
            <Text style={styles.sectionTitle}>
              02. 출발 전에 꼭 확인해 주세요
            </Text>
            <View style={styles.safetyCard}>
              <Text style={styles.safetyText}>
                하네스와 리드줄의 연결 상태를 확인하고,{"\n"}
                보호소 담당자에게 주의사항을 안내받으세요!
              </Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>준비물 확인</Text>
            <Text style={styles.progressCount}>
              {checkedCount} / 4
            </Text>
            <Text style={styles.progressHint}>
              모든 물품을 확인하면 산책을 시작할 수 있어요.
            </Text>
          </View>

          <View style={styles.bottomActions}>
            <Pressable
              accessibilityLabel="이전"
              accessibilityRole="button"
              onPress={() => router.replace("/4-1")}
              style={styles.previousButton}
            >
              <Text style={styles.previousButtonText}>이전</Text>
            </Pressable>
            {complete ? (
              <GradientView token={gradientButtonWarm} style={styles.startButton}>
                <Pressable
                  accessibilityLabel="산책 시작하기"
                  accessibilityRole="button"
                  onPress={() => {
                    Alert.alert("목업 산책", "시간·거리·지도 경로는 예시이며 실제 산책은 기록되지 않아요.", [
                      { text: "취소", style: "cancel" },
                      { text: "확인", onPress: () => {
                        clearMarkers();
                        router.push("/5-1");
                      } },
                    ]);
                  }}
                  style={styles.startButtonPressable}
                >
                  <Text style={[styles.startButtonText, styles.startButtonTextComplete]}>
                    시작하개!
                  </Text>
                </Pressable>
              </GradientView>
            ) : (
              <Pressable
                accessibilityLabel="산책 시작하기"
                accessibilityRole="button"
                accessibilityState={{ disabled: true }}
                onPress={() => undefined}
                style={[styles.startButton, styles.startButtonIncomplete]}
              >
                <Text style={styles.startButtonText}>산책 시작하기</Text>
              </Pressable>
            )}
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
  contentFrame: {
    alignSelf: "center",
    flex: 1,
    minHeight: 775,
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
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 25,
    position: "absolute",
    right: 23,
    textAlign: "right",
    top: 60,
  },
  description: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.bodyLarge,
    left: 23,
    lineHeight: 23,
    position: "absolute",
    top: 143,
  },
  checklistSection: {
    height: 264,
    left: 30,
    position: "absolute",
    top: 196,
    width: 306,
  },
  sectionTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
    lineHeight: 22,
  },
  checkItem: {
    backgroundColor: colors.white,
    borderColor: colors.lightOrange,
    borderRadius: radii.inputPill,
    borderWidth: 1,
    height: 44,
    left: 0,
    position: "absolute",
    width: 306,
  },
  checkDot: {
    backgroundColor: colors.lightOrange,
    borderRadius: 12,
    height: 24,
    left: 13,
    position: "absolute",
    top: 9,
    width: 24,
  },
  checkedDot: {
    backgroundColor: colors.brown,
  },
  checkItemText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.subtitle,
    left: 47,
    lineHeight: 22,
    position: "absolute",
    top: 11,
  },
  safetySection: {
    height: 128,
    left: 30,
    position: "absolute",
    top: 475,
    width: 306,
  },
  safetyCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.inputPill,
    height: 94,
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 16,
  },
  safetyText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 23,
  },
  progressSection: {
    left: 30,
    position: "absolute",
    top: 637,
    width: 317,
  },
  progressTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
    lineHeight: 22,
  },
  progressCount: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
    position: "absolute",
    right: 5,
    top: 0,
  },
  progressHint: {
    color: colors.brown3,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  bottomActions: {
    alignSelf: "center",
    height: 54,
    position: "absolute",
    bottom: 24,
    width: 324,
  },
  previousButton: {
    alignItems: "center",
    backgroundColor: colors.peach,
    borderRadius: 27,
    height: 54,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    width: 94,
  },
  previousButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.title,
  },
  startButton: {
    alignItems: "center",
    borderRadius: 27,
    height: 54,
    justifyContent: "center",
    left: 106,
    position: "absolute",
    width: 218,
  },
  startButtonPressable: {
    alignItems: "center",
    height: 54,
    justifyContent: "center",
    width: 218,
  },
  startButtonIncomplete: {
    backgroundColor: colors.lightOrange,
  },
  startButtonComplete: {
    backgroundColor: colors.midLightOrange,
  },
  startButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.title,
  },
  startButtonTextComplete: {
    color: colors.brown,
  },
});
