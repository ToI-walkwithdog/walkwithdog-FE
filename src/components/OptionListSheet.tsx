import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radii, typography } from "../theme/tokens";
import { fontFamilies } from "../theme/typography";
import { BottomSheet } from "./BottomSheet";

export type SheetOption = { code: string; name: string };

type OptionListSheetProps = {
  visible: boolean;
  title: string;
  options: SheetOption[] | null;
  loading: boolean;
  failed: boolean;
  selectedCode: string | null;
  onSelect: (option: SheetOption) => void;
  onRetry: () => void;
  onClose: () => void;
};

// 선택 목록을 보여 주는 하단 시트. 선택된 행은 선택된 칩과 같은 색이다.
export function OptionListSheet({
  visible,
  title,
  options,
  loading,
  failed,
  selectedCode,
  onSelect,
  onRetry,
  onClose,
}: OptionListSheetProps) {
  return (
    <BottomSheet visible={visible} title={title} onClose={onClose}>
      {loading ? (
        <View style={styles.center}>
          <Text style={styles.stateText}>불러오는 중...</Text>
        </View>
      ) : failed || !options ? (
        <View style={styles.center}>
          <Text style={styles.stateText}>목록을 불러오지 못했어요.</Text>
          <Pressable
            accessibilityLabel="다시 시도"
            accessibilityRole="button"
            onPress={onRetry}
          >
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {options.map((option) => {
            const selected = option.code === selectedCode;
            return (
              <Pressable
                key={option.code}
                accessibilityLabel={option.name}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onSelect(option)}
                style={[styles.row, selected && styles.selectedRow]}
              >
                <Text style={[styles.rowText, selected && styles.selectedText]}>
                  {option.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  stateText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.subtitle,
  },
  retryText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundBold,
    fontSize: typography.fontSizes.subtitle,
    textDecorationLine: "underline",
  },
  list: {
    gap: 8,
    paddingBottom: 24,
    paddingHorizontal: 30,
  },
  row: {
    backgroundColor: colors.white,
    borderColor: colors.lightOrange,
    borderRadius: radii.chip,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  selectedRow: {
    backgroundColor: colors.lightOrange,
  },
  rowText: {
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundRegular,
    fontSize: typography.fontSizes.subtitle,
  },
  selectedText: {
    fontFamily: fontFamilies.nanumSquareRoundBold,
  },
});
