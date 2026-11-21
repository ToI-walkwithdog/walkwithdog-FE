import { useFonts } from "expo-font";
import { NotoSansKR_400Regular } from "@expo-google-fonts/noto-sans-kr/400Regular";
import { NotoSansKR_700Bold } from "@expo-google-fonts/noto-sans-kr/700Bold";
import { Urbanist_500Medium } from "@expo-google-fonts/urbanist/500Medium";

import { fontFamilies } from "./typography";
import { localFontSources } from "./localFonts";

export function useAppFonts() {
  return useFonts({
    ...localFontSources,
    [fontFamilies.notoSansKRRegular]: NotoSansKR_400Regular,
    [fontFamilies.notoSansKRBold]: NotoSansKR_700Bold,
    [fontFamilies.urbanistMedium]: Urbanist_500Medium,
  });
}
