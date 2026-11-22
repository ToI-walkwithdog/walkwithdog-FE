import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { PillTextInput } from "../../components/PillTextInput";
import { Screen } from "../../components/Screen";
import { GradientView } from "../../components/GradientView";
import { useMockSession } from "../../context/MockSession";
import WalkMarkerPoop from "../../assets/icons/walk-marker-poop.svg";
import WalkMarkerSniff from "../../assets/icons/walk-marker-sniff.svg";
import WalkRouteEnd from "../../assets/icons/walk-route-end.svg";
import WalkRouteStart from "../../assets/icons/walk-route-start.svg";
import WalkRoute from "../../assets/icons/vector-walk-route-orange.svg";
import { gradientWalkMemoCard, gradientWalkSaveButton } from "../../theme/gradients";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

const walkingMap = require("../../assets/images/walking-map.png");

export default function WalkRecordSaveScreen() {
  const router = useRouter();
  const saving = useRef(false);
  const { saveRecord } = useMockSession();
  const [message, setMessage] = useState("");
  const [messageInputHeight, setMessageInputHeight] = useState(73);

  return (
    <LinearGradient
      colors={[colors.walkBackgroundStart, colors.white]}
      end={{ x: 0, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.background}
    >
      <Screen
        backgroundColor="transparent"
        contentContainerStyle={styles.scrollContent}
        scroll
        safeAreaEdges={[]}
        testID="screen-6-2"
      >
        <View style={styles.root}>
          <View style={styles.titleArea}>
            <Text style={styles.title}>콩이와의 산책</Text>
            <Text style={styles.date}>목업 산책 · 지도와 통계는 예시예요</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.mapArea}>
              <Image
                accessible={false}
                resizeMode="stretch"
                source={walkingMap}
                style={styles.mapImage}
              />
              <LinearGradient
                colors={[colors.mapGradientStart, colors.mapGradientEnd]}
                end={{ x: 0, y: 0 }}
                locations={[0.07266, 0.3048]}
                start={{ x: 0, y: 1 }}
                style={styles.mapFade}
              />
              <View style={styles.mapTint} />
              <WalkRoute style={styles.route} />
              <WalkRouteStart style={styles.routeStart} />
              <WalkRouteEnd style={styles.routeEnd} />

              <View style={[styles.recordMarker, styles.sniffMarker]}>
                <WalkMarkerSniff style={styles.markerIcon} />
              </View>
              <View style={[styles.recordMarker, styles.poopMarker]}>
                <WalkMarkerPoop style={styles.markerIcon} />
              </View>
              <View style={[styles.recordMarker, styles.dogMarker]}>
                <Icon
                  name="icon-dog-body"
                  width={18}
                  height={18}
                  color={colors.brown}
                />
              </View>
              <View style={[styles.recordMarker, styles.photoMarker]}>
                <Icon
                  name="icon-camera"
                  width={18}
                  height={18}
                  color={colors.brown}
                />
              </View>
              <Pressable
                accessibilityLabel="지도 이미지 다운로드"
                accessibilityRole="button"
                onPress={() => Alert.alert("안내", "지도 이미지 다운로드는 아직 연결되지 않았어요.")}
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

          <GradientView token={gradientWalkMemoCard} style={styles.messageCard}>
            <Text style={styles.messageTitle}>작성할 메모 (보호소 미전송)</Text>
            <Text
              accessible={false}
              importantForAccessibility="no"
              onLayout={({ nativeEvent }) => {
                setMessageInputHeight(
                  Math.max(73, Math.ceil(nativeEvent.layout.height) + 28),
                );
              }}
              pointerEvents="none"
              style={[styles.messageText, styles.messageMeasurement]}
              textBreakStrategy="simple"
            >
              {message + "\u200B"}
            </Text>
            <PillTextInput
              accessibilityLabel="보호소 메시지"
              borderColor={colors.white}
              borderRadius={radii.card}
              blurOnSubmit={false}
              height={messageInputHeight}
              multiline
              onChangeText={setMessage}
              paddingHorizontal={14}
              placeholder={
                "콩이에게 하고 싶은 말과\n오늘 특이사항을 자유롭게 남겨주세요! (선택)"
              }
              placeholderColor={colors.brown}
              scrollEnabled={false}
              style={[styles.messageText, styles.messageInput]}
              submitBehavior="newline"
              textBreakStrategy="simple"
              value={message}
            />
          </GradientView>

          <View style={styles.saveArea}>
            <GradientView token={gradientWalkSaveButton} style={styles.saveButton}>
              <Pressable
                accessibilityLabel="산책 기록 저장"
                accessibilityRole="button"
                onPress={() => {
                  if (saving.current) return;
                  saving.current = true;
                  saveRecord(message);
                  router.replace("/9-1");
                }}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>산책 기록 저장</Text>
              </Pressable>
            </GradientView>
          </View>
          <View style={styles.homeIndicatorSpace} />
        </View>
      </Screen>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
  },
  root: {
    alignSelf: "center",
    minHeight: 792,
    width: 375,
  },
  titleArea: {
    alignSelf: "center",
    height: 78,
    position: "relative",
    width: 343,
  },
  title: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.display,
    left: 8,
    lineHeight: 36,
    position: "absolute",
    top: 9,
  },
  date: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.body,
    left: 8,
    lineHeight: 20,
    position: "absolute",
    top: 45,
  },
  card: {
    alignSelf: "center",
    backgroundColor: colors.white,
    borderRadius: radii.large,
    height: 425,
    overflow: "hidden",
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
    opacity: 0.75,
    position: "absolute",
    top: -140,
    width: 343,
  },
  mapFade: {
    height: 600,
    left: 0,
    position: "absolute",
    top: -140,
    width: 343,
  },
  mapTint: {
    backgroundColor: colors.cream,
    height: 332,
    left: 0,
    opacity: 0.25,
    position: "absolute",
    top: 0,
    width: 343,
  },
  route: {
    left: 99.55,
    position: "absolute",
    top: 45.51,
  },
  routeStart: {
    left: 183.5,
    position: "absolute",
    top: 275.5,
  },
  routeEnd: {
    left: 111.77,
    position: "absolute",
    top: 89.84,
  },
  recordMarker: {
    backgroundColor: colors.white,
    borderColor: colors.lightOrange,
    borderRadius: 16,
    borderWidth: 1.5,
    height: 32,
    position: "absolute",
    width: 32,
  },
  sniffMarker: {
    left: 160,
    top: 185,
  },
  poopMarker: {
    left: 78,
    top: 239,
  },
  dogMarker: {
    alignItems: "center",
    justifyContent: "center",
    left: 210,
    top: 132,
  },
  photoMarker: {
    alignItems: "center",
    justifyContent: "center",
    left: 157,
    top: 32,
  },
  markerIcon: {
    left: 5.5,
    position: "absolute",
    top: 5.5,
  },
  downloadButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radii.status,
    height: 40,
    justifyContent: "center",
    left: 287,
    position: "absolute",
    top: 16,
    width: 40,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    height: 93,
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  statBlock: {
    flex: 1,
    flexDirection: "column",
    gap: 5,
    minWidth: 0,
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
    gap: 3,
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
  },
  messageCard: {
    alignSelf: "center",
    minHeight: 153,
    paddingBottom: 20,
    paddingHorizontal: 18,
    paddingTop: 20,
    width: 343,
  },
  messageTitle: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: 18,
    lineHeight: 26,
  },
  messageText: {
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: 13,
    lineHeight: 22,
  },
  messageMeasurement: {
    left: 32,
    opacity: 0,
    position: "absolute",
    top: 74,
    width: 279,
  },
  messageInput: {
    borderWidth: 0,
    marginTop: 14,
    paddingBottom: 14,
    paddingTop: 14,
    textAlignVertical: "top",
    width: 307,
  },
  saveArea: {
    alignItems: "center",
    height: 104,
    padding: 24,
    width: 375,
  },
  saveButton: {
    alignItems: "center",
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
  homeIndicatorSpace: {
    height: 32,
  },
});
