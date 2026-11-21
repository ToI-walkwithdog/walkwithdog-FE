import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function EditProfileScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState("Glow");
  const [name, setName] = useState("가입 시 인증한 이름");
  const [phone, setPhone] = useState("010 - ****- ****");

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
            onPress={() => router.replace("/10-1")}
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
            onPress={() => console.log("휴대폰 번호 변경 tapped")}
            style={styles.reauthButton}
          >
            <Text style={styles.reauthText}>휴대폰 번호 변경·재인증</Text>
          </Pressable>

          <Text style={styles.privacyHint}>
            이름과 연락처는 공개되지 않으며,{"\n"}
            활동 신청 시 해당 보호소에만 전달돼요.
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <Pressable
            accessibilityLabel="변경 내용 저장"
            accessibilityRole="button"
            onPress={() => router.replace("/10-1")}
            style={styles.saveButton}
          >
            <Text style={styles.saveText}>변경 내용 저장</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="취소"
            accessibilityRole="button"
            onPress={() => router.replace("/10-1")}
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
