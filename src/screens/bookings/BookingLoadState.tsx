import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ApiFailure } from "../../api/client";
import { bookingFailureMessage } from "../../api/myBookings";
import { Screen } from "../../components/Screen";
import { colors, typography } from "../../theme/tokens";
import { fontFamilies } from "../../theme/typography";

// 예약 상세를 불러오는 동안이나 실패했을 때 8-x 화면이 같이 쓰는 안내 화면이다.
export function BookingLoadState({
  failure,
  onRetry,
  testID,
}: {
  failure: ApiFailure | null;
  onRetry: () => void;
  testID: string;
}) {
  const router = useRouter();
  return (
    <Screen backgroundColor={colors.white} safeAreaEdges={[]} testID={testID}>
      <View style={styles.root}>
        {failure ? (
          <>
            <Text style={styles.text}>{bookingFailureMessage(failure)}</Text>
            <Pressable
              accessibilityLabel="다시 시도"
              accessibilityRole="button"
              onPress={onRetry}
              style={styles.retry}
            >
              <Text style={styles.buttonText}>다시 시도</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="예약 목록으로"
              accessibilityRole="button"
              onPress={() => router.replace("/8-1")}
              style={styles.list}
            >
              <Text style={styles.buttonText}>예약 목록으로</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.text}>불러오는 중...</Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: "center", flex: 1, justifyContent: "center", width: "100%" },
  text: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
    lineHeight: 22,
    textAlign: "center",
    width: 300,
  },
  retry: {
    alignItems: "center",
    backgroundColor: colors.midLightOrange,
    borderRadius: 27,
    height: 44,
    justifyContent: "center",
    marginTop: 16,
    width: 200,
  },
  list: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 27,
    height: 44,
    justifyContent: "center",
    marginTop: 8,
    width: 200,
  },
  buttonText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.bodyLarge,
  },
});
