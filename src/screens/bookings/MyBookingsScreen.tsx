import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientCardCream } from "../../theme/gradients";
import { colors, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export type MyBookingsScreenState = "list" | "empty";

type BookingStatus = "confirmed" | "pending" | "rejected" | "cancelled";

const BOOKINGS: Array<{
  status: BookingStatus;
  label: string;
  description: string;
}> = [
  {
    status: "confirmed",
    label: "예약 확정",
    description: "보호소 코드를 입력하고 출발해요!",
  },
  {
    status: "pending",
    label: "승인 대기",
    description: "보호소가 신청한 내용을 확인하고 있어요 :)",
  },
  {
    status: "rejected",
    label: "예약 거절",
    description: "거절 사유를 확인해 주세요!",
  },
  {
    status: "cancelled",
    label: "취소 완료",
    description: "거절 사유를 확인해 주세요!",
  },
];

export function MyBookingsScreen({
  state,
}: {
  state: MyBookingsScreenState;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("전체");

  if (state === "empty") {
    return (
      <Screen
        backgroundColor={colors.white}
        safeAreaEdges={[]}
        testID="screen-8-2"
      >
        <View style={styles.emptyRoot}>
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
          <Text style={styles.emptyText}>예약 현황이 없어요.</Text>
        </View>
      </Screen>
    );
  }

  const visibleBookings =
    filter === "전체"
      ? BOOKINGS
      : filter === "승인 대기"
        ? BOOKINGS.filter((booking) => booking.status === "pending")
        : filter === "확정"
          ? BOOKINGS.filter((booking) => booking.status === "confirmed")
          : [];

  return (
    <Screen
      backgroundColor={colors.white}
      contentContainerStyle={styles.scrollContent}
      scroll
      safeAreaEdges={[]}
      testID="screen-8-1"
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

      <Text style={styles.subtitle}>신청부터 확정까지, 여기서 한눈에 봐요.</Text>

      <View style={styles.filters}>
        {["전체", "승인 대기", "확정", "지난 예약"].map((item) => (
          <Pressable
            accessibilityLabel={item}
            accessibilityRole="button"
            key={item}
            onPress={() => setFilter(item)}
            style={[
              styles.filter,
              filter === item && styles.filterActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === item && styles.filterTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.cards}>
        {visibleBookings.map((booking) => (
          <Pressable
            accessibilityLabel={`${booking.label} 예약 상세`}
            accessibilityRole="button"
            key={booking.status}
            onPress={() => {
              if (booking.status === "confirmed") router.push("/8-3");
              if (booking.status === "pending") router.push("/8-4");
              if (booking.status === "rejected") router.push("/8-5");
              if (booking.status === "cancelled") router.push("/8-8");
            }}
            style={styles.cardPressable}
          >
            <GradientView
              token={gradientCardCream}
              style={styles.card}
            >
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>콩이와 산책</Text>
              <Text style={styles.shelterLink}>행복 보호소 ›</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{booking.label}</Text>
              </View>
            </View>
            <Text style={styles.schedule}>11월 12일 · 13:00–14:00</Text>
            <Text style={styles.description}>{booking.description}</Text>
            </GradientView>
          </Pressable>
        ))}
      </View>
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
  emptyRoot: {
    flex: 1,
    width: "100%",
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
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.title,
  },
  shelterLink: {
    color: colors.deepOrange,
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
});
