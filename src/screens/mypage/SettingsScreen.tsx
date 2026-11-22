import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../components/Icon";
import { Screen } from "../../components/Screen";
import { colors, radii, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <Screen backgroundColor={colors.white} safeAreaEdges={[]}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="뒤로" accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace("/10-1")} style={styles.back}>
            <Icon name="icon-back" width={7.41} height={12} color={colors.brown} />
          </Pressable>
          <Text style={styles.headerTitle}>설정</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>나에게 맞게 설정하개</Text>
          <View style={styles.notice}>
            <Text style={styles.noticeText}>현재 설정은 목업이며 앱 실행 중에만 유지돼요.</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push("/10-2")} style={styles.row}>
            <Text style={styles.rowText}>내 정보 수정</Text>
            <Icon name="vector-next" width={6.9} height={11.84} color={colors.brown2} />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push("/10-3")} style={styles.row}>
            <Text style={styles.rowText}>산책 선호 설정</Text>
            <Icon name="vector-next" width={6.9} height={11.84} color={colors.brown2} />
          </Pressable>
        </View>
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
  notice: { backgroundColor: colors.cream, borderRadius: radii.card, marginTop: 20, padding: 16 },
  noticeText: { color: colors.brown, fontFamily: fontFamilies.nanumSquareRoundRegular, fontSize: typography.fontSizes.body, lineHeight: 21 },
  row: { alignItems: "center", borderBottomColor: colors.cream, borderBottomWidth: 1, flexDirection: "row", height: 64, justifyContent: "space-between" },
  rowText: { color: colors.brown, fontFamily: fontFamilies.nanumSquareRoundBold, fontSize: typography.fontSizes.mediumTitle },
});
