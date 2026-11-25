import { useCallback, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import HomeDecoCircle from "../../assets/icons/home-deco-circle.svg";
import HomeCtaBgBooking from "../../assets/icons/home-cta-bg-booking.svg";
import HomeCtaBgStart from "../../assets/icons/home-cta-bg-start.svg";
import HomeCtaDotBottom from "../../assets/icons/home-cta-dot-bottom.svg";
import HomeCtaDotTop from "../../assets/icons/home-cta-dot-top.svg";
import HomeCtaGradBooking from "../../assets/icons/home-cta-grad-booking.svg";
import HomeCtaGradStart from "../../assets/icons/home-cta-grad-start.svg";
import HomeBookingCard from "../../assets/icons/home-booking-card.svg";
import HomeStatusPill from "../../assets/icons/home-status-pill.svg";
import { Icon } from "../../components/Icon";
import { GradientView } from "../../components/GradientView";
import { Screen } from "../../components/Screen";
import { fetchMe, routeForOnboarding } from "../../api/auth";
import { HOME_STATUS_LABELS } from "../../api/bookingCodes";
import { setStartableRequest } from "../../api/bookingDraft";
import { errorMessage } from "../../api/errorMessages";
import { fetchMyWalkRequests, type MyWalkRequest } from "../../api/walkRequests";
import {
  fetchActiveWalk,
  fetchWalkHistory,
  type WalkHistoryItem,
} from "../../api/walks";
import {
  formatHomeDate,
  formatMonthDay,
  formatSlotDate,
  formatSlotTime,
} from "../../utils/kst";
import { colors, radii, shadows, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import {
  gradientCardCream,
  gradientHomeBookingCta,
  gradientHomeBookingStatus,
} from "../../theme/gradients";

const homeBookingDog = require("../../assets/images/home-booking-dog.png");
const homeStartDog = require("../../assets/images/home-start-dog.png");

type Section<T> =
  | { state: "loading" }
  | { state: "error"; code: string | null }
  | { state: "ready"; data: T };

// 아직 끝나지 않은 승인 예약 중 가장 빠른 것, 없으면 승인 대기 중 가장 빠른 것.
function pickHomeBooking(requests: MyWalkRequest[]): MyWalkRequest | null {
  const now = Date.now();
  const soonest = (status: MyWalkRequest["display_status"]) =>
    requests
      .filter(
        (request) =>
          request.display_status === status &&
          Date.parse(request.requested_end_at) > now,
      )
      .sort(
        (a, b) =>
          Date.parse(a.requested_start_at) - Date.parse(b.requested_start_at),
      )[0];
  return soonest("APPROVED") ?? soonest("PENDING") ?? null;
}

// 거리는 Decimal이라 문자열로 올 수 있다. "2.4km", 모르면 "-".
function formatDistance(meters: string | number | null): string {
  const value = meters === null ? Number.NaN : Number(meters);
  if (!Number.isFinite(value)) return "-";
  return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}km`;
}

export default function HomeScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState<string | null>(null);
  const [booking, setBooking] = useState<Section<MyWalkRequest | null>>({ state: "loading" });
  const [records, setRecords] = useState<Section<WalkHistoryItem[]>>({ state: "loading" });
  const startingRef = useRef(false);
  const homeBooking = booking.state === "ready" ? booking.data : null;

  const load = useCallback(async () => {
    const [me, requests, history] = await Promise.all([
      fetchMe(),
      fetchMyWalkRequests({ limit: 20 }),
      fetchWalkHistory(3),
    ]);
    // 어느 호출이든 401이면 클라이언트가 토큰을 지운 뒤이므로 로그인으로 보낸다.
    if ([me, requests, history].some((result) => !result.ok && result.status === 401)) {
      router.replace("/1-2");
      return;
    }
    if (me.ok) {
      // 온보딩이 끝나지 않은 계정은 서버의 현재 단계로 보낸다.
      const target = routeForOnboarding(me.data);
      if (target && target !== "/3") {
        router.replace(target);
        return;
      }
      setNickname(me.data.nickname);
    }
    setBooking(
      requests.ok
        ? { state: "ready", data: pickHomeBooking(requests.data) }
        : { state: "error", code: requests.code },
    );
    setRecords(
      history.ok
        ? { state: "ready", data: history.data.walks }
        : { state: "error", code: history.code },
    );
  }, [router]);

  // 예약하고 돌아오거나 산책을 마치고 돌아올 때마다 다시 불러온다.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const startWalk = async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    try {
      // 진행 중인 산책이 있으면 그 산책으로, 없으면(404) 시작할 수 있는 예약을 찾는다.
      const active = await fetchActiveWalk();
      if (active.ok) {
        router.push("/5-1");
        return;
      }
      if (active.status === 401) {
        router.replace("/1-2");
        return;
      }
      if (active.status !== 404) {
        Alert.alert("알림", errorMessage(active.code));
        return;
      }
      const startable = await fetchMyWalkRequests({ startableOnly: true, limit: 1 });
      if (!startable.ok) {
        if (startable.status === 401) router.replace("/1-2");
        else Alert.alert("알림", errorMessage(startable.code));
        return;
      }
      const request = startable.data[0];
      if (!request) {
        Alert.alert("안내", "지금 시작할 수 있는 예약이 없어요.");
        return;
      }
      setStartableRequest(request);
      router.push("/4-1");
    } finally {
      startingRef.current = false;
    }
  };

  return (
    <Screen
      backgroundColor={colors.white}
      contentContainerStyle={styles.scrollContent}
      alwaysBounceVertical={false}
      bounces={false}
      scroll
      safeAreaEdges={[]}
      testID="screen-3"
    >
      <View style={styles.root}>
        <HomeDecoCircle
          pointerEvents="none"
          style={styles.backgroundAsset}
        />

        <View style={styles.contentFrame}>
          <View style={styles.header}>
            <Text style={styles.greeting}>
              <Text style={styles.greetingRegular}>Hello,</Text>
              {nickname ? (
                <Text style={styles.greetingBold}> {nickname}!</Text>
              ) : null}
            </Text>
            <Text style={styles.date}>{formatHomeDate()}</Text>
            <Pressable
              accessibilityLabel="마이페이지"
              accessibilityRole="button"
              onPress={() => router.push("/10-1")}
              style={styles.profileButton}
            >
              <Icon
                name="icon-profile"
                size={30}
                width={30}
                height={30}
                color={colors.brown2}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.ctaSection}>
          <View style={styles.ctaFrame}>
            <Pressable
              accessibilityLabel="산책 예약하개"
              accessibilityRole="button"
              onPress={() => router.push("/7-1")}
              style={[styles.ctaCard, styles.ctaTopCard]}
            >
              <HomeCtaBgBooking
                height={106.752}
                preserveAspectRatio="none"
                style={styles.ctaBackground}
                width={322}
              />
              <GradientView
                token={gradientHomeBookingCta}
                style={styles.ctaGradBooking}
              />
              <HomeCtaDotTop
                height={14}
                preserveAspectRatio="none"
                style={styles.ctaDotTop}
                width={14}
              />
              <View style={styles.ctaTextFrame}>
                <Text style={styles.ctaTitle}>산책 예약하개</Text>
                <Text style={styles.ctaSubtitleTop}>
                  Meet your walking buddy :)
                </Text>
              </View>
              <View style={styles.ctaDogTopFrame}>
                <Image
                  accessible={false}
                  resizeMode="contain"
                  source={homeBookingDog}
                  style={styles.ctaDogTop}
                />
              </View>
            </Pressable>

            <Pressable
              accessibilityLabel="산책 시작하개"
              accessibilityRole="button"
              onPress={() => void startWalk()}
              style={[styles.ctaCard, styles.ctaBottomCard]}
            >
              <HomeCtaBgStart
                height={107}
                preserveAspectRatio="none"
                style={styles.ctaBackground}
                width={322}
              />
              <GradientView
                token={gradientHomeBookingCta}
                style={styles.ctaGradStart}
              />
              <HomeCtaDotBottom
                height={14}
                preserveAspectRatio="none"
                style={styles.ctaDotBottom}
                width={14}
              />
              <View style={styles.ctaTextBottomFrame}>
                <Text style={styles.ctaTitle}>산책 시작하개</Text>
                <Text style={styles.ctaSubtitleBottom}>
                  Let&apos;s go for a walk :)
                </Text>
              </View>
              <View style={styles.ctaDogBottomFrame}>
                <Image
                  accessible={false}
                  resizeMode="contain"
                  source={homeStartDog}
                  style={styles.ctaDogBottom}
                />
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.contentFrame}>
          <View style={styles.bookingSection}>
            <Text style={styles.sectionTitle}>내 예약 현황</Text>
            <Pressable
              accessibilityLabel="내 예약 현황 전체 보기"
              accessibilityRole="button"
              onPress={() => router.push("/8-1")}
              style={styles.viewAllBooking}
            >
              <Text style={styles.viewAllText}>전체 보기 </Text>
              <Icon
                name="vector-next"
                size={24}
                width={6.90728}
                height={11.8411}
                color={colors.brown2}
              />
            </Pressable>

            <Pressable
              accessibilityLabel="예약 상세"
              accessibilityRole="button"
              onPress={() => {
                // 상세 화면(8-3~8-5)은 6단계에서 서버 예약으로 연결한다. 그 전에는 목록으로 보낸다.
                if (booking.state === "error") void load();
                else router.push("/8-1");
              }}
              style={styles.bookingCard}
            >
              <GradientView
                token={gradientCardCream}
                style={styles.bookingCardBackground}
              />
              <Text style={styles.bookingDogName}>
                {homeBooking
                  ? `${homeBooking.dog.name}와 산책`
                  : booking.state === "ready"
                    ? "예약이 없어요"
                    : booking.state === "error"
                      ? "예약을 불러오지 못했어요"
                      : ""}
              </Text>
              {booking.state === "ready" ? (
                <View style={styles.bookingStatus}>
                  <GradientView
                    token={gradientHomeBookingStatus}
                    style={styles.bookingStatusBackground}
                  />
                  <Text style={styles.bookingStatusText}>
                    {homeBooking
                      ? HOME_STATUS_LABELS[homeBooking.display_status]
                      : "예약 없음"}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.bookingDate}>
                {homeBooking
                  ? `${formatSlotDate(homeBooking.requested_start_at)} · ${formatSlotTime(homeBooking.requested_start_at, homeBooking.requested_end_at)}`
                  : booking.state === "ready"
                    ? "산책을 신청해 보세요"
                    : booking.state === "error"
                      ? "눌러서 다시 시도해 주세요"
                      : ""}
              </Text>
              <View style={styles.bookingLocation}>
                <Icon
                  name="icon-location"
                  size={14}
                  width={10}
                  height={14}
                  color={colors.mildLightBrown}
                />
                <Text style={styles.bookingPlace}>{homeBooking?.shelter_name ?? ""}</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.recordsSection}>
            <Text style={styles.recordsTitle}>지난 산책 기록</Text>
            <Pressable
              accessibilityLabel="지난 산책 기록 전체 보기"
              accessibilityRole="button"
              onPress={() => router.push("/9-1")}
              style={styles.viewAllRecords}
            >
              <Text style={styles.viewAllText}>전체 보기 </Text>
              <Icon
                name="vector-next"
                size={24}
                width={6.90728}
                height={11.8411}
                color={colors.brown2}
              />
            </Pressable>

            {records.state === "ready" && records.data.length === 0 ? (
              <Text style={styles.recordsEmpty}>아직 산책 기록이 없어요</Text>
            ) : null}
            {records.state === "error" ? (
              <Text style={styles.recordsEmpty}>
                {errorMessage(records.code)}
              </Text>
            ) : null}

            {(records.state === "ready" ? records.data : []).map((record, index) => (
              <View
                key={record.walk_id}
                style={[
                  styles.recordRow,
                  { top: 28 + index * 76 },
                ]}
              >
                <Text style={styles.recordName}>{`${record.dog.name}와 산책`}</Text>
                <Text style={styles.recordDate}>{formatMonthDay(record.started_at)}</Text>
                <View style={styles.recordLocation}>
                  <Icon
                    name="icon-location"
                    size={14}
                    width={10}
                    height={14}
                    color={colors.mildLightBrown}
                  />
                  <Text style={styles.recordPlace}>{record.shelter_name ?? ""}</Text>
                </View>
                <Text style={styles.recordDistance}>{formatDistance(record.total_distance_m)}</Text>
                {index < 2 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  root: {
    alignSelf: "center",
    backgroundColor: colors.white,
    height: 1133,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  backgroundAsset: {
    height: 340,
    left: 127,
    position: "absolute",
    top: -126,
    width: 340,
  },
  contentFrame: {
    alignSelf: "center",
    height: 1133,
    position: "absolute",
    width: 375,
  },
  header: {
    height: 57,
    left: 0,
    position: "absolute",
    top: 51,
    width: 375,
  },
  greeting: {
    fontSize: 30,
    left: 26,
    lineHeight: 37.5,
    position: "absolute",
  },
  greetingRegular: {
    color: colors.brown3,
    fontFamily: fontFamilies.notoSansKRRegular,
  },
  greetingBold: {
    color: colors.brown3,
    fontFamily: fontFamilies.notoSansKRBold,
  },
  date: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 14,
    left: 26,
    letterSpacing: -0.42,
    lineHeight: 17.5,
    position: "absolute",
    top: 43,
  },
  profileButton: {
    alignItems: "center",
    height: 30,
    justifyContent: "center",
    position: "absolute",
    right: 39,
    top: 4,
    width: 30,
  },
  ctaSection: {
    alignSelf: "center",
    backgroundColor: colors.white,
    borderRadius: 30,
    elevation: 8,
    height: 292,
    position: "absolute",
    shadowColor: shadows.homeCard.color,
    shadowOffset: {
      width: shadows.homeCard.offsetX,
      height: shadows.homeCard.offsetY,
    },
    shadowOpacity: 1,
    shadowRadius: shadows.homeCard.blurRadius,
    top: 143,
    width: "100%",
  },
  ctaFrame: {
    alignSelf: "center",
    height: 292,
    position: "relative",
    width: 375,
  },
  ctaCard: {
    borderRadius: 28,
    height: 107,
    left: 27,
    overflow: "hidden",
    position: "absolute",
    width: 322,
  },
  ctaTopCard: {
    top: 23,
  },
  ctaBottomCard: {
    top: 150,
  },
  ctaBackground: {
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  ctaGradBooking: {
    height: 107,
    right: 0,
    position: "absolute",
    top: 0,
    width: 90,
  },
  ctaGradStart: {
    height: 107,
    right: 0,
    position: "absolute",
    top: 0,
    width: 89,
  },
  ctaDotTop: {
    left: 220,
    position: "absolute",
    top: 9,
  },
  ctaDotBottom: {
    left: 220,
    position: "absolute",
    top: 10,
  },
  ctaTextFrame: {
    left: 22,
    position: "absolute",
    top: 33,
  },
  ctaTextBottomFrame: {
    left: 22,
    position: "absolute",
    top: 31,
  },
  ctaTitle: {
    color: colors.brown3,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 23,
    letterSpacing: -1.15,
    lineHeight: 27.6,
  },
  ctaSubtitleTop: {
    color: colors.mildBrown,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 13,
    letterSpacing: -0.13,
    lineHeight: 19.5,
  },
  ctaSubtitleBottom: {
    color: colors.brown2,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 13,
    letterSpacing: -0.13,
    lineHeight: 19.5,
  },
  ctaDogTopFrame: {
    height: 86,
    position: "absolute",
    right: 5,
    top: 16,
    width: 92,
  },
  ctaDogTop: {
    height: 86,
    width: 92,
  },
  ctaDogBottomFrame: {
    height: 64,
    position: "absolute",
    right: 5,
    top: 31,
    width: 91,
  },
  ctaDogBottom: {
    height: 64,
    width: 91,
  },
  bookingSection: {
    height: 162,
    left: 24,
    position: "absolute",
    top: 464,
    width: 325,
  },
  sectionTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 20,
    letterSpacing: -1,
    lineHeight: 28,
  },
  viewAllBooking: {
    alignItems: "center",
    flexDirection: "row",
    height: 20,
    position: "absolute",
    right: 0,
    top: 4,
  },
  viewAllText: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 14,
    letterSpacing: -0.14,
    lineHeight: 20,
  },
  bookingCard: {
    borderRadius: radii.card,
    height: 116,
    left: -1,
    overflow: "hidden",
    position: "absolute",
    top: 33,
    width: 329,
  },
  bookingCardBackground: {
    height: 116,
    left: 0,
    position: "absolute",
    top: 0,
    width: 329,
  },
  bookingDogName: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 20,
    left: 16,
    lineHeight: 25,
    position: "absolute",
    top: 21,
  },
  bookingStatus: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 13,
    height: 26,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    top: 21,
    width: 70,
  },
  bookingStatusBackground: {
    height: 26,
    left: 0,
    position: "absolute",
    top: 0,
    width: 70,
  },
  bookingStatusText: {
    color: colors.orange3,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 12,
    letterSpacing: -0.6,
  },
  bookingDate: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 15,
    left: 16,
    lineHeight: 25,
    position: "absolute",
    top: 50,
  },
  bookingLocation: {
    alignItems: "center",
    flexDirection: "row",
    left: 16,
    position: "absolute",
    top: 78,
  },
  bookingPlace: {
    color: colors.mildLightBrown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 9,
  },
  recordsSection: {
    height: 252,
    left: 27,
    position: "absolute",
    top: 640,
    width: 322,
  },
  recordsTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 20,
    letterSpacing: -1,
    lineHeight: 28,
  },
  viewAllRecords: {
    alignItems: "center",
    flexDirection: "row",
    height: 20,
    position: "absolute",
    right: 0,
    top: 4,
  },
  recordsEmpty: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 14,
    left: 0,
    lineHeight: 20,
    position: "absolute",
    top: 52,
  },
  recordRow: {
    height: 76,
    left: 0,
    position: "absolute",
    width: 322,
  },
  recordName: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
    left: 0,
    lineHeight: 25,
    position: "absolute",
    top: 14,
  },
  recordDate: {
    color: colors.mildLightBrown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 13,
    left: 0,
    lineHeight: 20,
    position: "absolute",
    top: 42,
  },
  recordLocation: {
    alignItems: "center",
    flexDirection: "row",
    left: 64,
    position: "absolute",
    top: 45,
  },
  recordPlace: {
    color: colors.mildLightBrown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 9,
  },
  recordDistance: {
    color: colors.orange,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 25,
    lineHeight: 25,
    position: "absolute",
    right: 0,
    top: 25,
  },
  divider: {
    backgroundColor: colors.outer2,
    bottom: 0,
    height: 1,
    position: "absolute",
    width: 322,
  },
});
