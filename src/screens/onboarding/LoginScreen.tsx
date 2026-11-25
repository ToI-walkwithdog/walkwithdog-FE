import { useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { fetchMe, login, routeForOnboarding } from "../../api/auth";
import { errorMessage } from "../../api/errorMessages";
import { OnboardingBackground } from "../../components/OnboardingBackground";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { colors, radii, shadows, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function LoginScreen() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const submittingRef = useRef(false);

  const handleLogin = async () => {
    if (!id.trim() || !password || submittingRef.current) return;
    submittingRef.current = true;
    try {
      const res = await login(id.trim(), password);
      if (!res.ok) {
        // INVALID_CREDENTIALS, TOO_MANY_REQUESTS, 네트워크 오류 등: 화면 유지
        Alert.alert("알림", errorMessage(res.code));
        return;
      }
      const me = await fetchMe();
      if (!me.ok) {
        Alert.alert("알림", errorMessage(me.code));
        return;
      }
      const target = routeForOnboarding(me.data);
      if (target) {
        router.replace(target);
      } else {
        // 보호소·관리자 계정은 이 앱에서 이용할 수 없다.
        Alert.alert("알림", errorMessage("ROLE_NOT_ALLOWED"));
      }
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-1-2"
    >
      <View style={styles.root}>
        <OnboardingBackground />

        <View style={styles.topContentFrame}>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>
            정보를 저장하기 위해{"\n"}계정을 로그인해 주세요 :)
          </Text>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.sheetContentFrame}>
            <PillTextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setId}
              placeholder="Enter your id or email"
              placeholderTextColor={colors.brown2}
              style={[styles.input, styles.idInput]}
              textContentType="emailAddress"
            />
            <PillTextInput
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.brown2}
              secureTextEntry
              style={[styles.input, styles.passwordInput]}
              textContentType="password"
            />

            <Pressable
              accessibilityRole="button"
              onPress={handleLogin}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>

            <Text style={styles.registerPrompt}>
              Don’t have an account?{" "}
              <Text
                accessibilityRole="link"
                onPress={() => router.push("/1-4")}
                style={styles.registerLink}
              >
                Register Now
              </Text>
            </Text>
          </View>
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
  topContentFrame: {
    alignSelf: "center",
    flex: 1,
    width: 375,
  },
  title: {
    color: colors.brown3,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 36,
    left: 0,
    lineHeight: 54,
    position: "absolute",
    textAlign: "center",
    top: 126,
    width: 375,
  },
  subtitle: {
    color: colors.brown2,
    fontFamily: fontFamilies.notoSansKRRegular,
    fontSize: typography.fontSizes.subtitle,
    left: 73,
    lineHeight: 20,
    position: "absolute",
    textAlign: "center",
    top: 180,
    width: 230,
  },
  bottomSheet: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    bottom: 0,
    elevation: 8,
    height: 518,
    position: "absolute",
    shadowColor: shadows.onboardingSheet.color,
    shadowOffset: {
      width: shadows.onboardingSheet.offsetX,
      height: shadows.onboardingSheet.offsetY,
    },
    shadowOpacity: 1,
    shadowRadius: shadows.onboardingSheet.blurRadius,
    width: "100%",
  },
  sheetContentFrame: {
    alignSelf: "center",
    height: 518,
    width: 375,
  },
  input: {
    left: 22,
    position: "absolute",
    width: 331,
  },
  idInput: {
    top: 65,
    fontSize: typography.fontSizes.mediumTitle,
  },
  passwordInput: {
    top: 139,
    fontSize: typography.fontSizes.mediumTitle,
  },
  loginButton: {
    alignItems: "center",
    backgroundColor: colors.lightOrange,
    borderRadius: radii.pill,
    height: 56,
    justifyContent: "center",
    left: 22,
    position: "absolute",
    top: 220,
    width: 331,
  },
  loginButtonText: {
    color: colors.white,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 21,
    textAlign: "center",
  },
  registerPrompt: {
    color: colors.black,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: typography.fontSizes.smallBody,
    lineHeight: 18.2,
    position: "absolute",
    textAlign: "center",
    top: 287,
    width: 375,
  },
  registerLink: {
    color: colors.orange,
    textDecorationLine: "underline",
  },
});
