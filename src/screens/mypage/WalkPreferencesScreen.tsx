import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function WalkPreferencesScreen() {
  const router = useRouter();
  const [duration, setDuration] = useState("30분 이내");
  const [size, setSize] = useState("소형견");

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
            onPress={() => router.replace("/10-1")}
            style={styles.backButton}
          >
            <Icon name="icon-back" size={24} width={7.41} height={12} color={colors.brown} />
          </Pressable>
          <Text style={styles.headerTitle}>산책 선호 설정</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>나에게 맞게 산책하개</Text>
          <Text style={styles.subtitle}>검색 필터의 기본값으로 사용돼요 :)</Text>

          <Text style={styles.fieldLabel}>기본 활동 지역</Text>
          <View style={styles.regionField}>
            <Text style={styles.regionText}>서울 성북구</Text>
            <Icon name="icon-expand-more" size={24} width={24} height={24} color={colors.brown2} />
          </View>
          <Text style={styles.regionHint}>상세 주소 없이 방문할 지역만 선택해요.</Text>

          <Text style={styles.fieldLabel}>선호 산책 시간</Text>
          {["30분 이내", "30분 ~ 1시간", "1시간 이상"].map((item) => (
            <Pressable
              accessibilityLabel={item}
              accessibilityRole="button"
              accessibilityState={{ selected: duration === item }}
              key={item}
              onPress={() => setDuration(item)}
              style={[
                styles.durationButton,
                duration === item
                  ? styles.durationSelected
                  : styles.durationUnselected,
              ]}
            >
              <Text style={styles.optionText}>{item}</Text>
            </Pressable>
          ))}

          <Text style={styles.sizeTitle}>편하게 산책할 수 있는 크기</Text>
          <View style={styles.sizeRow}>
            {["소형견", "중형견", "대형견"].map((item) => (
              <Pressable
                accessibilityLabel={item}
                accessibilityRole="button"
                accessibilityState={{ selected: size === item }}
                key={item}
                onPress={() => setSize(item)}
                style={[
                  styles.sizeButton,
                  size === item
                    ? styles.sizeSelected
                    : styles.sizeUnselected,
                ]}
              >
                <Text style={styles.optionText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityLabel="선호 설정 저장"
          accessibilityRole="button"
          onPress={() => router.replace("/10-1")}
          style={styles.saveButton}
        >
          <Text style={styles.saveText}>선호 설정 저장</Text>
        </Pressable>
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
