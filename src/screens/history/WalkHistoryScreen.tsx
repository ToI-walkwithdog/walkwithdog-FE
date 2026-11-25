import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { routeForFailure } from "../../api/auth";
import type { ApiFailure } from "../../api/client";
import { errorMessage } from "../../api/errorMessages";
import {
  checkPendingLevelUps,
  getHistoryVersion,
  HISTORY_PAGE_SIZE,
  selectHistoryWalk,
} from "../../api/walkResult";
import { fetchVolunteerMe, type VolunteerMe } from "../../api/volunteers";
import { fetchWalkHistory, type WalkHistoryItem } from "../../api/walks";
import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { formatMonthDay } from "../../utils/kst";
import { formatKm } from "../../utils/walkFormat";

type Phase = "loading" | "ready" | "error";
// NEEDS_HANDOVER는 인계를 아직 접수하지 않은 산책만 본다(서버 필터 handover_status=NOT_CONFIRMED).
type HistoryFilter = "ALL" | "NEEDS_HANDOVER";

// 페이지 사이에 목록이 바뀌면 같은 산책이 두 번 올 수 있다. 산책 ID로 한 번만 남긴다.
function mergeById(current: WalkHistoryItem[], incoming: WalkHistoryItem[]): WalkHistoryItem[] {
  const seen = new Set(current.map((item) => item.walk_id));
  const added = incoming.filter((item) => {
    if (seen.has(item.walk_id)) return false;
    seen.add(item.walk_id);
    return true;
  });
  return [...current, ...added];
}

function recordMeta(item: WalkHistoryItem): string {
  const parts = [formatMonthDay(item.started_at), item.shelter_name ?? "보호소"];
  if (item.end_reason === "AUTO_TIMEOUT") parts.push("자동 종료");
  else if (item.status === "INTERRUPTED") parts.push("중단");
  if (item.handover_status === "NOT_CONFIRMED") parts.push("인계 확인 필요");
  return parts.join("  ·  ");
}

