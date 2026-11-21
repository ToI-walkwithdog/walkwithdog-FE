import { useState } from "react";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { gradientButtonWarm, gradientCardCream } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const walkingMap = require("../../assets/images/walking-map.png");

export default function WalkRecordSaveScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  return (
    <Screen
      backgroundColor={colors.walkBackgroundStart}
      contentContainerStyle={styles.scrollContent}
      scroll
      safeAreaEdges={[]}
      testID="screen-6-2"
    >
      <View style={styles.root}>
        <Text style={styles.title}>콩이와의 산책</Text>
        <Text style={styles.date}>2026.11.21 (토) 오후 3:20</Text>

        <View style={styles.card}>
          <View style={styles.mapArea}>
            <Image
              accessible={false}
              resizeMode="cover"
              source={walkingMap}
              style={styles.mapImage}
            />
            <Pressable
              accessibilityLabel="지도 이미지 다운로드"
              accessibilityRole="button"
              onPress={() => console.log("지도 이미지 다운로드 tapped")}
              style={styles.downloadButton}
            >
              <Icon
                name="icon-download"
                size={24}
                width={24}
                height={24}
                color={colors.brown}
              />
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>총 시간</Text>
              <Text style={styles.timeValue}>32:15</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>거리</Text>
              <View style={styles.valueWithUnit}>
                <Text style={styles.distanceValue}>2.4</Text>
                <Text style={styles.orangeUnit}>km</Text>
              </View>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>평균 속도</Text>
              <View style={styles.valueWithUnit}>
                <Text style={styles.speedValue}>4.5</Text>
                <Text style={styles.orangeUnit}>km/h</Text>
              </View>
            </View>
          </View>
        </View>

        <GradientView token={gradientCardCream} style={styles.messageCard}>
          <Text style={styles.messageTitle}>콩이와 보호소에게 남기는 말</Text>
          <PillTextInput
            accessibilityLabel="보호소 메시지"
            borderColor={colors.white}
            borderRadius={radii.card}
            fontFamily={fontFamilies.nanumSquareRoundRegular}
            fontSize={13}
            height={73}
            multiline
            onChangeText={setMessage}
            paddingHorizontal={14}
            placeholder={
              "콩이에게 하고 싶은 말과\n오늘 특이사항을 자유롭게 남겨주세요! (선택)"
            }
            placeholderColor={colors.brown}
            style={styles.messageInput}
            value={message}
          />
        </GradientView>

        <View style={styles.saveArea}>
          <GradientView token={gradientButtonWarm} style={styles.saveButton}>
          <Pressable
            accessibilityLabel="산책 기록 저장"
            accessibilityRole="button"
            onPress={() => router.replace("/6-3")}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>산책 기록 저장</Text>
          </Pressable>
          </GradientView>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    minHeight: 836,
  },
  root: {
    alignSelf: "center",
    height: 836,
    width: 375,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.display,
    left: 24,
    lineHeight: 36,
    position: "absolute",
    top: 52,
  },
  date: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    left: 24,
    lineHeight: 20,
    position: "absolute",
    top: 91,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.large,
    height: 425,
    left: 16,
    overflow: "hidden",
    position: "absolute",
    top: 122,
    width: 343,
  },
  mapArea: {
    backgroundColor: colors.cream,
    height: 332,
    overflow: "hidden",
    width: 343,
  },
  mapImage: {
    height: 600,
    left: 0,
    position: "absolute",
    top: -140,
    width: 343,
  },
  downloadButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    position: "absolute",
    right: 16,
    top: 16,
    width: 40,
  },
  statsRow: {
    flexDirection: "row",
    height: 93,
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  statBlock: {
    flex: 1,
  },
  statLabel: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.small,
    lineHeight: 18,
  },
  timeValue: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 30,
    lineHeight: 38,
  },
  valueWithUnit: {
    alignItems: "baseline",
    flexDirection: "row",
  },
  distanceValue: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 30,
    lineHeight: 38,
  },
  speedValue: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 30,
    lineHeight: 38,
  },
  orangeUnit: {
    color: colors.deepOrange,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: 11,
    lineHeight: 18,
    marginLeft: 3,
  },
  messageCard: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: 22,
    height: 153,
    left: 16,
    paddingHorizontal: 18,
    paddingTop: 20,
    position: "absolute",
    top: 565,
    width: 343,
  },
  messageTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 18,
    lineHeight: 26,
  },
  messageInput: {
    marginTop: 14,
    width: 307,
  },
  saveArea: {
    alignItems: "center",
    left: 24,
    position: "absolute",
    top: 756,
    width: 327,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 327,
  },
  saveButtonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 18,
    lineHeight: 26,
  },
});
