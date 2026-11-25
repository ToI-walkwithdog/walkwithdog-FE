import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { routeForFailure } from "../../api/auth";
import { dogSizeLabel } from "../../api/bookingCodes";
import {
  getSelectedDogId,
  setApplicationTarget,
} from "../../api/bookingDraft";
import { fetchDogAvailability, type AvailableDogDetail } from "../../api/dogs";
import { errorMessage } from "../../api/errorMessages";
import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { dogImageSource } from "../../utils/dogImage";
import { formatSlotDate, formatSlotTime } from "../../utils/kst";

export default function DogDetailsScreen() {
  const router = useRouter();
  const dogId = getSelectedDogId();
  const [dog, setDog] = useState<AvailableDogDetail | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (dogId === null) {
      router.replace("/7-1");
      return;
    }
    let cancelled = false;
    setFailure(null);
    (async () => {
      const result = await fetchDogAvailability(dogId);
      if (cancelled) return;
      if (result.ok) {
        setDog(result.data);
        setSelectedSlotId(result.data.date_slots[0]?.date_slot_id ?? null);
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
  }, [attempt, dogId, router]);

  const selectedSlot =
    dog?.date_slots.find((slot) => slot.date_slot_id === selectedSlotId) ?? null;
  const source = dogImageSource(dog?.image_url);
  const meta = dog
    ? [dogSizeLabel(dog.size_code), dog.shelter.name, dog.shelter.region_name]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <Screen
      backgroundColor={colors.white}
      scroll
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

        {!dog ? (
          <View style={styles.status}>
            <Text style={styles.statusText}>
              {failure ?? "강아지 정보를 불러오고 있어요"}
            </Text>
            {failure ? (
              <>
                <Pressable
                  accessibilityLabel="다시 시도"
                  accessibilityRole="button"
                  onPress={() => setAttempt((count) => count + 1)}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>다시 시도</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="목록으로"
                  accessibilityRole="button"
                  onPress={() => router.replace("/7-1")}
                  style={styles.listButton}
                >
                  <Text style={styles.retryText}>목록으로</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        ) : (
          <>
            <View style={styles.body}>
              <View style={styles.dogCard}>
                {source ? (
                  <Image
                    accessible={false}
                    resizeMode="cover"
                    source={source}
                    style={styles.dogImage}
                  />
                ) : (
                  <View style={[styles.dogImage, styles.dogImageEmpty]}>
                    <Icon
                      name="icon-dog"
                      size={40}
                      width={40}
                      height={40}
                      color={colors.brown2}
                    />
                  </View>
                )}
                <Text style={styles.dogName}>{dog.name}</Text>
                <Text numberOfLines={1} style={styles.dogMeta}>
                  {meta}
                </Text>
                <View style={styles.dogBadges}>
                  {dog.difficulty_score !== null ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        난이도 {dog.difficulty_score}
                      </Text>
                    </View>
                  ) : null}
                  {dog.max_walk_minutes !== null ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        최대 {dog.max_walk_minutes}분
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={styles.features}>
                <Text style={styles.sectionTitle}>{dog.name}의 특징</Text>
                <View style={styles.featureCard}>
                  <Text style={styles.featureText}>
                    {dog.description?.trim() ||
                      "자세한 특징은 보호소에 확인해 주세요."}
                  </Text>
                  {dog.precautions?.trim() ? (
                    <Text style={[styles.featureText, styles.precautions]}>
                      주의사항: {dog.precautions.trim()}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.scheduleSection}>
                <Text style={styles.sectionTitle}>함께 걸을 일정</Text>
                <Text style={styles.scheduleHint}>
                  방문 가능한 시간대예요.
                  {dog.max_walk_minutes !== null
                    ? ` 실제 산책은 최대 ${dog.max_walk_minutes}분이에요.`
                    : ""}
                </Text>
                {dog.date_slots.length === 0 ? (
                  <Text style={styles.noSlots}>
                    지금 신청할 수 있는 일정이 없어요.
                  </Text>
                ) : null}
                {dog.date_slots.map((slot) => {
                  const selected = slot.date_slot_id === selectedSlotId;
                  const label = `${formatSlotDate(slot.starts_at)}    ${formatSlotTime(slot.starts_at, slot.ends_at)}`;
                  return (
                    <Pressable
                      accessibilityLabel={label}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={slot.date_slot_id}
                      onPress={() => setSelectedSlotId(slot.date_slot_id)}
                      style={[
                        styles.scheduleButton,
                        selected
                          ? styles.scheduleButtonSelected
                          : styles.scheduleButtonDefault,
                      ]}
                    >
                      <Text style={styles.scheduleText}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.shelterSection}>
                <Text style={styles.sectionTitle}>{dog.shelter.name}</Text>
                <View style={styles.shelterCard}>
                  <Text style={styles.shelterAddress}>
                    {dog.shelter.region_name
                      ? `${dog.shelter.region_name} · `
                      : ""}
                    자세한 주소는 보호소에 확인해 주세요.
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
                disabled={!selectedSlot}
                onPress={() => {
                  if (!selectedSlot) return;
                  setApplicationTarget({ dog, slot: selectedSlot });
                  router.push("/7-4");
                }}
                style={[styles.applyButton, !selectedSlot && styles.applyDisabled]}
              >
                <Text style={styles.applyText}>신청하개</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 776,
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
  status: {
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 120,
    width: 375,
  },
  statusText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 21.75,
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
  listButton: {
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
  body: {
    alignSelf: "center",
    minHeight: 619,
    paddingBottom: 110,
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
  dogImageEmpty: {
    alignItems: "center",
    backgroundColor: colors.cream,
    justifyContent: "center",
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
    right: 12,
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
  precautions: {
    marginTop: 8,
  },
  scheduleSection: {
    marginTop: 16,
  },
  scheduleHint: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
    lineHeight: 18.85,
  },
  noSlots: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.body,
    marginTop: 12,
  },
  scheduleButton: {
    alignItems: "center",
    borderColor: colors.midLightOrange,
    borderRadius: 27,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    marginTop: 10,
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
    marginTop: 16,
  },
  bottomAction: {
    alignItems: "center",
    alignSelf: "center",
    bottom: 28,
    height: 61,
    paddingTop: 12,
    position: "absolute",
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
  applyDisabled: {
    opacity: 0.4,
  },
  applyText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
