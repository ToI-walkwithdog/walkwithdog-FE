import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { routeForFailure } from "../../api/auth";
import {
  cancelledBySomeoneElse,
  HOME_STATUS_LABELS,
  MY_BOOKING_DESCRIPTIONS,
} from "../../api/bookingCodes";
import type { ApiFailure } from "../../api/client";
import { errorMessage } from "../../api/errorMessages";
import {
  BOOKING_FILTERS,
  MY_BOOKINGS_PAGE_SIZE,
  queryForFilter,
  routeForBooking,
  setSelectedBookingId,
  type BookingFilter,
} from "../../api/myBookings";
import { fetchMyWalkRequests, type MyWalkRequest } from "../../api/walkRequests";
import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientCardCream } from "../../theme/gradients";
import { colors, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { formatSlotDate, formatSlotTime } from "../../utils/kst";

// 8-1과 8-2는 같은 화면이다. 예약이 하나도 없으면 목록 대신 빈 화면 문구를 보여 준다.
export type MyBookingsScreenState = "list" | "empty";

type Phase = "loading" | "ready" | "error";

function describe(booking: MyWalkRequest): string {
  if (
    booking.display_status === "CANCELLED" &&
    cancelledBySomeoneElse(booking.cancelled_actor_role)
  ) {
    return "보호소에서 취소한 예약이에요.";
  }
  return MY_BOOKING_DESCRIPTIONS[booking.display_status];
}

export function MyBookingsScreen(_: { state: MyBookingsScreenState }) {
  const router = useRouter();
  const [filter, setFilter] = useState<BookingFilter>("전체");
  const [items, setItems] = useState<MyWalkRequest[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const sequence = useRef(0);

  // 필터를 바꾸거나 새로고침하면 첫 페이지부터 다시 불러온다. 늦게 온 응답은 버린다.
  const loadFirstPage = useCallback(
    async (target: BookingFilter, mode: "initial" | "refresh") => {
      const current = ++sequence.current;
      if (mode === "initial") setPhase("loading");
      else setRefreshing(true);
      const result = await fetchMyWalkRequests({
        ...queryForFilter(target),
        limit: MY_BOOKINGS_PAGE_SIZE,
        offset: 0,
      });
      if (current !== sequence.current) return;
      setRefreshing(false);
      if (result.ok) {
        setItems(result.data);
        // 응답에 전체 개수가 없어서, 한 페이지가 가득 차면 더 있다고 본다.
        setHasMore(result.data.length === MY_BOOKINGS_PAGE_SIZE);
        setFailure(null);
        setPhase("ready");
        return;
      }
      const route = await routeForFailure(result);
      if (route) {
        router.replace(route);
        return;
      }
      setFailure(result);
      setPhase("error");
    },
    [router],
  );

  useEffect(() => {
    void loadFirstPage(filter, "initial");
    return () => {
      sequence.current += 1;
    };
  }, [filter, loadFirstPage]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const current = sequence.current;
    setLoadingMore(true);
    const result = await fetchMyWalkRequests({
      ...queryForFilter(filter),
      limit: MY_BOOKINGS_PAGE_SIZE,
      offset: items.length,
    });
    setLoadingMore(false);
    if (current !== sequence.current) return;
    if (!result.ok) {
      setFailure(result);
      return;
    }
    setFailure(null);
    setItems((previous) => [...previous, ...result.data]);
    setHasMore(result.data.length === MY_BOOKINGS_PAGE_SIZE);
  };

  const noBookingsAtAll = phase === "ready" && items.length === 0 && filter === "전체";

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
      testID={noBookingsAtAll ? "screen-8-2" : "screen-8-1"}
    >
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
            width={7.41}
            height={12}
            color={colors.brown}
          />
        </Pressable>
        <Text style={styles.headerTitle}>함께할 산책을 확인하개</Text>
      </View>

      {noBookingsAtAll ? (
        <Text style={styles.emptyText}>예약 현황이 없어요.</Text>
      ) : (
        <>
          <Text style={styles.subtitle}>신청부터 확정까지, 여기서 한눈에 봐요.</Text>

          <View style={styles.filters}>
            {BOOKING_FILTERS.map((item) => (
              <Pressable
                accessibilityLabel={item}
                accessibilityRole="button"
                key={item}
                onPress={() => setFilter(item)}
                style={[styles.filter, filter === item && styles.filterActive]}
              >
                <Text
                  style={[styles.filterText, filter === item && styles.filterTextActive]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.cards}>
            {phase === "loading" ? (
              <Text style={styles.description}>불러오는 중...</Text>
            ) : null}

            {phase === "error" ? (
              <View style={styles.errorBlock}>
                <Text style={styles.description}>{errorMessage(failure?.code)}</Text>
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

            {phase === "ready"
              ? items.map((booking) => (
                  <Pressable
                    accessibilityLabel={`${booking.dog.name} ${HOME_STATUS_LABELS[booking.display_status]} 예약 상세`}
                    accessibilityRole="button"
                    key={booking.id}
                    onPress={() => {
                      setSelectedBookingId(booking.id);
                      router.push(routeForBooking(booking.display_status));
                    }}
                    style={styles.cardPressable}
                  >
                    <GradientView token={gradientCardCream} style={styles.card}>
                      <View style={styles.cardTitleRow}>
                        <Text numberOfLines={1} style={styles.cardTitle}>
                          {booking.dog.name}와 산책
                        </Text>
                        {booking.shelter_name ? (
                          <Text numberOfLines={1} style={styles.shelterLink}>
                            {booking.shelter_name} ›
                          </Text>
                        ) : null}
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>
                            {HOME_STATUS_LABELS[booking.display_status]}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.schedule}>
                        {formatSlotDate(booking.requested_start_at)} ·{" "}
                        {formatSlotTime(booking.requested_start_at, booking.requested_end_at)}
                      </Text>
                      <Text style={styles.description}>{describe(booking)}</Text>
                    </GradientView>
                  </Pressable>
                ))
              : null}

            {phase === "ready" && items.length === 0 ? (
              <Text style={styles.description}>해당하는 예약이 없어요.</Text>
            ) : null}

            {phase === "ready" && failure ? (
              <Text style={styles.description}>{errorMessage(failure.code)}</Text>
            ) : null}

            {phase === "ready" && hasMore ? (
              <Pressable
                accessibilityLabel="더보기"
                accessibilityRole="button"
                disabled={loadingMore}
                onPress={() => void loadMore()}
                style={styles.moreButton}
              >
                <Text style={styles.retryText}>
                  {loadingMore ? "불러오는 중..." : "더보기"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </>
      )}
    </Screen>
  );
}

export function MyBookingsListRoute() {
  return <MyBookingsScreen state="list" />;
}

export function MyBookingsEmptyRoute() {
  return <MyBookingsScreen state="empty" />;
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 13,
  },
  header: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    height: 36,
    paddingLeft: 0,
    width: 335,
  },
  backButton: {
    alignItems: "center",
    height: 29,
    justifyContent: "center",
    marginRight: 3,
    width: 29,
  },
  headerTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 25,
    lineHeight: 36,
  },
  subtitle: {
    alignSelf: "center",
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 15,
    lineHeight: 21.75,
    marginTop: 38 - 36,
    width: 335,
  },
  filters: {
    alignSelf: "center",
    flexDirection: "row",
    gap: 12,
    height: 26,
    marginTop: 12,
    width: 335,
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
  filterTextActive: {
    color: colors.brown,
  },
  cards: {
    alignSelf: "center",
    gap: 13,
    marginTop: 13,
    width: 335,
  },
  cardPressable: {
    height: 126,
    width: 335,
  },
  card: {
    borderRadius: 16,
    height: 126,
    justifyContent: "center",
    paddingHorizontal: 16,
    width: 335,
  },
  cardTitleRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  cardTitle: {
    color: colors.brown,
    flexShrink: 1,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.title,
  },
  shelterLink: {
    color: colors.deepOrange,
    flexShrink: 1,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.body,
    marginLeft: 8,
  },
  statusBadge: {
    alignItems: "center",
    backgroundColor: colors.lightOrange,
    borderRadius: 25,
    height: 29,
    justifyContent: "center",
    marginLeft: "auto",
    paddingHorizontal: 10,
  },
  statusText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.small,
  },
  schedule: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
    marginTop: 4,
  },
  description: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
    marginTop: 4,
  },
  emptyText: {
    alignSelf: "center",
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.title,
    marginTop: 220,
  },
  errorBlock: {
    alignItems: "center",
    width: 335,
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
});
