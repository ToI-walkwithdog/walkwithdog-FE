import { useRef, useState } from "react";
import { usePreventRemove, useRouter } from "expo-router";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  isValidLoginId,
  isValidNickname,
  isValidPassword,
} from "../../api/accountRules";
import { login } from "../../api/auth";
import { errorMessage } from "../../api/errorMessages";
import {
  clearSignupDraft,
  getSignupDraft,
  setPolicyVersion,
} from "../../api/signupDraft";
import {
  checkNicknameAvailability,
  fetchPrivacyPolicy,
  registerUser,
} from "../../api/users";
import { Icon } from "../../components/Icon";
import { OnboardingPillButton } from "../../components/OnboardingPillButton";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";


const NICKNAME_AVAILABLE_MESSAGE = "*등록 가능한 닉네임입니다";
const NICKNAME_DUPLICATE_MESSAGE = "*중복입니다. 다른 닉네임을 사용해 주세요";

export default function RegisterScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(false);
  const [nicknameMessage, setNicknameMessage] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [backAllowed, setBackAllowed] = useState(false);
  const submittingRef = useRef(false);
  const latestNicknameRef = useRef("");

  usePreventRemove(!backAllowed, () => {
    setBackAllowed(true);
    setTimeout(() => router.dismissTo("/1-2"), 0);
  });

  const showNicknameResult = (available: boolean) => {
    setNicknameChecked(true);
    setNicknameAvailable(available);
    setNicknameMessage(
      available ? NICKNAME_AVAILABLE_MESSAGE : NICKNAME_DUPLICATE_MESSAGE,
    );
  };

  // 확인하지 못한 경우: 확인 완료로 보지 않고 사유를 닉네임 아래에 보여 준다.
  const showNicknameFailure = (message: string) => {
    setNicknameChecked(false);
    setNicknameAvailable(false);
    setNicknameMessage(message);
  };

  const checkNickname = async () => {
    const requested = nickname.trim();
    if (!requested) {
      setNicknameChecked(false);
      setNicknameAvailable(false);
      setNicknameMessage("");
      return;
    }

    // 형식에 맞지 않으면 서버에 묻지 않는다.
    if (!isValidNickname(requested)) {
      showNicknameFailure(errorMessage("INVALID_NICKNAME_FORMAT"));
      return;
    }

    const res = await checkNicknameAvailability(requested);
    // 입력이 바뀐 뒤 도착한 응답은 버린다.
    if (requested !== latestNicknameRef.current.trim()) return;
    if (res.ok) {
      showNicknameResult(res.data.available);
    } else {
      // 422 닉네임 형식 오류, 429 TOO_MANY_REQUESTS, 네트워크 오류 등
      showNicknameFailure(errorMessage(res.code));
    }
  };

  const register = async () => {
    if (!nickname.trim()) {
      setValidationMessage("닉네임을 입력해 주세요.");
      return;
    }
    if (!nicknameChecked || !nicknameAvailable) {
      setValidationMessage("닉네임 중복 확인을 완료해 주세요.");
      return;
    }
    if (!isValidNickname(nickname.trim())) {
      setValidationMessage(errorMessage("INVALID_NICKNAME_FORMAT"));
      return;
    }
    if (!isValidLoginId(id)) {
      setValidationMessage("아이디는 4~20자의 영문과 숫자만 사용할 수 있어요.");
      return;
    }
    if (!isValidPassword(password)) {
      setValidationMessage("비밀번호 규칙을 확인해 주세요.");
      return;
    }
    if (password !== confirmedPassword) {
      setValidationMessage("비밀번호 확인이 일치하지 않아요.");
      return;
    }

    setValidationMessage("");
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      const draft = getSignupDraft();
      let documentVersion = draft.policyVersion;
      if (!documentVersion) {
        const policy = await fetchPrivacyPolicy();
        // 503 POLICY_DOCUMENT_UNAVAILABLE 등: 가입을 막고 화면에 머문다.
        if (!policy.ok) {
          setValidationMessage(errorMessage(policy.code));
          return;
        }
        documentVersion = policy.data.document_version;
      }

      const res = await registerUser({
        login_id: id,
        nickname: nickname.trim(),
        password,
        privacy: {
          document_version: documentVersion,
          age_14_plus_confirmed: draft.ageConfirmed,
          collection_use_agreed: draft.collectionUseAgreed,
          // 대응하는 동의 UI가 없어 항상 false(unverified).
          ai_overseas_transfer_agreed: false,
        },
      });
      if (!res.ok) {
        if (res.code === "NICKNAME_ALREADY_EXISTS") {
          showNicknameResult(false);
        } else {
          if (res.code === "POLICY_VERSION_MISMATCH") {
            setPolicyVersion(null); // 다음 제출에서 최신 버전을 다시 조회한다.
          }
          setValidationMessage(errorMessage(res.code));
        }
        return;
      }

      clearSignupDraft();
      const loggedIn = await login(id, password);
      if (!loggedIn.ok) {
        // 가입은 끝났으므로 다시 가입하지 않고 로그인 화면으로 보낸다.
        setBackAllowed(true);
        setTimeout(() => router.dismissTo("/1-2"), 0);
        return;
      }

      router.push("/1-6");
    } finally {
      submittingRef.current = false;
    }
  };

  const clearNicknameCheck = (value: string) => {
    latestNicknameRef.current = value;
    setNickname(value);
    setNicknameChecked(false);
    setNicknameAvailable(false);
    setNicknameMessage("");
    setValidationMessage("");
  };

  const clearValidation = (setter: (value: string) => void) => {
    return (value: string) => {
      setter(value);
      setValidationMessage("");
    };
  };

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-1-3"
    >
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          style={styles.scrollView}
        >
          <View style={styles.contentFrame}>
          <Pressable
            accessibilityLabel="뒤로"
            accessibilityRole="button"
            onPress={() => {
              setBackAllowed(true);
              router.dismissTo("/1-2");
            }}
            style={styles.backButton}
          >
            <Icon
              name="icon-back"
              size={24}
              width={11.1563}
              height={17.7662}
              color={colors.brown2}
            />
          </Pressable>
          <Text style={styles.title}>회원가입</Text>

          <Text style={[styles.fieldLabel, styles.nicknameLabel]}>
            닉네임*
          </Text>
          <PillTextInput
            autoCapitalize="none"
            autoCorrect={false}
            fontSize={typography.fontSizes.bodyLarge}
            onChangeText={clearNicknameCheck}
            placeholder="Enter your id"
            placeholderColor={colors.mildBrown}
            style={[styles.input, styles.nicknameInput]}
            value={nickname}
          />
          <Pressable
            accessibilityLabel="닉네임 중복 확인"
            accessibilityRole="button"
            onPress={checkNickname}
            style={styles.duplicateButton}
          >
            <Text style={styles.duplicateButtonText}>
              중복{"\n"}확인
            </Text>
          </Pressable>
          {nicknameMessage ? (
            <Text
              style={[
                styles.nicknameMessage,
                nicknameAvailable
                  ? styles.nicknameAvailable
                  : styles.nicknameDuplicate,
              ]}
            >
              {nicknameMessage}
            </Text>
          ) : null}

          <Text style={[styles.fieldLabel, styles.idLabel]}>아이디*</Text>
          <PillTextInput
            autoCapitalize="none"
            autoCorrect={false}
            fontSize={typography.fontSizes.bodyLarge}
            onChangeText={clearValidation(setId)}
            placeholder="Enter your id"
            placeholderColor={colors.mildBrown}
            style={[styles.input, styles.fullWidthInput, styles.idInput]}
            value={id}
          />

          <Text style={[styles.fieldLabel, styles.passwordLabel]}>
            비밀번호*
          </Text>
          <PillTextInput
            autoCapitalize="none"
            fontSize={typography.fontSizes.bodyLarge}
            onChangeText={clearValidation(setPassword)}
            placeholder="Enter your password"
            placeholderColor={colors.mildBrown}
            secureTextEntry
            style={[styles.input, styles.fullWidthInput, styles.passwordInput]}
            textContentType="newPassword"
            value={password}
          />
          <Text style={styles.passwordHint}>
            *15~128자 이내, 대문자, 소문자, 숫자, 특수문자 모두 필수
          </Text>

          <Text style={[styles.fieldLabel, styles.confirmLabel]}>
            비밀번호 확인*
          </Text>
          <PillTextInput
            autoCapitalize="none"
            fontSize={typography.fontSizes.bodyLarge}
            onChangeText={clearValidation(setConfirmedPassword)}
            placeholder="Confirm password"
            placeholderColor={colors.mildBrown}
            secureTextEntry
            style={[styles.input, styles.fullWidthInput, styles.confirmInput]}
            textContentType="newPassword"
            value={confirmedPassword}
          />
          {validationMessage ? (
            <Text style={styles.validationMessage}>{validationMessage}</Text>
          ) : null}
          </View>
        </ScrollView>

        <OnboardingPillButton title="등록" onPress={register} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    minHeight: 812,
  },
  contentFrame: {
    alignSelf: "center",
    flex: 1,
    height: 812,
    width: 375,
  },
  backButton: {
    alignItems: "center",
    height: 23.766,
    justifyContent: "center",
    left: 24.84,
    position: "absolute",
    top: 69,
    width: 23.156,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.pretendardMedium,
    fontSize: typography.fontSizes.title,
    left: 63,
    lineHeight: 22,
    position: "absolute",
    top: 69,
  },
  fieldLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.pretendardMedium,
    fontSize: typography.fontSizes.body,
    lineHeight: 17.5,
    position: "absolute",
  },
  nicknameLabel: {
    left: 27,
    top: 145,
  },
  idLabel: {
    left: 27,
    top: 243,
  },
  passwordLabel: {
    left: 26,
    top: 341,
  },
  confirmLabel: {
    left: 26,
    top: 466,
  },
  input: {
    left: 22,
    position: "absolute",
  },
  nicknameInput: {
    top: 170,
    width: 254,
  },
  fullWidthInput: {
    width: 331,
  },
  idInput: {
    top: 268,
  },
  passwordInput: {
    top: 366,
  },
  confirmInput: {
    top: 491,
  },
  duplicateButton: {
    alignItems: "center",
    backgroundColor: colors.lightOrange,
    borderRadius: radii.pill,
    height: 56,
    justifyContent: "center",
    left: 284,
    position: "absolute",
    top: 170,
    width: 63,
  },
  duplicateButtonText: {
    color: colors.brown3,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 18.75,
    textAlign: "center",
  },
  nicknameMessage: {
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.small,
    left: 27,
    lineHeight: 15,
    position: "absolute",
    top: 229,
  },
  nicknameDuplicate: {
    color: colors.warning,
  },
  nicknameAvailable: {
    color: colors.success,
  },
  validationMessage: {
    color: colors.warning,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.small,
    left: 26,
    lineHeight: 16,
    position: "absolute",
    textAlign: "center",
    top: 538,
    width: 323,
  },
  passwordHint: {
    color: colors.mildLightBrown,
    fontFamily: fontFamilies.pretendardMedium,
    fontSize: typography.fontSizes.smallBody,
    left: 26,
    lineHeight: 16.25,
    position: "absolute",
    top: 430,
  },
});
