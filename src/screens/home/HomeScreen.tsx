import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

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
import { walkRecords } from "../../data/walkRecords";
import { colors, radii, shadows, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import {
  gradientCardCream,
  gradientHomeBookingCta,
  gradientHomeBookingStatus,
} from "../../theme/gradients";

const homeBookingDog = require("../../assets/images/home-booking-dog.png");
const homeStartDog = require("../../assets/images/home-start-dog.png");

export default function HomeScreen() {
  const router = useRouter();

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
              <Text style={styles.greetingBold}> Glow!</Text>
            </Text>
            <Text style={styles.date}>Friday  May 9, 2026</Text>
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
              onPress={() => router.push("/4-1")}
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
              accessibilityLabel="콩이 예약 확정"
              accessibilityRole="button"
              onPress={() => router.push("/8-3")}
              style={styles.bookingCard}
            >
              <GradientView
                token={gradientCardCream}
                style={styles.bookingCardBackground}
              />
              <Text style={styles.bookingDogName}>콩이와 산책</Text>
              <View style={styles.bookingStatus}>
                <GradientView
                  token={gradientHomeBookingStatus}
                  style={styles.bookingStatusBackground}
                />
                <Text style={styles.bookingStatusText}>예약 확정</Text>
              </View>
              <Text style={styles.bookingDate}>5. 12. (화) · 14:00</Text>
              <View style={styles.bookingLocation}>
                <Icon
                  name="icon-location"
                  size={14}
                  width={10}
                  height={14}
                  color={colors.mildLightBrown}
                />
                <Text style={styles.bookingPlace}>행복 보호소</Text>
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

            {walkRecords.slice(0, 3).map((record, index) => (
              <View
                key={record.id}
                style={[
                  styles.recordRow,
                  { top: 28 + index * 76 },
                ]}
              >
                <Text style={styles.recordName}>{record.displayName}</Text>
                <Text style={styles.recordDate}>{record.displayDate}</Text>
                <View style={styles.recordLocation}>
                  <Icon
                    name="icon-location"
                    size={14}
                    width={10}
                    height={14}
                    color={colors.mildLightBrown}
                  />
                  <Text style={styles.recordPlace}>{record.shelterName}</Text>
                </View>
                <Text style={styles.recordDistance}>{record.displayDistance}</Text>
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
