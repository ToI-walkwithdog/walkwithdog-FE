import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const CHECKLIST_ITEMS = [
  "강아지를 담당자에게 인계했어요!",
  "리드줄·하네스와 물품을 반납했어요",
  "강아지 상태와 특이사항을 전달했어요",
] as const;

export default function WalkHandoverScreen() {
  const router = useRouter();
  const [checked, setChecked] = useState([false, false, false]);
  const complete = checked.every(Boolean);

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
      safeAreaEdges={[]}
      testID="screen-6-1"
    >
      <View style={styles.root}>
        <View style={styles.contentFrame}>
          <Text style={styles.title}>보호소 인계</Text>
          <Text style={styles.description}>
            기록을 저장하기 전에{"\n"}
            보호소 담당자와 인계를 마무리해 주세요 :)
          </Text>

          <GradientView token={gradientCardCream} style={styles.walkSummaryCard}>
            <Text style={styles.dogName}>
              콩이 · <Text style={styles.shelterName}>행복 보호소</Text>
            </Text>
            <Text style={styles.walkStats}>32m 15s     2.4 km</Text>
            <Text style={styles.averageSpeed}>평균 속도 4.5 km/h</Text>
          </GradientView>

          <View style={styles.checklist}>
            <Text style={styles.checklistTitle}>복귀 확인</Text>
            {CHECKLIST_ITEMS.map((item, index) => (
              <Pressable
                accessibilityLabel={item}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: checked[index] }}
                key={item}
                onPress={() => toggleItem(index)}
                style={[
                  styles.checkItem,
                  { top: 30 + index * 54 },
                ]}
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

          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>
              아직 보호소로 돌아오지 않았다면{"\n"}
              인계를 마친 후 완료해 주세요.
            </Text>
          </View>
        </View>

        <View style={styles.bottomActions}>
          {complete ? (
            <GradientView token={gradientButtonWarm} style={styles.primaryAction}>
              <Pressable
                accessibilityLabel="인계 완료 · 기록 남기기"
                accessibilityRole="button"
                onPress={() => router.push("/6-2")}
                style={styles.primaryActionPressable}
              >
                <Text style={styles.primaryActionText}>인계 완료 · 기록 남기기</Text>
              </Pressable>
            </GradientView>
          ) : (
            <Pressable
              accessibilityLabel="인계 완료 · 기록 남기기"
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              onPress={() => undefined}
              style={[styles.primaryAction, styles.primaryActionIncomplete]}
            >
              <Text style={styles.primaryActionText}>인계 완료 · 기록 남기기</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityLabel="산책 화면으로 돌아가기"
            accessibilityRole="button"
            onPress={() => router.replace("/5-1")}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryActionText}>
              산책 화면으로 돌아가기
            </Text>
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
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.largeTitle,
    left: 20,
    lineHeight: 36.25,
    position: "absolute",
    top: 64,
  },
  description: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.bodyLarge,
    left: 20,
    lineHeight: 21.75,
    position: "absolute",
    top: 112,
  },
  walkSummaryCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    height: 122,
    left: 20,
    padding: 18,
    position: "absolute",
    top: 174,
    width: 335,
  },
  dogName: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.title,
    lineHeight: 29,
  },
  shelterName: {
    color: colors.mildLightBrown,
  },
  walkStats: {
    color: colors.deepOrange,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.largeTitle,
    lineHeight: 36.25,
  },
  averageSpeed: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
  },
  checklist: {
    height: 182,
    left: 20,
    position: "absolute",
    top: 316,
    width: 335,
  },
  checklistTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
    lineHeight: 22,
  },
  checkItem: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.lightOrange,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    height: 44,
    left: 0,
    paddingHorizontal: 13,
    position: "absolute",
    width: 335,
  },
  checkDot: {
    backgroundColor: colors.lightOrange,
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  checkedDot: {
    backgroundColor: colors.brown,
  },
  checkItemText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 15,
    lineHeight: 22,
    marginLeft: 10,
  },
  noticeCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    left: 20,
    padding: 16,
    position: "absolute",
    top: 504,
    width: 335,
  },
  noticeText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
  },
  bottomActions: {
    alignSelf: "center",
    bottom: 28,
    height: 110,
    position: "absolute",
    width: 335,
  },
  primaryAction: {
    alignItems: "center",
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    width: 335,
  },
  primaryActionPressable: {
    alignItems: "center",
    height: 49,
    justifyContent: "center",
    width: 335,
  },
  primaryActionIncomplete: {
    backgroundColor: colors.cream,
  },
  primaryActionComplete: {
    backgroundColor: colors.midLightOrange,
  },
  primaryActionText: {
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
  },
  secondaryActionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
