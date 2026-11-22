import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { GradientView } from "../../components/GradientView";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { gradientButtonWarm } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function OtherReportScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  const submitReport = () => {
    if (!message.trim()) {
      setValidationMessage("메시지를 입력해 주세요.");
      return;
    }

    router.push({ pathname: "/5-6", params: { report: "기타" } });
  };

  const cancelReport = () => router.back();

  return (
    <Screen
      backgroundColor={colors.white}
      safeAreaEdges={[]}
      testID="screen-5-5-other"
    >
      <View style={styles.root}>
        <View style={styles.contentFrame}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="뒤로"
              accessibilityRole="button"
              onPress={cancelReport}
              style={styles.backButton}
            >
              <Icon
                name="icon-back"
                width={11.1563}
                height={17.7662}
                color={colors.brown}
              />
            </Pressable>
            <Text style={styles.headerTitle}>기타 신고</Text>
          </View>

          <Text style={styles.description}>
            보호소에 전달할 메시지를 입력해 주세요.
          </Text>
          <Text style={styles.messageLabel}>전달할 메시지</Text>
          <PillTextInput
            accessibilityLabel="보호소에 전달할 메시지"
            borderColor={colors.lightOrange}
            borderRadius={radii.card}
            fontFamily={fontFamilies.nanumSquareRoundRegular}
            fontSize={typography.fontSizes.bodyLarge}
            height={252}
            multiline
            onChangeText={(value) => {
              setMessage(value);
              setValidationMessage("");
            }}
            paddingHorizontal={16}
            placeholder="메시지를 입력해 주세요."
            placeholderColor={colors.brown2}
            blurOnSubmit={false}
            submitBehavior="newline"
            style={styles.messageInput}
            textAlignVertical="top"
            value={message}
          />
          {validationMessage ? (
            <Text style={styles.validationMessage}>{validationMessage}</Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <GradientView token={gradientButtonWarm} style={styles.sendButton}>
            <Pressable
              accessibilityLabel="전송하기"
              accessibilityRole="button"
              onPress={submitReport}
              style={styles.sendPressable}
            >
              <Text style={styles.sendButtonText}>전송하기</Text>
            </Pressable>
          </GradientView>
          <Pressable
            accessibilityLabel="취소"
            accessibilityRole="button"
            onPress={cancelReport}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
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
    lineHeight: 36,
    marginLeft: 8,
  },
  description: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.bodyLarge,
    left: 20,
    lineHeight: 22,
    position: "absolute",
    top: 78,
    width: 335,
  },
  messageLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
    left: 20,
    lineHeight: 23,
    position: "absolute",
    top: 132,
  },
  messageInput: {
    left: 20,
    paddingVertical: 16,
    position: "absolute",
    textAlignVertical: "top",
    top: 162,
    width: 335,
  },
  validationMessage: {
    color: colors.warning,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.small,
    left: 20,
    lineHeight: 17,
    position: "absolute",
    top: 420,
  },
  actions: {
    alignSelf: "center",
    bottom: 28,
    position: "absolute",
    width: 335,
  },
  sendButton: {
    borderRadius: radii.navigation,
    height: 49,
    width: 335,
  },
  sendPressable: {
    alignItems: "center",
    height: 49,
    justifyContent: "center",
    width: 335,
  },
  sendButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
  cancelButton: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: radii.navigation,
    height: 49,
    justifyContent: "center",
    marginTop: 12,
    width: 335,
  },
  cancelButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.mediumTitle,
  },
});
