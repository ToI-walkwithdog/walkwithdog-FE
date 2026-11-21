import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { availableBookings } from "../../data/availableBookings";
import { dogs } from "../../data/dogs";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export type AvailableBookingsScreenState = "loading" | "list";

export function AvailableBookingsScreen({
  state,
}: {
  state: AvailableBookingsScreenState;
}) {
  const router = useRouter();
  const [sizeFilter, setSizeFilter] = useState<"전체" | "소형견" | "중형견" | "대형견">("전체");

  useEffect(() => {
    if (state !== "loading") return;
    const timeout = setTimeout(() => router.replace("/7-2"), 1500);
    return () => clearTimeout(timeout);
  }, [router, state]);

  if (state === "loading") {
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
        </View>
      </Screen>
    );
  }

  const visibleBookings =
    sizeFilter === "전체"
      ? availableBookings
      : availableBookings.filter((booking) => booking.size === sizeFilter);

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
        <Text style={listStyles.locationText}>서울 성북구</Text>
        <Icon
          name="icon-expand-more"
          size={18}
          width={18}
          height={18}
          color={colors.brown2}
        />
        <Text style={listStyles.nearestText}>현재 위치 기준</Text>
      </View>

      <View style={listStyles.filters}>
        {(["전체", "소형견", "중형견", "대형견"] as const).map((filter) => (
          <Pressable
            accessibilityLabel={filter}
            accessibilityRole="button"
            key={filter}
            onPress={() => setSizeFilter(filter)}
            style={[
              listStyles.filter,
              sizeFilter === filter && listStyles.filterActive,
            ]}
          >
            <Text
              style={[
                listStyles.filterText,
                sizeFilter === filter && listStyles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={listStyles.cards}>
        {visibleBookings.map((booking) => {
          const dog = dogs.find((item) => item.id === booking.dogId);
          return (
            <Pressable
              accessibilityLabel={`${dog?.name ?? ""} 산책 예약 상세`}
              accessibilityRole="button"
              key={booking.dogId}
              onPress={() => router.push("/7-3")}
              style={listStyles.card}
            >
              <View style={listStyles.profileRow}>
                <Image
                  accessible={false}
                  resizeMode="cover"
                  source={dog?.image}
                  style={listStyles.dogImage}
                />
                <View style={listStyles.profileText}>
                  <View style={listStyles.nameRow}>
                    <Text style={listStyles.dogName}>{dog?.name}</Text>
                    <View style={listStyles.sizeBadge}>
                      <Text style={listStyles.sizeBadgeText}>{booking.size}</Text>
                    </View>
                  </View>
                  <Text style={listStyles.shelterText}>
                    {booking.shelterName} · {booking.district}
                  </Text>
                  <View style={listStyles.durationRow}>
                    <Icon
                      name="icon-schedule"
                      size={14}
                      width={14}
                      height={14}
                      color={colors.brown}
                    />
                    <Text style={listStyles.durationText}>
                      최대 산책 시간 {booking.maxWalkMinutes}m
                    </Text>
                  </View>
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
                    <Text style={listStyles.rating}>{booking.rating.toFixed(1)}</Text>
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
                  {booking.schedules.map((schedule) => (
                    <View key={`${schedule.date}-${schedule.time}`} style={listStyles.scheduleRow}>
                      <Text style={listStyles.scheduleDate}>{schedule.date}</Text>
                      <Text style={listStyles.scheduleTime}>{schedule.time}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityLabel="더보기"
        accessibilityRole="button"
        onPress={() => console.log("더보기 tapped")}
        style={listStyles.moreButton}
      >
        <Text style={listStyles.moreText}>더보기</Text>
      </Pressable>

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
