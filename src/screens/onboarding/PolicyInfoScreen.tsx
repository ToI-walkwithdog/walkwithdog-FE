import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { PolicyContent } from "../../components/PolicyContent";
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
          <View style={styles.card}>
            <PolicyContent
              kind={kind === "terms" ? "terms" : "privacy"}
              textColor={colors.brown}
              titleStyle={styles.title}
            />
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
  body: { alignSelf: "center", flex: 1, marginBottom: 105, paddingHorizontal: 20, paddingTop: 12, width: 375 },
  title: { fontFamily: fontFamilies.nanumSquareRoundExtraBold, fontSize: 25, lineHeight: 32 },
  card: { backgroundColor: colors.cream, borderRadius: radii.card, flex: 1, padding: 16 },
  close: { alignItems: "center", alignSelf: "center", backgroundColor: colors.midLightOrange, borderRadius: 27, bottom: 28, height: 49, justifyContent: "center", position: "absolute", width: 335 },
  closeText: { color: colors.brown, fontFamily: fontFamilies.nanumSquareRoundBold, fontSize: typography.fontSizes.mediumTitle },
});
