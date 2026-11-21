import { fonts, typography as typographyTokens } from "./tokens";

export const fontFamilies = {
  pretendardRegular: "Pretendard-Regular",
  pretendardMedium: "Pretendard-Medium",
  gumiRomance: "GumiRomance-Regular",
  notoSansKRRegular: "NotoSansKR-Regular",
  notoSansKRBold: "NotoSansKR-Bold",
  nanumSquareRoundRegular: "NanumSquareRound-Regular",
  nanumSquareRoundBold: "NanumSquareRound-Bold",
  nanumSquareRoundExtraBold: "NanumSquareRound-ExtraBold",
  urbanistMedium: "Urbanist-Medium",
} as const;

export type TextStyleName = keyof typeof typographyTokens.fontSizes;
export type FontWeightName = keyof typeof typographyTokens.fontWeights;

export const fontFamilyByWeight: Record<FontWeightName, string> = {
  regular: fontFamilies.pretendardRegular,
  medium: fontFamilies.pretendardMedium,
  bold: fontFamilies.nanumSquareRoundBold,
  extraBold: fontFamilies.nanumSquareRoundExtraBold,
};

export const textStyles = {
  caption: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.caption,
  },
  small: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.small,
  },
  smallBody: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.smallBody,
  },
  body: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.body,
  },
  bodyLarge: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.bodyLarge,
  },
  subtitle: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.subtitle,
  },
  mediumTitle: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.mediumTitle,
  },
  title: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.title,
  },
  sectionTitle: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.sectionTitle,
  },
  screenHeading: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.screenHeading,
  },
  permissionHeading: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.permissionHeading,
  },
  permissionSubheading: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.permissionSubheading,
  },
  largeTitle: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.largeTitle,
  },
  display: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.display,
  },
  greeting: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.greeting,
  },
  stepLabel: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.stepLabel,
  },
  navigationLabel: {
    fontFamily: fontFamilies.pretendardRegular,
    fontSize: typographyTokens.fontSizes.navigationLabel,
  },
} as const satisfies Record<
  TextStyleName,
  { fontFamily: string; fontSize: number }
>;

export const fontWeights = typographyTokens.fontWeights;
export const fontFaces = fonts;
