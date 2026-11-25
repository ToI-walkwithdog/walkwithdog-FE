import { useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { errorMessage } from "../../api/errorMessages";
import { getWalkContext } from "../../api/walkSession";
import { getPendingIncident } from "../../api/walkTracker";
import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";
import { sendPendingIncident } from "./walkFlow";

type ReportResultScreenProps = {
  state: "failed" | "done";
};

// 네트워크가 아닌 이유로 거절된 신고(예: 종료 후 신고 가능 시간 초과)는 연결 문구 대신 이유를 보여 준다.
function failureSubtitle(code: string | undefined): string {
  if (!code || code === "NETWORK_ERROR" || code === "TIMEOUT") {
    return "네트워크 연결을 확인해 주세요.\n아직 보호소에 전달되지 않았어요.";
  }
  return `${errorMessage(code)}\n아직 보호소에 전달되지 않았어요.`;
}

export default function ReportResultScreen({ state }: ReportResultScreenProps) {
  const router = useRouter();
  const failed = state === "failed";
  const { report, code } = useLocalSearchParams<{ report?: string; code?: string }>();
  const context = getWalkContext();
  const walkLabel = context ? `${context.dogName}와 산책 중` : "산책 중";
  const [retrying, setRetrying] = useState(false);
  const retryingRef = useRef(false);
  // 보내지 못한 신고가 남아 있어야 다시 전송할 수 있다(처음 만든 키와 본문을 그대로 쓴다).
  const canRetry = failed && getPendingIncident() !== null;

  const backToWalk = () =>
    router.dismissTo({ pathname: "/5-1", params: { closeReport: "1" } });

  const retry = async () => {
    if (retryingRef.current) return;
    retryingRef.current = true;
    setRetrying(true);
    try {
      await sendPendingIncident(router, "replace");
    } finally {
      retryingRef.current = false;
      setRetrying(false);
    }
  };

  const contactShelter = () => {
    const phone = context?.shelterPhone;
    if (!phone) {
      Alert.alert("보호소 연락처", "연락처를 찾을 수 없어요. 예약 상세에서 확인해 주세요.");
      return;
    }
    Alert.alert("보호소 연락처", phone, [
      { text: "닫기", style: "cancel" },
      { text: "전화하기", onPress: () => void Linking.openURL(`tel:${phone}`) },
    ]);
  };

  return (
    <Screen backgroundColor={colors.white} safeAreaEdges={[]} testID={failed ? "screen-5-6" : "screen-5-7"}>
      <View style={styles.root}>
        {failed ? (
          <View style={styles.body}>
            <Icon
              name="icon-error"
              size={60}
              width={60}
              height={60}
              color={colors.orange3}
            />
            <Text style={styles.title}>신고를 보내지 못했어요</Text>
            <Text style={styles.subtitle}>{failureSubtitle(code)}</Text>
            <View style={styles.urgentCard}>
              <Text style={styles.urgentText}>
                긴급한 상황에서는 재전송을 기다리지 말고 보호소에 전화해 주세요.
              </Text>
            </View>
            <GradientView token={gradientCardCream} style={styles.card}>
              <Text style={styles.cardTitle}>
                {report ?? "신고"} · {walkLabel}
              </Text>
              <Text style={styles.cardText}>
                {canRetry
                  ? "작성한 내용은 유지하고 있어요.\n연결이 돌아오면 다시 전송해 주세요."
                  : "산책 화면에서 다시 신고해 주세요."}
              </Text>
            </GradientView>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Pressable
                accessibilityLabel="뒤로"
                accessibilityRole="button"
                onPress={backToWalk}
                style={styles.backButton}
              >
                <Icon name="icon-back" size={24} width={7.41} height={12} color={colors.brown} />
              </Pressable>
              <Text style={styles.headerTitle}>신고 접수 완료</Text>
            </View>
            <View style={styles.doneBody}>
              <Text style={styles.title}>보호소에 신고를 전달했어요</Text>
              <Text style={styles.subtitle}>지금은 강아지와 나의 안전이 가장 중요해요.</Text>
              <GradientView token={gradientCardCream} style={styles.card}>
                <Text style={styles.cardTitle}>{report ?? "신고"} 신고</Text>
                <Text style={styles.cardText}>
                  {context ? `${context.dogName} · ${context.shelterName}` : "산책 중"}
                </Text>
                <Text style={styles.cardNote}>신고 내용 전달 완료</Text>
              </GradientView>
              <Text style={styles.sectionTitle}>이렇게 기다려 주세요</Text>
              <View style={styles.waitCard}>
                <Text style={styles.waitText}>
                  안전한 곳에서 멈춰 아래 보호소 연락처를{"\n"}
                  확인하여 전화로 위치와 상황을 전달해 주세요!
                </Text>
              </View>
              <Text style={styles.noticeText}>
                신고 접수는 응급조치를 대신하지 않아요!{"\n"}
                강아지를 혼자 두지 말아 주세요!
              </Text>
            </View>
          </>
        )}
        <View style={styles.actions}>
          <GradientView token={gradientButtonWarm} style={styles.primary}>
            <Pressable
              accessibilityLabel={failed ? "다시 전송하기" : "보호소 연락처 확인"}
              accessibilityRole="button"
              accessibilityState={{ disabled: retrying }}
              disabled={retrying}
              onPress={failed ? (canRetry ? () => void retry() : backToWalk) : contactShelter}
              style={[styles.primaryPressable, retrying && styles.disabledAction]}
            >
              <Text style={styles.primaryText}>
                {failed
                  ? retrying
                    ? "전송 중..."
                    : canRetry
                      ? "다시 전송하기"
                      : "산책 화면으로"
                  : "보호소 연락처 확인"}
              </Text>
            </Pressable>
          </GradientView>
          <Pressable
            accessibilityLabel={failed ? "보호소 연락처 확인" : "산책 화면으로"}
            accessibilityRole="button"
            disabled={retrying}
            onPress={failed ? contactShelter : backToWalk}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>
              {failed ? "보호소 연락처 확인" : "산책 화면으로"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  primaryPressable: { alignItems: "center", height: 49, justifyContent: "center", width: 335 },
  disabledAction: { opacity: 0.5 },
  root: { flex: 1, width: "100%" },
  header: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    height: 56,
    paddingHorizontal: 16,
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
    marginLeft: 12,
  },
  body: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 29,
    width: 375,
  },
  doneBody: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    width: 375,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 27,
    lineHeight: 39,
    marginTop: 12,
  },
  subtitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.subtitle,
  },
  urgentCard: {
    backgroundColor: "#FADADD",
    borderRadius: radii.card,
    marginTop: 20,
    padding: 16,
  },
  urgentText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    lineHeight: 20.3,
  },
  card: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    marginTop: 20,
    padding: 18,
  },
  cardTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 20,
  },
  cardText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 6,
  },
  cardNote: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 20,
    marginTop: 24,
  },
  waitCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    marginTop: 10,
    padding: 16,
  },
  waitText: {
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
    marginTop: 16,
  },
  actions: {
    alignSelf: "center",
    bottom: 28,
    position: "absolute",
    width: 335,
  },
  primary: {
    alignItems: "center",
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
  },
  primaryText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
  secondary: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    marginTop: 12,
  },
  secondaryText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
