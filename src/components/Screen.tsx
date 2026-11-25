import type { ReactElement, ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  type RefreshControlProps,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../theme/tokens";

type ScreenProps = {
  children?: ReactNode;
  scroll?: boolean;
  bounces?: boolean;
  alwaysBounceVertical?: boolean;
  backgroundColor?: string;
  safeAreaEdges?: Array<"top" | "right" | "bottom" | "left">;
  contentContainerStyle?: StyleProp<ViewStyle>;
  dismissKeyboardOnTap?: boolean;
  // 당겨서 새로고침. scroll일 때만 쓴다.
  refreshControl?: ReactElement<RefreshControlProps>;
  testID?: string;
};

export function Screen({
  children,
  scroll = false,
  bounces,
  alwaysBounceVertical,
  backgroundColor = colors.white,
  safeAreaEdges = ["top", "right", "bottom", "left"],
  contentContainerStyle,
  dismissKeyboardOnTap = true,
  refreshControl,
  testID,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const content = scroll ? (
    <ScrollView
      alwaysBounceVertical={alwaysBounceVertical}
      bounces={bounces}
      contentContainerStyle={[
        styles.scrollContent,
        contentContainerStyle,
      ]}
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : dismissKeyboardOnTap ? (
    <Pressable
      accessible={false}
      onPress={Keyboard.dismiss}
      style={styles.dismissArea}
    >
      {children}
    </Pressable>
  ) : (
    children
  );

  return (
    <SafeAreaView
      edges={safeAreaEdges}
      style={[styles.safeArea, { backgroundColor }]}
      testID={testID}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.keyboardAvoidingView, { paddingTop: insets.top }]}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  dismissArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
