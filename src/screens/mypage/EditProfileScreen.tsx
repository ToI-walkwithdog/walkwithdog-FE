import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { useMockSession } from "../../context/MockSession";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useMockSession();
  const [nickname, setNickname] = useState(profile.nickname);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/10-1");
  };

  return (
    <Screen
      backgroundColor={colors.white}
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
            onChangeText={setNickname}
            style={styles.field}
            value={nickname}
          />

          <Text style={[styles.fieldLabel, styles.nameLabel]}>이름</Text>
          <PillTextInput
            accessibilityLabel="이름"
            borderColor={colors.deepOrange}
            borderRadius={radii.pill}
            onChangeText={setName}
            style={styles.field}
            value={name}
          />
          <Text style={styles.realNameHint}>실명은 보호소 활동 확인을 위해 사용해요 :)</Text>

          <Text style={[styles.fieldLabel, styles.phoneLabel]}>휴대폰 번호</Text>
          <PillTextInput
            accessibilityLabel="휴대폰 번호"
            borderColor={colors.orange}
            borderRadius={radii.pill}
            keyboardType="phone-pad"
            onChangeText={setPhone}
            style={styles.field}
            value={phone}
          />
          <Pressable
            accessibilityLabel="휴대폰 번호 변경·재인증"
            accessibilityRole="button"
            onPress={() => Alert.alert("재인증 미연결", "실제 휴대폰 재인증은 아직 연결되지 않았어요.")}
            style={styles.reauthButton}
          >
            <Text style={styles.reauthText}>휴대폰 번호 변경·재인증</Text>
          </Pressable>

          <Text style={styles.privacyHint}>
            목업으로 앱에만 저장되며,{"\n"}
            보호소나 서버로 전송되지 않아요.
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <Pressable
            accessibilityLabel="변경 내용 저장"
            accessibilityRole="button"
            onPress={() => {
              if (!nickname.trim()) {
                Alert.alert("입력 확인", "닉네임을 입력해 주세요.");
                return;
              }
              updateProfile({ nickname: nickname.trim(), name: name.trim(), phone });
              Alert.alert("목업 저장", "앱 실행 중에만 저장되며 실제 인증이나 서버 저장은 되지 않아요.");
              goBack();
            }}
            style={styles.saveButton}
          >
            <Text style={styles.saveText}>변경 내용 저장</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="취소"
            accessibilityRole="button"
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
    bottom: 28,
    position: "absolute",
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
