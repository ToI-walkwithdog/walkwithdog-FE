export type GradientToken = {
  colors: readonly [string, string, ...string[]];
  locations: readonly [number, number, ...number[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
  radius: number;
};

// TODO: verify direction in Figma
export const gradientCardCream: GradientToken = {
  colors: ["#FFFAF5", "#FEF6E6"],
  locations: [0, 1],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
  radius: 16,
};

// TODO: verify direction in Figma
export const gradientButtonWarm: GradientToken = {
  colors: ["#FFD59C", "#FFBA5D"],
  locations: [0, 1],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
  radius: 27,
};

// TODO: verify direction in Figma
export const gradientHomeBookingCta: GradientToken = {
  colors: ["#FFCE8C", "rgba(253,232,201,0.39)"],
  locations: [0, 1],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
  radius: 40,
};

// TODO: verify direction in Figma
export const gradientHomeBookingStatus: GradientToken = {
  colors: ["#FFCC87", "#FFE8C9"],
  locations: [0, 1],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
  radius: 13,
};

// TODO: verify direction in Figma
export const gradientWalkMemoCard: GradientToken = {
  ...gradientCardCream,
  radius: 22,
};

// TODO: verify direction in Figma
export const gradientWalkSaveButton: GradientToken = {
  ...gradientButtonWarm,
  radius: 28,
};

// TODO: verify direction in Figma
export const gradientLevelUpButton: GradientToken = {
  ...gradientButtonWarm,
  radius: 27.5,
};

// TODO: verify direction in Figma
export const gradientPaw: GradientToken = {
  colors: ["#CC975C", "#84521A"],
  locations: [0, 1],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
  radius: 0,
};

// 마이페이지 요약 카드(아래쪽 #FFE4C0에서 위쪽 투명하게). Figma 10-1.
export const gradientMyPageSummary: GradientToken = {
  colors: ["rgba(253,238,201,0.39)", "#FFE4C0"],
  locations: [0, 1],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
  radius: 24,
};

// 마이페이지 메뉴 아이콘 배지. Figma 10-1.
export const gradientMyPageBadge: GradientToken = {
  ...gradientCardCream,
  radius: 13,
};
