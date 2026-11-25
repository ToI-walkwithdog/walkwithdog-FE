import { useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, typography } from "../theme/tokens";
import { fontFamilies } from "../theme/typography";

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  height?: number;
  children?: ReactNode;
};

const DISMISS_DISTANCE = 80;

// 걷기 화면의 신고 시트와 같은 모양(딤 레이어, 하단 고정 시트, 핸들, 슬라이드업)이다.
export function BottomSheet({
  visible,
  onClose,
  title,
  height = 460,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (!visible) return;
    translateY.setValue(height);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [height, translateY, visible]);

  // 핸들을 아래로 끌면 닫힌다.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_event, gesture) => {
          if (gesture.dy > 0) translateY.setValue(gesture.dy);
        },
        onPanResponderRelease: (_event, gesture) => {
          if (gesture.dy > DISMISS_DISTANCE) {
            onClose();
          } else {
            Animated.timing(translateY, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [onClose, translateY],
  );

  if (!visible) return null;

  return (
    <>
      <Pressable
        accessibilityLabel="시트 닫기"
        accessibilityRole="button"
        onPress={onClose}
        style={styles.dimLayer}
      />
      <Animated.View
        style={[
          styles.sheet,
          { height: height + insets.bottom, transform: [{ translateY }] },
        ]}
      >
        <View style={styles.handleArea} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <View style={[styles.content, { paddingBottom: insets.bottom }]}>
          {children}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  dimLayer: {
    backgroundColor: "rgba(64,43,26,0.36)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 50,
  },
  sheet: {
    alignItems: "center",
    backgroundColor: colors.cardGradientStart,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 51,
  },
  handleArea: {
    alignItems: "center",
    height: 30,
    justifyContent: "center",
    width: 375,
  },
  handle: {
    backgroundColor: colors.mildLightBrown,
    borderRadius: 2,
    height: 4,
    width: 42,
  },
  title: {
    alignSelf: "flex-start",
    color: colors.brown,
    fontFamily: fontFamilies.nanumSquareRoundExtraBold,
    fontSize: typography.fontSizes.screenHeading,
    lineHeight: 34,
    marginLeft: 24,
    marginTop: 8,
  },
  content: {
    flex: 1,
    marginTop: 12,
    width: 375,
  },
});
