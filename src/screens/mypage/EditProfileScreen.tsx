import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { routeForFailure } from "../../api/auth";
import type { ApiFailure } from "../../api/client";
import { errorMessage } from "../../api/errorMessages";
import {
  confirmProfilePhoneVerification,
  fetchProfile,
  patchProfile,
  sendProfilePhoneVerification,
  type Profile,
  type ProfilePatch,
} from "../../api/profile";
import { Icon } from "../../components/Icon";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

type FieldName = "nickname" | "name" | "phone";

export default function EditProfileScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<{ field: FieldName; text: string } | null>(null);
  // 번호 변경: 새 번호 입력 → 인증번호 발송 → 확인 → 저장 때 함께 보낸다.
  const [changingPhone, setChangingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [code, setCode] = useState("");
  const [requested, setRequested] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const verificationId = useRef<string | null>(null);
  const savingRef = useRef(false);
  const busyRef = useRef(false);
  // 서버가 알려 준 현재 프로필 버전. 저장할 때 expected_profile_version으로 보낸다.
  const version = useRef(0);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/10-1");
  };

  const resetPhoneChange = () => {
    verificationId.current = null;
    setChangingPhone(false);
    setNewPhone("");
    setCode("");
    setRequested(false);
    setVerifiedPhone(null);
  };

  const applyProfile = (data: Profile) => {
    version.current = data.profile_version;
    setProfile(data);
    setNickname(data.nickname);
    setName(data.full_name ?? "");
  };

  const load = useCallback(async () => {
    setPhase("loading");
    const result = await fetchProfile();
    if (result.ok) {
      version.current = result.data.profile_version;
      setProfile(result.data);
      setNickname(result.data.nickname);
      setName(result.data.full_name ?? "");
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

  const handleNetworkOrCommon = async (failed: ApiFailure): Promise<boolean> => {
    const target = await routeForFailure(failed);
    if (target) {
      router.replace(target);
      return true;
    }
    return false;
  };

  const requestVerification = async () => {
    if (busyRef.current) return;
    const phone = newPhone.trim();
    if (!/^[0-9-]{10,13}$/.test(phone)) {
      setFieldError({ field: "phone", text: errorMessage("INVALID_PHONE_NUMBER") });
      return;
    }
    busyRef.current = true;
    setSending(true);
    setFieldError(null);
    try {
      const result = await sendProfilePhoneVerification(phone);
      if (result.ok) {
        verificationId.current = result.data.verification_id;
        setRequested(true);
        setVerifiedPhone(null);
        Alert.alert(
          "인증번호 발송",
          `인증번호를 보냈어요. ${Math.round(result.data.expires_in_seconds / 60)}분 안에 입력해 주세요.`,
        );
        return;
      }
      verificationId.current = null;
      setRequested(false);
      if (await handleNetworkOrCommon(result)) return;
      setFieldError({ field: "phone", text: errorMessage(result.code) });
    } finally {
      busyRef.current = false;
      setSending(false);
    }
  };

  const confirmVerification = async () => {
    if (busyRef.current) return;
    const id = verificationId.current;
    if (!requested || !id) {
      setFieldError({ field: "phone", text: "인증 요청을 먼저 해 주세요." });
      return;
    }
    if (code.length !== 6) {
      setFieldError({ field: "phone", text: errorMessage("INVALID_VERIFICATION_PAYLOAD") });
      return;
    }
    busyRef.current = true;
    setConfirming(true);
    setFieldError(null);
    try {
      const result = await confirmProfilePhoneVerification(id, code);
      if (result.ok) {
        setVerifiedPhone(newPhone.trim());
        return;
      }
      if (await handleNetworkOrCommon(result)) return;
      setFieldError({ field: "phone", text: errorMessage(result.code) });
    } finally {
      busyRef.current = false;
      setConfirming(false);
    }
  };

  // 저장할 때 서버가 버전이 다르다고 하면, 최신 프로필을 보여 주고 사용자가 정하게 한다(조용히 덮어쓰지 않는다).
  const handleVersionMismatch = async () => {
    const latest = await fetchProfile();
    if (!latest.ok) {
      Alert.alert("알림", errorMessage(latest.code));
      return;
    }
    Alert.alert("정보가 바뀌었어요", errorMessage("PROFILE_VERSION_MISMATCH"), [
      {
        text: "서버 값 보기",
        onPress: () => {
          applyProfile(latest.data);
          resetPhoneChange();
        },
      },
      // 입력한 내용은 그대로 두고 최신 버전으로 저장할 수 있게 한다. 닫으면 버전을 그대로 두어 같은 확인이 다시 뜬다.
      { text: "내 입력으로 저장", onPress: () => { version.current = latest.data.profile_version; } },
      { text: "닫기", style: "cancel" },
    ]);
  };

  const save = async () => {
    if (savingRef.current || !profile) return;
    const nextNickname = nickname.trim();
    const nextName = name.trim();
    if (!nextNickname) {
      setFieldError({ field: "nickname", text: errorMessage("NICKNAME_REQUIRED") });
      return;
    }
    // 바뀐 필드만 보낸다. 서버는 빈 값과 null을 받지 않는다.
    const body: ProfilePatch = { expected_profile_version: version.current };
    if (nextNickname !== profile.nickname) body.nickname = nextNickname;
    if (profile.full_name !== null && nextName !== profile.full_name) {
      if (!nextName) {
        setFieldError({ field: "name", text: errorMessage("INVALID_FULL_NAME") });
        return;
      }
      body.full_name = nextName;
    }
    if (changingPhone && verifiedPhone && verificationId.current) {
      body.phone_number = verifiedPhone;
      body.phone_verification_id = verificationId.current;
    } else if (changingPhone && (newPhone.trim() || requested)) {
      setFieldError({ field: "phone", text: errorMessage("PHONE_VERIFICATION_REQUIRED") });
      return;
    }
    if (Object.keys(body).length === 1) {
      goBack();
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setFieldError(null);
    try {
      const result = await patchProfile(body);
      // 저장 응답을 받은 뒤에만 화면을 닫는다.
      if (result.ok) {
        version.current = result.data.profile_version;
        goBack();
        return;
      }
      if (await handleNetworkOrCommon(result)) return;
      switch (result.code) {
        case "PROFILE_VERSION_MISMATCH":
          await handleVersionMismatch();
          return;
        case "NICKNAME_ALREADY_EXISTS":
        case "NICKNAME_REQUIRED":
        case "INVALID_NICKNAME_LENGTH":
        case "INVALID_NICKNAME_FORMAT":
          setFieldError({ field: "nickname", text: errorMessage(result.code) });
          return;
        case "INVALID_FULL_NAME":
          setFieldError({ field: "name", text: errorMessage(result.code) });
          return;
        case "PHONE_VERIFICATION_REQUIRED":
        case "PHONE_ALREADY_REGISTERED":
        case "INVALID_PHONE_NUMBER":
        case "PHONE_NUMBER_REQUIRED":
          // 인증을 새로 받아야 한다(이미 쓴 인증이거나 다른 계정의 번호).
          verificationId.current = null;
          setRequested(false);
          setVerifiedPhone(null);
          setCode("");
          setFieldError({ field: "phone", text: errorMessage(result.code) });
          return;
        default:
          Alert.alert("알림", errorMessage(result.code));
      }
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (phase !== "ready" || !profile) {
    return (
      <Screen backgroundColor={colors.white} safeAreaEdges={[]} testID="screen-10-2">
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

  // 이름과 번호는 온보딩 Step 1(기본 정보)을 마친 계정만 바꿀 수 있다.
  const basicInfoDone = profile.full_name !== null;
  const phoneShown = verifiedPhone ?? profile.phone_number ?? "";

  return (
    <Screen
      backgroundColor={colors.white}
      contentContainerStyle={styles.scrollContent}
      scroll
      safeAreaEdges={[]}
      testID="screen-10-2"
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
          <Text style={styles.headerTitle}>내 정보 수정</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>내 정보를 관리하개</Text>
          <Text style={styles.subtitle}>연락처는 예약과 안전 안내에 사용해요.</Text>

          <Text style={styles.fieldLabel}>닉네임</Text>
          <PillTextInput
            accessibilityLabel="닉네임"
            borderColor={colors.deepOrange}
            borderRadius={radii.pill}
            editable={!saving}
            onChangeText={(value) => {
              setNickname(value);
              setFieldError(null);
            }}
            style={styles.field}
            value={nickname}
          />
          {fieldError?.field === "nickname" ? (
            <Text style={styles.errorText}>{fieldError.text}</Text>
          ) : null}

          <Text style={[styles.fieldLabel, styles.nameLabel]}>이름</Text>
          <PillTextInput
            accessibilityLabel="이름"
            borderColor={colors.deepOrange}
            borderRadius={radii.pill}
            editable={basicInfoDone && !saving}
            onChangeText={(value) => {
              setName(value);
              setFieldError(null);
            }}
            style={styles.field}
            value={name}
          />
          {fieldError?.field === "name" ? (
            <Text style={styles.errorText}>{fieldError.text}</Text>
          ) : (
            <Text style={styles.realNameHint}>
              {basicInfoDone
                ? "실명은 보호소 활동 확인을 위해 사용해요 :)"
                : errorMessage("PROFILE_BASIC_INFO_REQUIRED")}
            </Text>
          )}

          <Text style={[styles.fieldLabel, styles.phoneLabel]}>휴대폰 번호</Text>
          <PillTextInput
            accessibilityLabel="휴대폰 번호"
            borderColor={colors.orange}
            borderRadius={radii.pill}
            editable={false}
            style={styles.field}
            value={phoneShown}
          />
          {verifiedPhone ? <Text style={styles.okText}>새 번호 인증이 완료됐어요. 저장하면 바뀌어요.</Text> : null}

          {changingPhone ? (
            <View style={styles.phoneChange}>
              <PillTextInput
                accessibilityLabel="새 휴대폰 번호"
                borderColor={colors.lightOrange}
                borderRadius={radii.pill}
                editable={!sending && !saving}
                keyboardType="phone-pad"
                onChangeText={(value) => {
                  setNewPhone(value.replace(/[^\d-]/g, ""));
                  verificationId.current = null;
                  setRequested(false);
                  setVerifiedPhone(null);
                  setFieldError(null);
                }}
                placeholder="010-0000-0000"
                placeholderColor={colors.brown2}
                style={styles.field}
                value={newPhone}
              />
              <Pressable
                accessibilityLabel="인증 요청"
                accessibilityRole="button"
                accessibilityState={{ disabled: sending || saving }}
                disabled={sending || saving}
                onPress={() => void requestVerification()}
                style={[styles.smallButton, (sending || saving) && styles.disabledAction]}
              >
                <Text style={styles.smallButtonText}>{sending ? "요청 중..." : "인증 요청"}</Text>
              </Pressable>
              <PillTextInput
                accessibilityLabel="인증번호 6자리"
                borderColor={colors.lightOrange}
                borderRadius={radii.pill}
                editable={requested && !confirming && !saving}
                keyboardType="number-pad"
                maxLength={6}
                onChangeText={(value) => {
                  setCode(value.replace(/\D/g, ""));
                  setVerifiedPhone(null);
                  setFieldError(null);
                }}
                placeholder="인증번호 6자리"
                placeholderColor={colors.brown2}
                style={styles.field}
                value={code}
              />
              <Pressable
                accessibilityLabel="인증 확인"
                accessibilityRole="button"
                accessibilityState={{ disabled: !requested || confirming || saving }}
                disabled={!requested || confirming || saving}
                onPress={() => void confirmVerification()}
                style={[
                  styles.smallButton,
                  (!requested || confirming || saving) && styles.disabledAction,
                ]}
              >
                <Text style={styles.smallButtonText}>{confirming ? "확인 중..." : "확인"}</Text>
              </Pressable>
              {fieldError?.field === "phone" ? (
                <Text style={styles.errorText}>{fieldError.text}</Text>
              ) : null}
              <Pressable
                accessibilityLabel="번호 변경 취소"
                accessibilityRole="button"
                disabled={saving}
                onPress={resetPhoneChange}
                style={styles.cancelLink}
              >
                <Text style={styles.cancelLinkText}>번호 변경 취소</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityLabel="휴대폰 번호 변경·재인증"
              accessibilityRole="button"
              accessibilityState={{ disabled: !basicInfoDone || saving }}
              disabled={!basicInfoDone || saving}
              onPress={() => setChangingPhone(true)}
              style={[styles.reauthButton, !basicInfoDone && styles.disabledAction]}
            >
              <Text style={styles.reauthText}>휴대폰 번호 변경·재인증</Text>
            </Pressable>
          )}

          <Text style={styles.privacyHint}>
            번호를 바꾸려면 새 번호로 인증번호를 받아{"\n"}
            확인한 뒤 저장해 주세요.
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <Pressable
            accessibilityLabel="변경 내용 저장"
            accessibilityRole="button"
            accessibilityState={{ disabled: saving }}
            disabled={saving}
            onPress={() => void save()}
            style={[styles.saveButton, saving && styles.disabledAction]}
          >
            <Text style={styles.saveText}>{saving ? "저장하는 중..." : "변경 내용 저장"}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="취소"
            accessibilityRole="button"
            disabled={saving}
            onPress={goBack}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>
        </View>
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
  disabledAction: { opacity: 0.5 },
  scrollContent: { paddingBottom: 150 },
  errorText: {
    color: colors.reportRed,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
    marginTop: 8,
  },
  okText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 13,
    marginTop: 8,
  },
  phoneChange: { marginTop: 4 },
  smallButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: colors.lightOrange,
    borderRadius: 25,
    height: 36,
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 16,
  },
  smallButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.body,
  },
  cancelLink: { alignSelf: "center", marginTop: 12 },
  cancelLinkText: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 14,
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
    fontSize: 27,
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
    marginTop: 20,
  },
  nameLabel: { marginTop: 14 },
  phoneLabel: { marginTop: 14 },
  field: {
    height: 56,
    marginTop: 4,
    width: 335,
  },
  realNameHint: {
    color: colors.brown2,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
    marginTop: 8,
  },
  reauthButton: {
    alignItems: "center",
    backgroundColor: "#FFDFB2",
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    marginTop: 12,
  },
  reauthText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 17,
  },
  privacyHint: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 14,
    lineHeight: 20.3,
    marginTop: 16,
  },
  bottomActions: {
    alignSelf: "center",
    marginTop: 24,
    width: 335,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
  },
  saveText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 17,
  },
  cancelButton: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 49,
    justifyContent: "center",
    marginTop: 12,
  },
  cancelText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 17,
  },
});
