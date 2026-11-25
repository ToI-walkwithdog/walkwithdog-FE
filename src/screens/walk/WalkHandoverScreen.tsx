import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { routeForFailure } from "../../api/auth";
import type { ApiFailure } from "../../api/client";
import {
  invalidateHistoryCache,
  loadWalkResult,
  resolveResultWalkId,
  walkFailureMessage,
  type WalkResult,
} from "../../api/walkResult";
import { fetchWalkDetail, postWalkHandover, type WalkHandoverBody } from "../../api/walks";
import { BottomSheet } from "../../components/BottomSheet";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { formatDurationLong, formatKm, paceToKmh } from "../../utils/walkFormat";

const CHECKLIST_ITEMS = [
  "강아지를 담당자에게 인계했어요!",
  "리드줄·하네스와 물품을 반납했어요",
  "강아지 상태와 특이사항을 전달했어요",
] as const;

const ISSUE_MAX = 500;

export default function WalkHandoverScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [result, setResult] = useState<WalkResult | null>(null);
  const [checked, setChecked] = useState([false, false, false]);
  const [submitting, setSubmitting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [issueError, setIssueError] = useState("");
  const submittingRef = useRef(false);
  const complete = checked.every(Boolean);

  const load = useCallback(async () => {
    setPhase("loading");
    const walkId = await resolveResultWalkId();
    if (walkId === null) {
      router.replace("/3");
      return;
    }
    const loaded = await loadWalkResult(walkId);
    if (!loaded.ok) {
      const route = await routeForFailure(loaded);
      if (route) {
        router.replace(route);
        return;
      }
      setFailure(loaded);
      setPhase("error");
      return;
    }
    if (loaded.data.walk.status === "IN_PROGRESS") {
      router.replace("/5-1");
      return;
    }
    // 이미 인계를 접수했거나(또는 인계가 필요 없는 산책이면) 기록 저장으로 넘어간다.
    if (loaded.data.handoverStatus !== "NOT_CONFIRMED") {
      router.replace("/6-2");
      return;
    }
    setResult(loaded.data);
    setPhase("ready");
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (phase !== "ready" || !result) {
    return (
      <Screen backgroundColor={colors.white} safeAreaEdges={[]} testID="screen-6-1">
        <View style={styles.loadState}>
          <Text style={styles.loadStateText}>
            {phase === "error" && failure ? walkFailureMessage(failure) : "불러오는 중..."}
          </Text>
          {phase === "error" ? (
            <>
              <Pressable
                accessibilityLabel="다시 시도"
                accessibilityRole="button"
                onPress={() => void load()}
                style={styles.loadStateButton}
              >
                <Text style={styles.loadStateButtonText}>다시 시도</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="홈으로"
                accessibilityRole="button"
                onPress={() => router.replace("/3")}
                style={styles.loadStateButton}
              >
                <Text style={styles.loadStateButtonText}>홈으로</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </Screen>
    );
  }

  const { walk } = result;
  // 자동 종료 산책의 정상 인계는 사용자가 자동 종료를 확인했다고 함께 보내야 한다.
  const autoTimeout = walk.end_reason === "AUTO_TIMEOUT";
  // 정상 종료(USER)나 자동 종료(AUTO_TIMEOUT)가 아닌 산책(직원이 중단한 산책 등)은 문제 접수만 가능하다.
  const problemOnly =
    !(walk.status === "COMPLETED" && (walk.end_reason === "USER" || autoTimeout));

  const toggleItem = (index: number) => {
    setChecked((current) =>
      current.map((value, itemIndex) =>
        itemIndex === index ? !value : value,
      ),
    );
  };

  const handleFailure = async (failed: ApiFailure) => {
    const route = await routeForFailure(failed);
    if (route) {
      router.replace(route);
      return;
    }
    if (failed.code === null && failed.status === 409) {
      // 다른 내용이 이미 접수됐거나 접수할 수 없는 산책이다. 서버의 현재 인계 상태로 판단한다.
      const detail = await fetchWalkDetail(walk.id);
      if (detail.ok && detail.data.handover_status !== "NOT_CONFIRMED") {
        setSheetOpen(false);
        Alert.alert("알림", "이미 인계가 접수된 산책이에요.", [
          { text: "확인", onPress: () => router.replace("/6-2") },
        ]);
        return;
      }
    }
    if (failed.code === null && (failed.status === 403 || failed.status === 404)) {
      Alert.alert("알림", walkFailureMessage(failed), [
        { text: "확인", onPress: () => router.replace("/3") },
      ]);
      return;
    }
    Alert.alert("알림", walkFailureMessage(failed));
  };

  // 재시도에도 같은 본문을 보낸다. 서버는 같은 내용이면 200으로 기존 접수를 돌려준다.
  const submit = async (body: WalkHandoverBody) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const response = await postWalkHandover(walk.id, body);
      if (response.ok) {
        invalidateHistoryCache();
        setSheetOpen(false);
        router.replace("/6-2");
        return;
      }
      await handleFailure(response);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const submitComplete = () => {
    const body: WalkHandoverBody = {
      handover_result: "COMPLETE",
      dog_returned: true,
      equipment_returned: true,
      condition_shared: true,
      acknowledge_auto_timeout: autoTimeout,
    };
    if (!autoTimeout) {
      void submit(body);
      return;
    }
    Alert.alert(
      "자동 종료된 산책이에요",
      "위치 기록이 오래 수신되지 않아 산책이 자동 종료됐어요. 그래도 인계를 마쳤다고 접수할까요?",
      [
        { text: "취소", style: "cancel" },
        { text: "접수하기", onPress: () => void submit(body) },
      ],
    );
  };

  const submitIssue = () => {
    const text = issueText.trim();
    if (complete) {
      setIssueError("미완료 항목이 하나 이상 있어야 문제를 접수할 수 있어요.");
      return;
    }
    if (!text) {
      setIssueError("문제 내용을 입력해 주세요.");
      return;
    }
    if (text.length > ISSUE_MAX) {
      setIssueError(`문제 내용은 ${ISSUE_MAX}자 이하로 입력해 주세요.`);
      return;
    }
    setIssueError("");
    void submit({
      handover_result: "ISSUE",
      dog_returned: checked[0],
      equipment_returned: checked[1],
      condition_shared: checked[2],
      acknowledge_auto_timeout: false,
      issue_description: text,
    });
  };

  const dogLabel = result.dogName || "산책";

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
              {dogLabel}
              {result.shelterName ? (
                <Text style={styles.shelterName}> · {result.shelterName}</Text>
              ) : null}
            </Text>
            <Text style={styles.walkStats}>
              {formatDurationLong(walk.duration_seconds)}     {formatKm(walk.total_distance_m)} km
            </Text>
            <Text style={styles.averageSpeed}>평균 속도 {paceToKmh(walk.average_pace)} km/h</Text>
          </GradientView>

          <View style={styles.checklist}>
            <Text style={styles.checklistTitle}>복귀 확인</Text>
            {CHECKLIST_ITEMS.map((item, index) => (
              <Pressable
                accessibilityLabel={item}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: checked[index], disabled: submitting }}
                disabled={submitting}
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
              {problemOnly
                ? "중단된 산책은 인계에 문제가 있었다고만 접수할 수 있어요."
                : autoTimeout
                  ? "위치 기록이 끊겨 자동 종료된 산책이에요.\n인계를 마쳤다면 완료로 접수해 주세요."
                  : "아직 보호소로 돌아오지 않았다면\n인계를 마친 후 완료해 주세요."}
            </Text>
          </View>
        </View>

        <View style={styles.bottomActions}>
          {problemOnly ? (
            <GradientView token={gradientButtonWarm} style={styles.primaryAction}>
              <Pressable
                accessibilityLabel="문제 접수하기"
                accessibilityRole="button"
                accessibilityState={{ disabled: submitting }}
                disabled={submitting}
                onPress={() => setSheetOpen(true)}
                style={styles.primaryActionPressable}
              >
                <Text style={styles.primaryActionText}>문제 접수하기</Text>
              </Pressable>
            </GradientView>
          ) : complete ? (
            <GradientView token={gradientButtonWarm} style={styles.primaryAction}>
              <Pressable
                accessibilityLabel="인계 완료 · 기록 남기기"
                accessibilityRole="button"
                accessibilityState={{ disabled: submitting }}
                disabled={submitting}
                onPress={submitComplete}
                style={[styles.primaryActionPressable, submitting && styles.disabledAction]}
              >
                <Text style={styles.primaryActionText}>
                  {submitting ? "접수하는 중..." : "인계 완료 · 기록 남기기"}
                </Text>
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
            accessibilityLabel={problemOnly ? "홈으로" : "인계에 문제가 있어요"}
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting }}
            disabled={submitting}
            onPress={problemOnly ? () => router.replace("/3") : () => setSheetOpen(true)}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryActionText}>
              {problemOnly ? "홈으로" : "인계에 문제가 있어요"}
            </Text>
          </Pressable>
        </View>

        <BottomSheet
          height={420}
          onClose={() => {
            if (!submitting) setSheetOpen(false);
          }}
          title="인계 문제 접수"
          visible={sheetOpen}
        >
          <View style={styles.sheetBody}>
            <Text style={styles.sheetText}>
              위 체크리스트에서 마치지 못한 항목은 체크하지 않은 채로 두고,{"\n"}
              어떤 문제가 있었는지 적어 주세요.
            </Text>
            <PillTextInput
              accessibilityLabel="인계 문제 내용"
              borderColor={colors.lightOrange}
              borderRadius={radii.card}
              fontFamily={fontFamilies.nanumSquareRoundRegular}
              fontSize={typography.fontSizes.bodyLarge}
              height={140}
              maxLength={ISSUE_MAX}
              multiline
              onChangeText={(value) => {
                setIssueText(value);
                setIssueError("");
              }}
              paddingHorizontal={16}
              placeholder="문제 내용을 입력해 주세요."
              placeholderColor={colors.brown2}
              style={styles.issueInput}
              textAlignVertical="top"
              value={issueText}
            />
            {issueError ? <Text style={styles.issueError}>{issueError}</Text> : null}
            <Pressable
              accessibilityLabel="문제 접수"
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting }}
              disabled={submitting}
              onPress={submitIssue}
              style={[styles.sheetSend, submitting && styles.disabledAction]}
            >
              <Text style={styles.primaryActionText}>
                {submitting ? "접수하는 중..." : "문제 접수"}
              </Text>
            </Pressable>
          </View>
        </BottomSheet>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  loadStateText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 22,
    textAlign: "center",
    width: 300,
  },
  loadStateButton: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 44,
    justifyContent: "center",
    marginTop: 12,
    width: 200,
  },
  loadStateButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
  },
  disabledAction: {
    opacity: 0.5,
  },
  sheetBody: {
    alignSelf: "center",
    width: 335,
  },
  sheetText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 14,
    lineHeight: 20.3,
    marginBottom: 12,
  },
  issueInput: {
    backgroundColor: colors.white,
  },
  issueError: {
    color: colors.reportRed,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    marginTop: 8,
  },
  sheetSend: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    marginTop: 16,
  },
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
