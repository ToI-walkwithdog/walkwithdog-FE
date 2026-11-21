import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAppFonts } from "../theme/useAppFonts";

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
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
