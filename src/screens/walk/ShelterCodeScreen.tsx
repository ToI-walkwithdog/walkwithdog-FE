import { useEffect, useRef, useState } from "react";
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
import type { ApiFailure } from "../../api/client";
import { getStartableRequest } from "../../api/bookingDraft";
import { errorMessage } from "../../api/errorMessages";
import { setSelectedBookingId } from "../../api/myBookings";
import { verifyShelterCode } from "../../api/shelterCodes";
import { setVerifiedRequestId } from "../../api/walkSession";
import { Icon } from "../../components/Icon";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { dogImageSource } from "../../utils/dogImage";
import { formatSlotDate, formatSlotTime } from "../../utils/kst";

// 4-1(입력 전), 4-2(6자리 입력), 4-3(오류)는 같은 화면의 상태다. 처음 상태만 다르다.
export type ShelterCodeScreenState = "idle" | "filled" | "error";

const DEFAULT_ERROR_TEXT = "코드가 맞지 않거나 만료되었어요 :(\n담당자에게 확인 후 다시 입력해 주세요!";

function retryAfterSeconds(failure: ApiFailure): number {
  const data = failure.data as { retry_after_seconds?: unknown } | undefined;
  const seconds = Number(data?.retry_after_seconds);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 60;
}

export default function ShelterCodeScreen({
  initialState = "idle",
}: {
  initialState?: ShelterCodeScreenState;
}) {
  const router = useRouter();
  // 홈이나 예약 상세가 고른 시작 가능한 예약이다. 없으면 홈으로 돌려보낸다.
  const request = getStartableRequest();
  const [code, setCode] = useState("");
  const [state, setState] = useState<ShelterCodeScreenState>(
    initialState === "error" ? "idle" : initialState,
  );
  const [errorText, setErrorText] = useState(DEFAULT_ERROR_TEXT);
  const [submitting, setSubmitting] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!request) router.replace("/3");
  }, [request, router]);

  // 입력이 잠긴 시간이 지나면 다시 누를 수 있게 한다.
  useEffect(() => {
    if (lockedUntil === null) return;
    const timer = setTimeout(
      () => setLockedUntil(null),
      Math.max(0, lockedUntil - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [lockedUntil]);

  if (!request) return null;
  const locked = lockedUntil !== null;
  const source = dogImageSource(request.dog.image_url);

  const onCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    setState(digits.length === 6 ? "filled" : "idle");
  };

  const showError = (text: string) => {
    setErrorText(text);
    setState("error");
  };

  const handleFailure = async (failure: ApiFailure) => {
    const route = await routeForFailure(failure);
    if (route) {
      router.replace(route);
      return;
    }
    switch (failure.code) {
      case "SHELTER_CODE_INVALID":
      case "INVALID_SHELTER_CODE_FORMAT":
        showError(DEFAULT_ERROR_TEXT);
        return;
      case "SHELTER_CODE_RATE_LIMITED": {
        const seconds = retryAfterSeconds(failure);
        setLockedUntil(Date.now() + seconds * 1000);
        showError(
          `${errorMessage(failure.code)}\n${Math.ceil(seconds / 60)}분 뒤에 다시 시도할 수 있어요.`,
        );
        return;
      }
      case "WALK_REQUEST_NOT_ELIGIBLE":
      case "WALK_REQUEST_NOT_FOUND":
      case "WALK_REQUEST_NOT_ALLOWED":
        // 코드를 쓸 수 없는 예약이다. 예약 목록에서 상태를 확인하게 한다.
        Alert.alert("알림", errorMessage(failure.code), [
          { text: "확인", onPress: () => router.replace("/8-1") },
        ]);
        return;
      default:
        // 네트워크 오류, 시간 초과, WALK_REQUEST_RETRYABLE은 같은 코드로 다시 누르면 된다.
        Alert.alert("알림", errorMessage(failure.code));
    }
  };

  const submitCode = async () => {
    if (code.length !== 6 || submittingRef.current || locked) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const result = await verifyShelterCode(request.id, code);
      if (result.ok) {
        setVerifiedRequestId(request.id);
        router.replace("/4-4");
        return;
      }
      await handleFailure(result);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-4-1"
    >
      <View style={styles.root}>
        <View style={styles.contentFrame}>
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
                width={11.1563}
                height={17.7662}
                color={colors.brown}
              />
            </Pressable>
            <Text style={styles.headerTitle}>보호소 코드 입력</Text>
          </View>

          <Text style={styles.description}>
            안전 교육과 강아지 인계 후,{"\n"}
            담당자에게 받은 6자리 코드를 입력해 주세요!
          </Text>

          <GradientView token={gradientCardCream} style={styles.walkCard}>
            {source ? (
              <Image
                accessible={false}
                resizeMode="cover"
                source={source}
                style={styles.dogImage}
              />
            ) : (
              <View style={[styles.dogImage, styles.dogImageEmpty]}>
                <Icon name="icon-dog" size={28} width={28} height={28} color={colors.brown2} />
              </View>
            )}
            <View style={styles.walkCardText}>
              <Text style={styles.walkCardTitle}>
                {request.dog.name}
                {request.shelter_name ? ` · ${request.shelter_name}` : ""}
              </Text>
              <Text style={styles.walkCardMeta}>
                {formatSlotDate(request.requested_start_at)} ·{" "}
                {formatSlotTime(request.requested_start_at, request.requested_end_at)}
              </Text>
            </View>
          </GradientView>

          <View style={styles.codeSection}>
            <Text style={styles.codeLabel}>보호소 발급 코드</Text>
            <PillTextInput
              accessibilityLabel="보호소 발급 코드"
              autoCapitalize="none"
              borderColor={
                state === "error"
                  ? "#FADADD"
                  : state === "filled"
                    ? colors.cream
                    : "#FDF3E7"
              }
              borderRadius={radii.card}
              fontFamily={fontFamilies.nanumSquareRoundExtraBold}
              fontSize={27}
              height={75}
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={onCodeChange}
              paddingHorizontal={18}
              placeholder="—  —  —  —  —  —"
              placeholderColor={colors.brown}
              style={[
                styles.codeInput,
                state === "error"
                  ? styles.codeInputError
                  : state === "filled"
                    ? styles.codeInputFilled
                    : styles.codeInputIdle,
              ]}
              textAlign="center"
              textColor={colors.brown}
              value={code}
            />
            {state === "idle" ? (
              <Text style={styles.codeHint}>
                *코드는 예약 당일 보호소에서 안내해 드려요!
              </Text>
            ) : state === "filled" ? (
              <Text style={styles.codeHint}>
                6자리를 입력했어요! 확인하고 출발하세요 :)
              </Text>
            ) : (
              <Text style={styles.errorHint}>{errorText}</Text>
            )}
          </View>

          <View
            style={[
              styles.noticeCard,
              state === "error" ? styles.noticeCardError : null,
            ]}
          >
            <Text style={styles.noticeText}>
              코드는 발급 후 10분 안에 입력해 주세요.{"\n"}
              여러 번 틀리면 잠시 입력할 수 없어요.
            </Text>
          </View>
        </View>

        <View style={styles.bottomActions}>
          {state === "filled" ? (
            <GradientView token={gradientButtonWarm} style={styles.primaryAction}>
              <Pressable
                accessibilityLabel="확인하고 시작하개!"
                accessibilityRole="button"
                accessibilityState={{ disabled: submitting || locked }}
                disabled={submitting || locked}
                onPress={() => void submitCode()}
                style={[styles.primaryPressable, (submitting || locked) && styles.disabledAction]}
              >
                <Text style={styles.primaryActionText}>
                  {submitting ? "확인 중..." : "확인하고 시작하개!"}
                </Text>
              </Pressable>
            </GradientView>
          ) : (
          <Pressable
            accessibilityLabel={
              state === "error" ? "코드 다시 입력하기" : "코드 확인 후 산책 시작"
            }
            accessibilityRole="button"
            disabled={submitting}
            onPress={state === "error" ? () => {
              setCode("");
              setState("idle");
            } : () => void submitCode()}
            style={[
              styles.primaryAction,
              state === "error" ? styles.primaryError : styles.primaryIdle,
            ]}
          >
            <Text style={styles.primaryActionText}>
              {state === "error" ? "코드 다시 입력하기" : "코드 확인 후 산책 시작"}
            </Text>
          </Pressable>
          )}
          <Pressable
            accessibilityLabel="예약 상세 보기"
            accessibilityRole="button"
            disabled={submitting}
            onPress={() => {
              setSelectedBookingId(request.id);
              router.push("/8-3");
            }}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryActionText}>예약 상세 보기</Text>
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
  contentFrame: {
    alignSelf: "center",
    flex: 1,
    width: 375,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 36,
    left: 20,
    position: "absolute",
    top: 20,
    width: 335,
  },
  backButton: {
    alignItems: "center",
    height: 29,
    justifyContent: "center",
    width: 29,
  },
  headerTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.largeTitle,
    lineHeight: 36.25,
    marginLeft: 8,
  },
  description: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.bodyLarge,
    left: 20,
    lineHeight: 21.75,
    position: "absolute",
    top: 76,
  },
  walkCard: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    flexDirection: "row",
    height: 93,
    left: 20,
    padding: 16,
    position: "absolute",
    top: 127,
    width: 335,
  },
  dogImage: {
    borderRadius: 12,
    height: 68,
    width: 60,
  },
  dogImageEmpty: {
    alignItems: "center",
    backgroundColor: colors.white,
    justifyContent: "center",
  },
  disabledAction: {
    opacity: 0.5,
  },
  walkCardText: {
    marginLeft: 12,
  },
  walkCardTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
    lineHeight: 24.65,
  },
  walkCardMeta: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
    lineHeight: 18.85,
  },
  codeSection: {
    left: 20,
    position: "absolute",
    top: 240,
    width: 335,
  },
  codeLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
    lineHeight: 23.2,
  },
  codeInput: {
    marginTop: 2,
    width: 335,
  },
  codeInputIdle: {
    backgroundColor: colors.white,
  },
  codeInputFilled: {
    backgroundColor: colors.cream,
  },
  codeInputError: {
    backgroundColor: "#FADADD",
  },
  codeHint: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
    marginTop: 15,
  },
  errorHint: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
    marginTop: 15,
  },
  noticeCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    left: 20,
    padding: 16,
    position: "absolute",
    top: 391,
    width: 335,
  },
  noticeCardError: {
    top: 412,
  },
  noticeText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
  },
  bottomActions: {
    alignItems: "center",
    alignSelf: "center",
    bottom: 0,
    height: 142,
    position: "absolute",
    width: 375,
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    width: 335,
  },
  primaryIdle: {
    backgroundColor: colors.cream,
  },
  primaryFilled: {
    backgroundColor: colors.midLightOrange,
  },
  primaryError: {
    backgroundColor: colors.midLightOrange,
  },
  primaryActionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
  primaryPressable: {
    alignItems: "center",
    height: 49,
    justifyContent: "center",
    width: 335,
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    marginTop: 12,
    width: 335,
  },
  secondaryActionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
