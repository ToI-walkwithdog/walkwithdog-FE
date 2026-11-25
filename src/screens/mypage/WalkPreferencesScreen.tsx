import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { routeForFailure } from "../../api/auth";
import { DOG_SIZE_LABELS, type DogSizeCode } from "../../api/bookingCodes";
import type { ApiFailure } from "../../api/client";
import { errorMessage } from "../../api/errorMessages";
import {
  DURATION_LABELS,
  DURATION_OPTIONS,
  fetchWalkPreferences,
  patchWalkPreferences,
  type DurationCode,
  type WalkPreferences,
} from "../../api/walkPreferences";
import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const SIZE_OPTIONS: DogSizeCode[] = ["SMALL", "MEDIUM", "LARGE"];

export default function WalkPreferencesScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [duration, setDuration] = useState<DurationCode | null>(null);
  const [size, setSize] = useState<DogSizeCode | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  // 서버가 알려 준 현재 버전. 저장할 때 expected_version으로 보낸다(처음은 0).
  const version = useRef(0);
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/10-1");
  };

  const apply = (data: WalkPreferences) => {
    version.current = data.version;
    setDuration(data.effective_preferences.duration_code);
    setSize(data.effective_preferences.size_code);
  };

  const load = useCallback(async () => {
    setPhase("loading");
    const result = await fetchWalkPreferences();
    if (result.ok) {
      version.current = result.data.version;
      setDuration(result.data.effective_preferences.duration_code);
      setSize(result.data.effective_preferences.size_code);
      setPhase("ready");
      return;
    }
    const target = await routeForFailure(result);
    if (target) {
      router.replace(target);
      return;
    }
    setFailure(result);
    setPhase("error");
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleConflict = async () => {
    // 다른 곳에서 바뀌었다. 최신 값을 다시 조회해 보여 주고, 사용자가 정하게 한다(조용히 덮어쓰지 않는다).
    const latest = await fetchWalkPreferences();
    if (!latest.ok) {
      Alert.alert("알림", errorMessage(latest.code));
      return;
    }
    Alert.alert(
      "선호 설정이 바뀌었어요",
      "다른 곳에서 선호 설정이 바뀌었어요. 어떻게 할까요?",
      [
        // 닫으면 버전을 그대로 두어, 다시 저장해도 같은 확인이 뜬다.
        { text: "서버 값 보기", onPress: () => apply(latest.data) },
        { text: "내 선택으로 저장", onPress: () => { version.current = latest.data.version; } },
        { text: "닫기", style: "cancel" },
      ],
    );
  };

  const save = async () => {
    if (savingRef.current) return;
    if (!duration && !size) {
      Alert.alert("입력 확인", "산책 시간이나 강아지 크기를 선택해 주세요.");
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const result = await patchWalkPreferences({
        expected_version: version.current,
        ...(duration ? { duration_code: duration } : {}),
        ...(size ? { size_code: size } : {}),
      });
      // 저장 응답을 받은 뒤에만 화면을 닫는다.
      if (result.ok) {
        version.current = result.data.version;
        goBack();
        return;
      }
      const target = await routeForFailure(result);
      if (target) {
        router.replace(target);
        return;
      }
      if (result.code === "PREFERENCE_VERSION_MISMATCH") {
        await handleConflict();
        return;
      }
      Alert.alert("알림", errorMessage(result.code));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (phase !== "ready") {
    return (
      <Screen backgroundColor={colors.white} safeAreaEdges={[]} testID="screen-10-3">
        <View style={styles.loadState}>
          <Text style={styles.loadStateText}>
            {phase === "error" ? errorMessage(failure?.code) : "불러오는 중..."}
          </Text>
          {phase === "error" ? (
            <>
              <Pressable
                accessibilityLabel="다시 시도"
                accessibilityRole="button"
                onPress={() => void load()}
                style={styles.loadStateButton}
              >
                <Text style={styles.loadStateButtonText}>다시 시도</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="뒤로"
                accessibilityRole="button"
                onPress={goBack}
                style={styles.loadStateButton}
              >
                <Text style={styles.loadStateButtonText}>뒤로</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-10-3"
    >
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="뒤로"
            accessibilityRole="button"
            onPress={goBack}
            style={styles.backButton}
          >
            <Icon name="icon-back" size={24} width={7.41} height={12} color={colors.brown} />
          </Pressable>
          <Text style={styles.headerTitle}>산책 선호 설정</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>나에게 맞게 산책하개</Text>
          <Text style={styles.subtitle}>강아지 크기는 산책 목록의 기본 조건으로 사용해요.</Text>

          <Text style={styles.fieldLabel}>기본 활동 지역</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="기본 활동 지역"
            onPress={() => Alert.alert("안내", "활동 지역은 온보딩에서 고른 값을 쓰고 있어요. 여기서 바꾸는 기능은 아직 없어요.")}
            style={styles.regionField}
          >
            <Text style={styles.regionText}>온보딩에서 고른 지역</Text>
            <Icon name="icon-expand-more" size={24} width={24} height={24} color={colors.brown2} />
          </Pressable>
          <Text style={styles.regionHint}>상세 주소 없이 방문할 지역만 선택해요.</Text>

          <Text style={styles.fieldLabel}>선호 산책 시간</Text>
          {DURATION_OPTIONS.map((item) => (
            <Pressable
              accessibilityLabel={DURATION_LABELS[item]}
              accessibilityRole="button"
              accessibilityState={{ selected: duration === item, disabled: saving }}
              disabled={saving}
              key={item}
              onPress={() => setDuration(item)}
              style={[
                styles.durationButton,
                duration === item
                  ? styles.durationSelected
                  : styles.durationUnselected,
              ]}
            >
              <Text style={styles.optionText}>{DURATION_LABELS[item]}</Text>
            </Pressable>
          ))}

          <Text style={styles.sizeTitle}>편하게 산책할 수 있는 크기</Text>
          <View style={styles.sizeRow}>
            {SIZE_OPTIONS.map((item) => (
              <Pressable
                accessibilityLabel={DOG_SIZE_LABELS[item]}
                accessibilityRole="button"
                accessibilityState={{ selected: size === item, disabled: saving }}
                disabled={saving}
                key={item}
                onPress={() => setSize(item)}
                style={[
                  styles.sizeButton,
                  size === item
                    ? styles.sizeSelected
                    : styles.sizeUnselected,
                ]}
              >
                <Text style={styles.optionText}>{DOG_SIZE_LABELS[item]}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityLabel="선호 설정 저장"
          accessibilityRole="button"
          accessibilityState={{ disabled: saving }}
          disabled={saving}
          onPress={() => void save()}
          style={[styles.saveButton, saving && styles.disabledAction]}
        >
          <Text style={styles.saveText}>{saving ? "저장하는 중..." : "선호 설정 저장"}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  loadStateText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 22,
    textAlign: "center",
    width: 300,
  },
  loadStateButton: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 44,
    justifyContent: "center",
    marginTop: 12,
    width: 200,
  },
  loadStateButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
  },
  disabledAction: {
    opacity: 0.5,
  },
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
    paddingTop: 12,
    width: 375,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 26,
  },
  subtitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.bodyLarge,
  },
  fieldLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
    marginTop: 24,
  },
  regionField: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: radii.pill,
    flexDirection: "row",
    height: 50,
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 18,
  },
  regionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.subtitle,
  },
  regionHint: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
    marginTop: 8,
  },
  durationButton: {
    alignItems: "center",
    borderRadius: radii.pill,
    height: 44,
    justifyContent: "center",
    marginTop: 8,
  },
  durationSelected: {
    backgroundColor: colors.lightOrange,
  },
  durationUnselected: {
    borderColor: colors.orange,
    borderWidth: 1,
  },
  sizeTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 18,
    marginTop: 24,
  },
  sizeRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  sizeButton: {
    alignItems: "center",
    borderRadius: radii.pill,
    flex: 1,
    height: 44,
    justifyContent: "center",
  },
  sizeSelected: {
    backgroundColor: colors.lightOrange,
  },
  sizeUnselected: {
    borderColor: colors.orange,
    borderWidth: 1,
  },
  optionText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 14,
  },
  saveButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    bottom: 28,
    height: 49,
    justifyContent: "center",
    position: "absolute",
    width: 335,
  },
  saveText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 17,
  },
});
