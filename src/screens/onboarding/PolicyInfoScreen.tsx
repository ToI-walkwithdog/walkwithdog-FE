import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function PolicyInfoScreen() {
  const router = useRouter();
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const title = kind === "terms" ? "이용약관" : "개인정보 수집·이용";
  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/2-5");
  };

  return (
    <Screen backgroundColor={colors.white} safeAreaEdges={[]}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="뒤로" accessibilityRole="button" onPress={close} style={styles.back}>
            <Icon name="icon-back" width={7.41} height={12} color={colors.brown} />
          </Pressable>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>내용을 준비하고 있어요</Text>
          <View style={styles.card}>
            <Text style={styles.text}>
              실제 {title} 문서가 아직 연결되지 않았어요. 현재 동의는 목업 화면 확인용이며 실제 동의로 저장되지 않아요.
            </Text>
          </View>
        </View>
        <Pressable accessibilityLabel="닫기" accessibilityRole="button" onPress={close} style={styles.close}>
          <Text style={styles.closeText}>닫기</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: "100%" },
  header: { alignItems: "center", alignSelf: "center", flexDirection: "row", height: 56, paddingHorizontal: 16, width: 375 },
  back: { alignItems: "center", height: 24, justifyContent: "center", width: 24 },
  headerTitle: { color: colors.brown, fontFamily: fontFamilies.nanumSquareRoundBold, fontSize: 18, marginLeft: 12 },
  body: { alignSelf: "center", paddingHorizontal: 20, paddingTop: 12, width: 375 },
  title: { color: colors.brown, fontFamily: fontFamilies.nanumSquareRoundExtraBold, fontSize: 25 },
  card: { backgroundColor: colors.cream, borderRadius: radii.card, marginTop: 20, padding: 16 },
  text: { color: colors.brown, fontFamily: fontFamilies.nanumSquareRoundRegular, fontSize: typography.fontSizes.body, lineHeight: 21 },
  close: { alignItems: "center", alignSelf: "center", backgroundColor: colors.midLightOrange, borderRadius: 27, bottom: 28, height: 49, justifyContent: "center", position: "absolute", width: 335 },
  closeText: { color: colors.brown, fontFamily: fontFamilies.nanumSquareRoundBold, fontSize: typography.fontSizes.mediumTitle },
});
