import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAppFonts } from "../src/theme/useAppFonts";
import { MockSessionProvider } from "../src/context/MockSession";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <MockSessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </MockSessionProvider>
    </SafeAreaProvider>
  );
}
