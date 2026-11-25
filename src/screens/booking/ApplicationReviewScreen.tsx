import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { fetchMe, routeForFailure } from "../../api/auth";
import {
  applicationKeyFor,
  clearApplicationKey,
  getApplicationTarget,
  setSubmittedApplication,
} from "../../api/bookingDraft";
import { errorMessage } from "../../api/errorMessages";
import { newUuid } from "../../api/uuid";
import { createWalkRequest } from "../../api/walkRequests";
import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { dogImageSource } from "../../utils/dogImage";
import { formatSlotDate, formatSlotTime } from "../../utils/kst";

export default function ApplicationReviewScreen() {
  const router = useRouter();
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const target = getApplicationTarget();

  // 화면에 들어올 때 한 번 정한다. 같은 강아지와 일정이면 다시 들어와도 같은 키다.
  const [idempotencyKey] = useState(() =>
    target
      ? applicationKeyFor(target.dog.dog_id, target.slot.date_slot_id, newUuid)
      : "",
  );

  useEffect(() => {
    if (!target) router.replace("/7-2");
  }, [router, target]);

  useEffect(() => {
    let cancelled = false;
    void fetchMe().then((result) => {
      if (!cancelled && result.ok) setNickname(result.data.nickname);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!target) return null;
  const { dog, slot } = target;
  const source = dogImageSource(dog.image_url);

  const submit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const result = await createWalkRequest(
        {
          dog_id: dog.dog_id,
          date_slot_id: slot.date_slot_id,
          requested_start_at: slot.starts_at,
          requested_end_at: slot.ends_at,
        },
        idempotencyKey,
      );
      if (result.ok) {
        clearApplicationKey();
        setSubmittedApplication({
          receipt: result.data,
          dogName: dog.name,
          imageUrl: dog.image_url,
          shelterName: dog.shelter.name,
        });
        router.replace("/7-5");
        return;
      }
      const route = await routeForFailure(result);
      if (route) {
        router.replace(route);
        return;
      }
      if (
        result.code === "WALK_SLOT_CHANGED" ||
        result.code === "WALK_SLOT_UNAVAILABLE" ||
        result.code === "WALK_DOG_NOT_AVAILABLE"
      ) {
        // 일정이 달라졌으니 같은 키를 쓰지 않고, 상세를 다시 불러와 일정을 고르게 한다.
        clearApplicationKey();
        Alert.alert("알림", errorMessage(result.code), [
          { text: "확인", onPress: () => router.replace("/7-3") },
        ]);
        return;
      }
      // 네트워크 오류, 시간 초과, WALK_REQUEST_RETRYABLE은 같은 키로 다시 누르면 된다.
      Alert.alert("알림", errorMessage(result.code));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-7-4"
    >
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="뒤로"
            accessibilityRole="button"
            onPress={() => router.replace("/7-3")}
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
          <Text style={styles.headerTitle}>예약 확인</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>신청 내용을 확인해 주세요</Text>
          <Text style={styles.subtitle}>{dog.name}와의 만남을 준비해요 :)</Text>

          <GradientView token={gradientCardCream} style={styles.bookingCard}>
            <View style={styles.dogRow}>
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
                    size={28}
                    width={28}
                    height={28}
                    color={colors.brown2}
                  />
                </View>
              )}
              <View>
                <Text style={styles.dogName}>{dog.name}</Text>
                <Text style={styles.shelterName}>{dog.shelter.name}</Text>
              </View>
            </View>
            <Text style={styles.schedule}>
              {formatSlotDate(slot.starts_at)} ·{" "}
              {formatSlotTime(slot.starts_at, slot.ends_at)}
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>예약 번호</Text>
              <Text style={styles.infoValue}>신청 후 확인</Text>
            </View>
            {dog.max_walk_minutes !== null ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>산책 시간</Text>
                <Text style={styles.infoValue}>최대 {dog.max_walk_minutes}분</Text>
              </View>
            ) : null}
          </GradientView>

          <View style={styles.applicantCard}>
            <Text style={styles.applicantTitle}>신청자 정보</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>신청자</Text>
              <Text style={styles.infoValue}>
                {nickname ? `${nickname} 님` : "-"}
              </Text>
            </View>
            <Text style={styles.applicantHint}>
              연락처 변경은 내 정보 수정에서 할 수 있어요.
            </Text>
          </View>

          <Text style={styles.noticeText}>
            방문 전 사전 교육과 준비물 안내를 확인해 주세요!{"\n"}
            승인이 완료되기 전에는 방문하지 말아 주세요.
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <GradientView token={gradientButtonWarm} style={styles.primaryAction}>
          <Pressable
            accessibilityLabel="예약 신청하개"
            accessibilityRole="button"
            disabled={submitting}
            onPress={() => void submit()}
            style={styles.primaryPressable}
          >
            <Text style={styles.primaryActionText}>
              {submitting ? "신청 중..." : "예약 신청하개"}
            </Text>
          </Pressable>
          </GradientView>
          <Pressable
            accessibilityLabel="일정 다시 선택"
            accessibilityRole="button"
            disabled={submitting}
            onPress={() => router.replace("/7-3")}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryActionText}>일정 다시 선택</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  primaryPressable: { alignItems: "center", height: 49, justifyContent: "center", width: 335 },
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
  },
  body: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    width: 375,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.largeTitle,
    lineHeight: 36.25,
  },
  subtitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 21.75,
  },
  bookingCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: radii.card,
    height: 183,
    justifyContent: "center",
    marginTop: 15,
    padding: 16,
  },
  dogRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  dogImage: {
    borderRadius: 14,
    height: 72,
    marginRight: 12,
    width: 64,
  },
  dogImageEmpty: {
    alignItems: "center",
    backgroundColor: colors.cream,
    justifyContent: "center",
  },
  dogName: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 23,
  },
  shelterName: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
  },
  schedule: {
    color: colors.brown3,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
    marginTop: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  infoLabel: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
  },
  infoValue: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.body,
  },
  applicantCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    marginTop: 15,
    padding: 16,
  },
  applicantTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
  },
  applicantHint: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
  },
  noticeText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
    marginTop: 15,
  },
  bottomActions: {
    alignSelf: "center",
    bottom: 28,
    position: "absolute",
    width: 335,
  },
  primaryAction: {
    alignItems: "center",
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
  },
  primaryActionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    marginTop: 12,
  },
  secondaryActionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
