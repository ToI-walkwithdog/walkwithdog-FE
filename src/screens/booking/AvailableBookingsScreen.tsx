import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { routeForFailure } from "../../api/auth";
import { dogSizeLabel, SIZE_FILTERS } from "../../api/bookingCodes";
import {
  getAvailabilityList,
  setAvailabilityList,
  setSelectedDogId,
  type AvailabilityList,
} from "../../api/bookingDraft";
import {
  loadInitialAvailability,
  loadMoreAvailability,
  reloadAvailability,
} from "../../api/bookingList";
import type { ApiFailure, ApiResult } from "../../api/client";
import { errorMessage } from "../../api/errorMessages";
import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { dogImageSource } from "../../utils/dogImage";
import { formatSlotDate, formatSlotTime } from "../../utils/kst";

export type AvailableBookingsScreenState = "loading" | "list";

export function AvailableBookingsScreen({
  state,
}: {
  state: AvailableBookingsScreenState;
}) {
  return state === "loading" ? <LoadingView /> : <ListView />;
}

// 7-1: 목록 첫 페이지를 불러온 뒤 7-2로 간다. 실패하면 이 화면에서 다시 시도한다.
function LoadingView() {
  const router = useRouter();
  const [failure, setFailure] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setFailure(null);
    (async () => {
      const result = await loadInitialAvailability();
      if (cancelled) return;
      if (result.ok) {
        setAvailabilityList(result.data);
        router.replace("/7-2");
        return;
      }
      const target = await routeForFailure(result);
      if (cancelled) return;
      if (target) {
        router.replace(target);
        return;
      }
      setFailure(errorMessage(result.code));
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt, router]);

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-7-1"
    >
      <View style={loadingStyles.root}>
        <Text style={loadingStyles.title}>
          산책 가능 목록을{"\n"}
          가져오고 있어요 :)
        </Text>
        <Text style={loadingStyles.subtitle}>
          운명의 친구들을 데려올게요 🐾
        </Text>
        {failure ? (
          <View style={loadingStyles.errorBlock}>
            <Text style={loadingStyles.errorText}>{failure}</Text>
            <Pressable
              accessibilityLabel="다시 시도"
              accessibilityRole="button"
              onPress={() => setAttempt((count) => count + 1)}
              style={loadingStyles.retryButton}
            >
              <Text style={loadingStyles.retryText}>다시 시도</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="홈으로"
              accessibilityRole="button"
              onPress={() => router.replace("/3")}
              style={loadingStyles.homeButton}
            >
              <Text style={loadingStyles.retryText}>홈으로</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

// 7-2
function ListView() {
  const router = useRouter();
  const [list, setList] = useState<AvailabilityList | null>(getAvailabilityList);
  const [busy, setBusy] = useState<"filter" | "more" | null>(null);

  // 7-1을 거치지 않고 들어오면(목록이 비어 있으면) 처음부터 불러온다.
  useEffect(() => {
    if (!list) router.replace("/7-1");
  }, [list, router]);

  if (!list) return null;

  const apply = async (
    kind: "filter" | "more",
    request: () => Promise<ApiResult<AvailabilityList>>,
  ) => {
    if (busy) return;
    setBusy(kind);
    try {
      const result = await request();
      if (result.ok) {
        setAvailabilityList(result.data);
        setList(result.data);
        return;
      }
      await showFailure(result);
    } finally {
      setBusy(null);
    }
  };

  const showFailure = async (failure: ApiFailure) => {
    const target = await routeForFailure(failure);
    if (target) {
      router.replace(target);
      return;
    }
    Alert.alert("알림", errorMessage(failure.code));
  };

  const locationText = list.regionNames.length
    ? list.regionNames.join(", ")
    : "내 활동 지역";

  return (
    <Screen
      backgroundColor={colors.white}
      contentContainerStyle={listStyles.scrollContent}
      scroll
      safeAreaEdges={[]}
      testID="screen-7-2"
    >
      <View style={listStyles.header}>
        <Pressable
          accessibilityLabel="뒤로"
          accessibilityRole="button"
          onPress={() => router.replace("/3")}
          style={listStyles.backButton}
        >
          <Icon
            name="icon-back"
            size={24}
            width={7.41}
            height={12}
            color={colors.brown}
          />
        </Pressable>
        <Text style={listStyles.headerTitle}>예약 상세</Text>
      </View>

      <View style={listStyles.locationRow}>
        <Icon
          name="icon-location"
          size={18}
          width={18}
          height={18}
          color={colors.brown}
        />
        <Text numberOfLines={1} style={listStyles.locationText}>
          {locationText}
        </Text>
        <Icon
          name="icon-expand-more"
          size={18}
          width={18}
          height={18}
          color={colors.brown2}
        />
        <Text style={listStyles.nearestText}>활동 지역 기준</Text>
      </View>

      <View style={listStyles.filters}>
        {SIZE_FILTERS.map((filter) => {
          const active = list.sizeCode === filter.code;
          return (
            <Pressable
              accessibilityLabel={filter.label}
              accessibilityRole="button"
              key={filter.label}
              onPress={() => {
                if (list.sizeCode === filter.code) return;
                void apply("filter", () => reloadAvailability(list, filter.code));
              }}
              style={[listStyles.filter, active && listStyles.filterActive]}
            >
              <Text
                style={[
                  listStyles.filterText,
                  active && listStyles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[listStyles.cards, busy === "filter" && listStyles.cardsBusy]}>
        {list.items.map((dog) => {
          const source = dogImageSource(dog.image_url);
          const sizeLabel = dogSizeLabel(dog.size_code);
          return (
            <Pressable
              accessibilityLabel={`${dog.name} 산책 예약 상세`}
              accessibilityRole="button"
              key={dog.dog_id}
              onPress={() => {
                setSelectedDogId(dog.dog_id);
                router.push("/7-3");
              }}
              style={listStyles.card}
            >
              <View style={listStyles.profileRow}>
                {source ? (
                  <Image
                    accessible={false}
                    resizeMode="cover"
                    source={source}
                    style={listStyles.dogImage}
                  />
                ) : (
                  <View style={[listStyles.dogImage, listStyles.dogImageEmpty]}>
                    <Icon
                      name="icon-dog"
                      size={28}
                      width={28}
                      height={28}
                      color={colors.brown2}
                    />
                  </View>
                )}
                <View style={listStyles.profileText}>
                  <View style={listStyles.nameRow}>
                    <Text style={listStyles.dogName}>{dog.name}</Text>
                    {sizeLabel ? (
                      <View style={listStyles.sizeBadge}>
                        <Text style={listStyles.sizeBadgeText}>{sizeLabel}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={listStyles.shelterText}>
                    {dog.shelter.name}
                    {dog.shelter.region_name ? ` · ${dog.shelter.region_name}` : ""}
                  </Text>
                  {dog.max_walk_minutes !== null ? (
                    <View style={listStyles.durationRow}>
                      <Icon
                        name="icon-schedule"
                        size={14}
                        width={14}
                        height={14}
                        color={colors.brown}
                      />
                      <Text style={listStyles.durationText}>
                        최대 산책 시간 {dog.max_walk_minutes}m
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={listStyles.ratingBlock}>
                  <View style={listStyles.ratingRow}>
                    <Icon
                      name="icon-star"
                      size={16}
                      width={16}
                      height={16}
                      color={colors.brown}
                    />
                    <Text style={listStyles.rating}>
                      {dog.difficulty_score !== null
                        ? dog.difficulty_score.toFixed(1)
                        : "-"}
                    </Text>
                  </View>
                  <Text style={listStyles.ratingHint}>산책 난이도</Text>
                </View>
              </View>

              <View style={listStyles.scheduleSection}>
                <View style={listStyles.scheduleHeader}>
                  <Text style={listStyles.scheduleLabel}>예약 가능 일정</Text>
                  <View style={listStyles.scheduleAction}>
                    <Text style={listStyles.detailLink}>일정 선택</Text>
                    <Icon
                      name="icon-chevron-right"
                      size={14}
                      width={14}
                      height={14}
                      color={colors.brown}
                    />
                  </View>
                </View>
                <View style={listStyles.scheduleRows}>
                  {dog.date_slots.map((slot) => (
                    <View key={slot.date_slot_id} style={listStyles.scheduleRow}>
                      <Text style={listStyles.scheduleDate}>
                        {formatSlotDate(slot.starts_at)}
                      </Text>
                      <Text style={listStyles.scheduleTime}>
                        {formatSlotTime(slot.starts_at, slot.ends_at)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {list.items.length === 0 && busy !== "filter" ? (
        <View style={listStyles.empty}>
          <Text style={listStyles.emptyTitle}>
            지금 신청할 수 있는 강아지가 없어요
          </Text>
          <Text style={listStyles.emptyHint}>
            다른 크기를 선택하거나 나중에 다시 확인해 주세요.
          </Text>
        </View>
      ) : null}

      {list.hasMore ? (
        <Pressable
          accessibilityLabel="더보기"
          accessibilityRole="button"
          disabled={busy !== null}
          onPress={() => void apply("more", () => loadMoreAvailability(list))}
          style={listStyles.moreButton}
        >
          <Text style={listStyles.moreText}>
            {busy === "more" ? "불러오는 중..." : "더보기"}
          </Text>
        </Pressable>
      ) : null}

      <View style={listStyles.notice}>
        <Icon
          name="icon-info"
          size={26}
          width={26}
          height={26}
          color={colors.brown2}
        />
        <Text style={listStyles.noticeText}>
          원하는 강아지의 일정을 선택해 예약을 이어가세요.{"\n"}
          일정은 보호소 사정에 따라 변경될 수 있어요.
        </Text>
      </View>
    </Screen>
  );
}

export function AvailableBookingsLoadingRoute() {
  return <AvailableBookingsScreen state="loading" />;
}

export function AvailableBookingsListRoute() {
  return <AvailableBookingsScreen state="list" />;
}

const loadingStyles = StyleSheet.create({
  root: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.largeTitle,
    lineHeight: 32.5,
    textAlign: "center",
  },
  subtitle: {
    color: colors.mildBrown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 19.5,
    marginTop: 24,
  },
  errorBlock: {
    alignItems: "center",
    marginTop: 32,
    width: 327,
  },
  errorText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
    textAlign: "center",
  },
  retryButton: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    height: 44,
    justifyContent: "center",
    marginTop: 16,
    width: 200,
  },
  homeButton: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 44,
    justifyContent: "center",
    marginTop: 8,
    width: 200,
  },
  retryText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
  },
});

const listStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: 12,
    height: 56,
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
    fontSize: 18,
    lineHeight: 25.2,
  },
  locationRow: {
    alignItems: "center",
    alignSelf: "center",
    borderBottomColor: "#F0E8DC",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 6,
    height: 44,
    paddingHorizontal: 24,
    width: 375,
  },
  locationText: {
    color: colors.brown,
    flexShrink: 1,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 23,
  },
  nearestText: {
    color: "#64748B",
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 11,
    lineHeight: 18,
    marginLeft: "auto",
    textAlign: "right",
  },
  filters: {
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    height: 52,
    paddingHorizontal: 24,
    paddingTop: 12,
    width: 375,
  },
  filter: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    flex: 1,
    height: 36,
    justifyContent: "center",
  },
  filterActive: {
    backgroundColor: colors.mildBrown,
    borderRadius: 25,
  },
  filterText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
    lineHeight: 20,
  },
  filterTextActive: {
    color: colors.white,
    fontFamily: fontFamilies.nanumSquareRoundBold,
  },
  cards: {
    alignSelf: "center",
    width: 375,
  },
  cardsBusy: {
    opacity: 0.4,
  },
  card: {
    borderBottomColor: "#F0E8DC",
    borderBottomWidth: 1,
    height: 225,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  profileRow: {
    flexDirection: "row",
    height: 72,
  },
  dogImage: {
    borderRadius: 12,
    height: 72,
    width: 64,
  },
  dogImageEmpty: {
    alignItems: "center",
    backgroundColor: colors.cream,
    justifyContent: "center",
  },
  profileText: {
    flex: 1,
    marginLeft: 16,
    gap: 2,
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  dogName: {
    color: colors.text,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.title,
    lineHeight: 26,
  },
  sizeBadge: {
    backgroundColor: colors.cream,
    borderRadius: 5,
    height: 20,
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sizeBadgeText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 11,
  },
  shelterText: {
    color: "#848484",
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 11,
    lineHeight: 18,
  },
  durationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  durationText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 12,
    lineHeight: 18,
  },
  ratingBlock: {
    alignItems: "flex-end",
    height: 72,
    width: 64,
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    height: 16,
  },
  rating: {
    color: colors.brown,
    fontFamily: fontFamilies.pretendardMedium,
    fontSize: 15,
    lineHeight: 22,
    width: 23,
  },
  ratingHint: {
    color: "#C28745",
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },
  scheduleSection: {
    gap: 10,
    height: 96,
    marginTop: 16,
  },
  scheduleHeader: {
    alignItems: "center",
    flexDirection: "row",
    height: 18,
  },
  scheduleLabel: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 12,
    lineHeight: 18,
  },
  scheduleAction: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginLeft: "auto",
  },
  scheduleRows: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: 8,
    gap: 8,
    height: 68,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  scheduleRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 20,
    justifyContent: "space-between",
  },
  scheduleDate: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
    lineHeight: 20,
  },
  scheduleTime: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 13,
    lineHeight: 20,
  },
  detailLink: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 12,
    lineHeight: 18,
  },
  empty: {
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
    width: 375,
  },
  emptyTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
    lineHeight: 23.2,
    textAlign: "center",
  },
  emptyHint: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
    marginTop: 8,
    textAlign: "center",
  },
  moreButton: {
    alignItems: "center",
    alignSelf: "center",
    borderColor: colors.outer2,
    borderRadius: 25,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    marginHorizontal: 24,
    marginTop: 12,
    width: 327,
  },
  moreText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 14,
    lineHeight: 20,
  },
  notice: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
    height: 30,
    marginTop: 12,
    width: 327,
  },
  noticeText: {
    color: colors.brown3,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 13,
    lineHeight: 15,
  },
});
