import type { FontSource } from "expo-font";

import { fontFamilies } from "./typography";

type LocalFontFamily =
  | typeof fontFamilies.pretendardRegular
  | typeof fontFamilies.pretendardMedium
  | typeof fontFamilies.gumiRomance
  | typeof fontFamilies.nanumSquareRoundRegular
  | typeof fontFamilies.nanumSquareRoundBold
  | typeof fontFamilies.nanumSquareRoundExtraBold;

export const localFontSources: Record<LocalFontFamily, FontSource> = {
  [fontFamilies.pretendardRegular]: require("../assets/fonts/Pretendard-Regular.otf"),
  [fontFamilies.pretendardMedium]: require("../assets/fonts/Pretendard-Medium.otf"),
  [fontFamilies.gumiRomance]: require("../assets/fonts/GumiRomance-Regular.ttf"),
  [fontFamilies.nanumSquareRoundRegular]: require(
    "../assets/fonts/NanumSquareRoundR.ttf",
  ),
  [fontFamilies.nanumSquareRoundBold]: require(
    "../assets/fonts/NanumSquareRoundB.ttf",
  ),
  [fontFamilies.nanumSquareRoundExtraBold]: require(
    "../assets/fonts/NanumSquareRoundEB.ttf",
  ),
};
