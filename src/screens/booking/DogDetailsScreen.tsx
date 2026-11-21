import { useState } from "react";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const kongiImage = require("../../assets/images/dog-kongi.png");

export default function DogDetailsScreen() {
  const router = useRouter();
  const [selectedSchedule, setSelectedSchedule] = useState(1);
  const schedules = [
    "11월 12일    13:00–14:00",
    "11월 13일    10:00–11:00",
  ];

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-7-3"
    >
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="뒤로"
            accessibilityRole="button"
            onPress={() => router.replace("/7-2")}
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
          <Text style={styles.headerTitle}>상세 내역</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.dogCard}>
            <Image
              accessible={false}
              resizeMode="cover"
              source={kongiImage}
              style={styles.dogImage}
            />
            <Text style={styles.dogName}>콩이</Text>
            <Text style={styles.dogMeta}>
              소형견 · 행복 보호소 · 서울 성북구
            </Text>
            <View style={styles.dogBadges}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>난이도 3.5</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>최대 30분</Text>
              </View>
            </View>
          </View>

          <View style={styles.features}>
            <Text style={styles.sectionTitle}>콩이의 특징</Text>
            <View style={styles.featureCard}>
              <Text style={styles.featureText}>
                콩이는 체력이 강해 이리저리 뛰어다녀 체력이 약하신 분은 다른 견을 선택해주세요!
              </Text>
            </View>
          </View>

          <View style={styles.scheduleSection}>
            <Text style={styles.sectionTitle}>함께 걸을 일정</Text>
            <Text style={styles.scheduleHint}>
              방문 가능한 시간대예요. 실제 산책은 최대 30분이에요.
            </Text>
            {schedules.map((schedule, index) => (
              <Pressable
                accessibilityLabel={schedule}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedSchedule === index }}
                key={schedule}
                onPress={() => setSelectedSchedule(index)}
                style={[
                  styles.scheduleButton,
                  { top: 52 + index * 56 },
                  selectedSchedule === index
                    ? styles.scheduleButtonSelected
                    : styles.scheduleButtonDefault,
                ]}
              >
                <Text style={styles.scheduleText}>{schedule}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.shelterSection}>
            <Text style={styles.sectionTitle}>행복 보호소</Text>
            <View style={styles.shelterCard}>
              <Text style={styles.shelterAddress}>
                서울 성북구 자세한 주소
              </Text>
              <Text style={styles.shelterHint}>
                예약 확정 후 보호소 안내를 확인해 주세요!
              </Text>
            </View>
          </View>

          <Text style={styles.approvalHint}>
            신청 후 보호소의 승인이 필요해요!{"\n"}
            승인이 완료되기 전에는 방문하지 말아 주세요 :(
          </Text>
        </View>

        <View style={styles.bottomAction}>
          <Pressable
            accessibilityLabel="신청하개"
            accessibilityRole="button"
            onPress={() => router.push("/7-4")}
            style={styles.applyButton}
          >
            <Text style={styles.applyText}>신청하개</Text>
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
  header: {
    alignItems: "center",
    alignSelf: "center",
    height: 56,
    justifyContent: "center",
    width: 375,
  },
  backButton: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    left: 16,
    position: "absolute",
    width: 24,
  },
  headerTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
    lineHeight: 25.2,
  },
  body: {
    alignSelf: "center",
    height: 619,
    paddingHorizontal: 20,
    paddingTop: 12,
    width: 375,
  },
  dogCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    height: 120,
  },
  dogImage: {
    borderRadius: 28,
    height: 91,
    left: 14,
    position: "absolute",
    top: 20,
    width: 91,
  },
  dogName: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.greeting,
    left: 114,
    lineHeight: 43.5,
    position: "absolute",
    top: 14,
  },
  dogMeta: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    left: 114,
    lineHeight: 20.3,
    position: "absolute",
    top: 61,
  },
  dogBadges: {
    flexDirection: "row",
    left: 114,
    position: "absolute",
    top: 86,
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.cardGradientStart,
    borderRadius: 12,
    height: 23,
    justifyContent: "center",
    marginRight: 12,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.small,
  },
  features: {
    height: 110,
    marginTop: 16,
  },
  sectionTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 21.75,
  },
  featureCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    marginTop: 8,
    padding: 16,
  },
  featureText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
  },
  scheduleSection: {
    height: 154,
    marginTop: 16,
  },
  scheduleHint: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
    lineHeight: 18.85,
  },
  scheduleButton: {
    alignItems: "center",
    borderColor: colors.midLightOrange,
    borderRadius: 27,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    position: "absolute",
    width: 335,
  },
  scheduleButtonDefault: {
    backgroundColor: colors.white,
  },
  scheduleButtonSelected: {
    backgroundColor: colors.lightOrange,
  },
  scheduleText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
  },
  shelterSection: {
    height: 105,
    marginTop: 16,
  },
  shelterCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    height: 67,
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 16,
  },
  shelterAddress: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
  },
  shelterHint: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
  },
  approvalHint: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
  },
  bottomAction: {
    alignItems: "center",
    alignSelf: "center",
    height: 61,
    paddingTop: 12,
    width: 375,
  },
  applyButton: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    width: 335,
  },
  applyText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