export default function WalkHistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<WalkHistoryItem[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [volunteer, setVolunteer] = useState<VolunteerMe | null>(null);
  const [filter, setFilter] = useState<HistoryFilter>("ALL");
  // 인계가 필요한 산책 수. 서버의 total(현재 필터의 전체 개수)을 쓴다.
  const [needsCount, setNeedsCount] = useState<number | null>(null);
  const sequence = useRef(0);
  // 다음 offset은 서버가 돌려준 원본 개수만큼 더한다. 중복을 뺀 목록 길이를 쓰지 않는다.
  const nextOffset = useRef(0);
  // 서버가 알려 준 현재 필터의 전체 개수.
  const totalCount = useRef(0);
  const seenVersion = useRef(getHistoryVersion());

  // 처음, 필터 변경, 새로고침은 첫 페이지부터 다시 불러온다. 늦게 온 응답은 버린다.
  const loadFirstPage = useCallback(
    async (target: HistoryFilter, mode: "initial" | "refresh") => {
      const current = ++sequence.current;
      if (mode === "initial") setPhase("loading");
      else setRefreshing(true);
      const needsOnly = target === "NEEDS_HANDOVER";
      const [history, stats, pending] = await Promise.all([
        fetchWalkHistory(HISTORY_PAGE_SIZE, 0, needsOnly ? "NOT_CONFIRMED" : undefined),
        fetchVolunteerMe(),
        needsOnly ? Promise.resolve(null) : fetchWalkHistory(1, 0, "NOT_CONFIRMED"),
      ]);
      if (current !== sequence.current) return;
      setRefreshing(false);
      if (stats.ok) setVolunteer(stats.data);
      if (history.ok) {
        setItems(mergeById([], history.data.walks));
        nextOffset.current = history.data.walks.length;
        totalCount.current = history.data.total;
        // 요청한 limit보다 적게 오면 마지막 페이지다. 서버의 total도 함께 쓴다.
        setHasMore(
          history.data.walks.length >= HISTORY_PAGE_SIZE &&
            nextOffset.current < history.data.total,
        );
        setNeedsCount(
          needsOnly ? history.data.total : pending?.ok ? pending.data.total : null,
        );
        setFailure(null);
        setPhase("ready");
        return;
      }
      const route = await routeForFailure(history);
      if (route) {
        router.replace(route);
        return;
      }
      setFailure(history);
      setPhase("error");
    },
    [router],
  );

  useEffect(() => {
    seenVersion.current = getHistoryVersion();
    void loadFirstPage(filter, "initial");
    return () => {
      sequence.current += 1;
    };
  }, [filter, loadFirstPage]);

  // 인계나 메모를 저장하고 돌아오면 첫 페이지부터 새로 불러온다.
  // 레벨 평가가 끝나지 않았던 산책이 있으면 결과를 다시 확인하고, 새 레벨업이 있으면 6-3으로 간다.
  useFocusEffect(
    useCallback(() => {
      if (seenVersion.current !== getHistoryVersion()) {
        seenVersion.current = getHistoryVersion();
        void loadFirstPage(filter, "initial");
      }
      let active = true;
      void checkPendingLevelUps().then((show) => {
        if (active && show) router.push("/6-3");
      });
      return () => {
        active = false;
      };
    }, [filter, loadFirstPage, router]),
  );

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const current = sequence.current;
    setLoadingMore(true);
    const result = await fetchWalkHistory(
      HISTORY_PAGE_SIZE,
      nextOffset.current,
      filter === "NEEDS_HANDOVER" ? "NOT_CONFIRMED" : undefined,
    );
    setLoadingMore(false);
    if (current !== sequence.current) return;
    if (!result.ok) {
      setFailure(result);
      return;
    }
    setFailure(null);
    nextOffset.current += result.data.walks.length;
    totalCount.current = result.data.total;
    setItems((previous) => mergeById(previous, result.data.walks));
    setHasMore(
      result.data.walks.length >= HISTORY_PAGE_SIZE && nextOffset.current < result.data.total,
    );
  };

  const walkCountText = volunteer ? `${volunteer.total_walk_count}회` : "-";
  const totalDistance = volunteer ? `${formatKm(volunteer.total_distance_m)} km` : "-";

  return (
    <Screen
      backgroundColor={colors.white}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          onRefresh={() => void loadFirstPage(filter, "refresh")}
          refreshing={refreshing}
          tintColor={colors.brown2}
        />
      }
      scroll
      safeAreaEdges={[]}
      testID="screen-9-1"
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="뒤로"
          accessibilityRole="button"
          onPress={() => router.replace("/3")}
          style={styles.backButton}
        >
          <Icon name="icon-back" size={24} width={7.41} height={12} color={colors.brown} />
        </Pressable>
        <Text style={styles.headerTitle}>산책 기록</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>함께 걸은 순간들</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumbers}>{walkCountText}        {totalDistance}</Text>
          <Text style={styles.summaryLabels}>총 산책                    총 거리</Text>
        </View>

        <Text style={styles.recentTitle}>최근 산책</Text>
        {(needsCount ?? 0) > 0 || filter === "NEEDS_HANDOVER" ? (
          <View style={styles.filters}>
            <Pressable
              accessibilityLabel="전체 산책"
              accessibilityRole="button"
              onPress={() => setFilter("ALL")}
              style={[styles.filter, filter === "ALL" && styles.filterActive]}
            >
              <Text style={styles.filterText}>전체</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="인계가 필요한 산책"
              accessibilityRole="button"
              onPress={() => setFilter("NEEDS_HANDOVER")}
              style={[styles.filter, filter === "NEEDS_HANDOVER" && styles.filterActive]}
            >
              <Text style={styles.filterText}>
                인계 필요{needsCount !== null ? ` ${needsCount}` : ""}
              </Text>
            </Pressable>
          </View>
        ) : null}
        <View style={styles.records}>
          {phase === "loading" ? <Text style={styles.stateText}>불러오는 중...</Text> : null}

          {phase === "error" ? (
            <View style={styles.errorBlock}>
              <Text style={styles.stateText}>{errorMessage(failure?.code)}</Text>
              <Pressable
                accessibilityLabel="다시 시도"
                accessibilityRole="button"
                onPress={() => void loadFirstPage(filter, "initial")}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>다시 시도</Text>
              </Pressable>
            </View>
          ) : null}

          {phase === "ready" && items.length === 0 ? (
            <Text style={styles.stateText}>
              {filter === "NEEDS_HANDOVER"
                ? "인계가 필요한 산책이 없어요."
                : "아직 산책 기록이 없어요."}
            </Text>
          ) : null}

          {phase === "ready"
            ? items.map((item) => (
                <Pressable
                  accessibilityLabel={`${item.dog.name}와 산책 상세`}
                  accessibilityRole="button"
                  key={item.walk_id}
                  onPress={() => {
                    selectHistoryWalk(item);
                    // 인계를 아직 접수하지 않은 산책은 바로 인계 화면(6-1)을 연다.
                    router.push(item.handover_status === "NOT_CONFIRMED" ? "/6-1" : "/9-2");
                  }}
                  style={styles.recordCard}
                >
                  <View style={styles.recordText}>
                    <Text numberOfLines={1} style={styles.recordName}>
                      {item.dog.name}와 산책
                    </Text>
                    <Text numberOfLines={1} style={styles.recordMeta}>
                      {recordMeta(item)}
                    </Text>
                  </View>
                  <Text style={styles.recordDistance}>
                    {formatKm(item.total_distance_m)} km  ›
                  </Text>
                </Pressable>
              ))
            : null}

          {phase === "ready" && failure ? (
            <Text style={styles.stateText}>{errorMessage(failure.code)}</Text>
          ) : null}

          {phase === "ready" && hasMore ? (
            <Pressable
              accessibilityLabel="더보기"
              accessibilityRole="button"
              disabled={loadingMore}
              onPress={() => void loadMore()}
              style={styles.moreButton}
            >
              <Text style={styles.retryText}>{loadingMore ? "불러오는 중..." : "더보기"}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Pressable
        accessibilityLabel="홈으로"
        accessibilityRole="button"
        onPress={() => router.replace("/3")}
        style={styles.homeButton}
      >
        <Text style={styles.homeButtonText}>홈으로</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 28 },
  header: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    height: 56,
    paddingHorizontal: 16,
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
    fontSize: 18,
    marginLeft: 12,
  },
  body: {
    alignSelf: "center",
    paddingHorizontal: 20,
    width: 375,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 27,
  },
  summaryCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    height: 100,
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 18,
  },
  summaryNumbers: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 27,
  },
  summaryLabels: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
  },
  recentTitle: {
    color: colors.mildLightBrown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 19,
    marginTop: 20,
  },
  filters: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  filter: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 25,
    height: 26,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  filterActive: {
    backgroundColor: colors.lightOrange,
  },
  filterText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.small,
  },
  records: { gap: 12, marginTop: 12 },
  recordCard: {
    alignItems: "center",
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    flexDirection: "row",
    height: 97,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  recordText: {
    flex: 1,
    marginRight: 8,
  },
  recordName: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 20,
  },
  recordMeta: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
  },
  recordDistance: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 24,
  },
  stateText: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 14,
    textAlign: "center",
  },
  errorBlock: {
    alignItems: "center",
  },
  retryButton: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    height: 44,
    justifyContent: "center",
    marginTop: 12,
    width: 200,
  },
  moreButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 44,
    justifyContent: "center",
    width: 200,
  },
  retryText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
  },
  homeButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    marginTop: 16,
    width: 335,
  },
  homeButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
