import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { routeForFailure } from "../../api/auth";
import type { ApiFailure } from "../../api/client";
import {
  getResultWalkId,
  loadWalkResult,
  prepareStoredLevelUp,
  setResultWalkId,
  walkFailureMessage,
  type WalkResult,
} from "../../api/walkResult";
import { fetchWalkSummary, type MarkerType, type WalkSummary } from "../../api/walks";
import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { formatWalkDateTime } from "../../utils/kst";
import { formatDurationClock, formatKm, paceToKmh } from "../../utils/walkFormat";

const MARKER_LABELS: Record<MarkerType, string> = {
  SNIFF: "냄새 맡기",
  POOP: "배변",
  DOG_ENCOUNTER: "다른 개",
  PERSON_ENCOUNTER: "사람 만남",
  BARKING: "짖음",
  CROSSWALK_WAIT: "횡단보도 대기",
  OTHER: "기타",
};

// 마커를 이름별 개수로 묶는다. 포토스팟은 OTHER + 메모 "포토스팟"으로 저장돼 있다.
function markerCounts(summary: WalkSummary): string {
  const counts = new Map<string, number>();
  for (const marker of summary.markers) {
    const label =
      marker.marker_type === "OTHER" && marker.memo === "포토스팟"
        ? "포토스팟"
        : MARKER_LABELS[marker.marker_type] ?? "기타";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].map(([label, count]) => `${label} ${count}`).join(", ");
}

const HANDOVER_TITLES = {
  SELF_REPORTED: "✓ 보호소 복귀·인계 확인 완료",
  ISSUE_REPORTED: "인계 문제를 접수했어요",
  NOT_CONFIRMED: "인계 확인이 필요해요",
  NOT_REQUIRED: "인계가 필요 없는 산책이에요",
} as const;

export default function WalkRecordDetailScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [result, setResult] = useState<WalkResult | null>(null);
  const [summary, setSummary] = useState<WalkSummary | null>(null);

  const load = useCallback(async () => {
    const walkId = getResultWalkId();
    if (walkId === null) {
      router.replace("/9-1");
      return;
    }
    setPhase("loading");
    const [loaded, summaryResult] = await Promise.all([
      loadWalkResult(walkId),
      fetchWalkSummary(walkId),
    ]);
    const failed = !loaded.ok ? loaded : !summaryResult.ok ? summaryResult : null;
    if (failed) {
      const target = await routeForFailure(failed);
      if (target) {
        router.replace(target);
        return;
      }
      setFailure(failed);
      setPhase("error");
      return;
    }
    if (!loaded.ok || !summaryResult.ok) return;
    setResult(loaded.data);
    setSummary(summaryResult.data);
    setPhase("ready");
    // 서버에 저장된 레벨업 이벤트가 아직 보지 않은 것이면 레벨업 화면을 보여 준다(본 이벤트는 다시 보여 주지 않는다).
    void prepareStoredLevelUp(loaded.data.walk, summaryResult.data).then((show) => {
      if (show) router.push("/6-3");
    });
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (phase !== "ready" || !result || !summary) {
    return (
      <Screen backgroundColor={colors.white} safeAreaEdges={[]} testID="screen-9-2">
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
                accessibilityLabel="산책 기록 목록으로"
                accessibilityRole="button"
                onPress={() => router.replace("/9-1")}
                style={styles.loadStateButton}
              >
                <Text style={styles.loadStateButtonText}>산책 기록 목록으로</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </Screen>
    );
  }

  const { walk } = result;
  const dogName = result.dogName || "산책";
  const markerLine = markerCounts(summary);
  const statusNote =
    walk.end_reason === "AUTO_TIMEOUT"
      ? " · 자동 종료됨"
      : walk.status === "INTERRUPTED"
        ? " · 중단됨"
        : "";
  const handoverStatus = summary.handover_status;

  return (
    <Screen
      backgroundColor={colors.white}
      scroll
      safeAreaEdges={[]}
      testID="screen-9-2"
    >
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="뒤로"
            accessibilityRole="button"
            onPress={() => router.replace("/9-1")}
            style={styles.backButton}
          >
            <Icon name="icon-back" size={24} width={7.41} height={12} color={colors.brown} />
          </Pressable>
          <Text style={styles.headerTitle}>{dogName}와 산책</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.date}>
            {formatWalkDateTime(walk.started_at)}
            {statusNote}
          </Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabels}>총 시간                      거리</Text>
            <Text style={styles.summaryNumbers}>
              {formatDurationClock(walk.duration_seconds)}      {formatKm(walk.total_distance_m)} km
            </Text>
            <Text style={styles.speedText}>평균 속도  {paceToKmh(walk.average_pace)} km/h</Text>
          </View>
          <Text style={styles.sectionTitle}>작성한 메모 (미전송)</Text>
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              {summary.private_memo?.memo ?? "남긴 말이 없어요. 보호소에는 전송되지 않았어요."}
            </Text>
          </View>
          {markerLine ? (
            <Text style={styles.messageText}>기록한 항목: {markerLine}</Text>
          ) : null}
          <View style={styles.handoverCard}>
            <Text style={styles.handoverTitle}>{HANDOVER_TITLES[handoverStatus]}</Text>
            <Text style={styles.handoverMeta}>
              {[result.shelterName, result.dogName].filter(Boolean).join(" · ")}
            </Text>
          </View>
          {handoverStatus === "NOT_CONFIRMED" ? (
            <Pressable
              accessibilityLabel="인계 확인하기"
              accessibilityRole="button"
              onPress={() => {
                setResultWalkId(walk.id);
                router.push("/6-1");
              }}
              style={styles.handoverButton}
            >
              <Text style={styles.listButtonText}>인계 확인하기</Text>
            </Pressable>
          ) : null}
        </View>
        <Pressable
          accessibilityLabel="산책 기록 목록으로"
          accessibilityRole="button"
          onPress={() => router.replace("/9-1")}
          style={styles.listButton}
        >
          <Text style={styles.listButtonText}>산책 기록 목록으로</Text>
        </Pressable>
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
  handoverButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    height: 44,
    justifyContent: "center",
    marginTop: 12,
    width: 200,
  },
  root: { flex: 1, width: "100%" },
  header: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    height: 56,
    paddingHorizontal: 20,
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
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.largeTitle,
    marginLeft: 8,
  },
  body: {
    alignSelf: "center",
    paddingHorizontal: 20,
    width: 375,
  },
  date: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
  },
  summaryCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    height: 110,
    justifyContent: "center",
    marginTop: 12,
    padding: 18,
  },
  summaryLabels: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
  },
  summaryNumbers: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 27,
  },
  speedText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 15,
  },
  sectionTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 19,
    marginTop: 20,
  },
  messageCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    marginTop: 12,
    padding: 16,
  },
  messageText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 14,
  },
  handoverCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    marginTop: 12,
    padding: 16,
  },
  handoverTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 16,
  },
  handoverMeta: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 14,
  },
  listButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 28,
    width: 335,
  },
  listButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
