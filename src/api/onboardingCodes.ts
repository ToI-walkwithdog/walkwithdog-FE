// 온보딩 화면의 선택 라벨을 BE 코드로 바꾸는 표. BE 값은 app/models.py의 코드 목록과 같다.

export const EXPERIENCE_DOG_SIZE_CODES: Record<string, string> = {
  소형견: "SMALL",
  중형견: "MEDIUM",
  대형견: "LARGE",
};

export const WALKING_FREQUENCY_CODES: Record<string, string> = {
  "거의 매일": "DAILY",
  "주 3~4회": "WEEKLY_3_4",
  "주 1~2회": "WEEKLY_1_2",
  "거의 없음": "RARELY",
};

export const DIFFICULTY_CODES: Record<string, string> = {
  수월했어요: "EASY",
  보통이었어요: "NORMAL",
  어려웠어요: "HARD",
};

export const CHALLENGE_NONE_LABEL = "특별히 없음";
export const CHALLENGE_CODES: Record<string, string> = {
  "줄 당김": "LEASH_PULLING",
  "짖음·흥분": "BARKING_EXCITEMENT",
  "다른 개 반응": "OTHER_DOG_REACTION",
  [CHALLENGE_NONE_LABEL]: "NONE",
};

export const TIME_SLOT_CODES: Record<string, string> = {
  "평일 오전": "WEEKDAY_MORNING",
  "평일 오후": "WEEKDAY_AFTERNOON",
  "주말 오전": "WEEKEND_MORNING",
  "주말 오후": "WEEKEND_AFTERNOON",
};

export const WALKING_DURATION_CODES: Record<string, string> = {
  "30분 이내": "UP_TO_30_MIN",
  "30분 ~ 1시간": "BETWEEN_30_AND_60_MIN",
  "1시간 이상": "OVER_60_MIN",
};

// kg 경계는 BE 정책이 정해지지 않았다(unverified).
export const COMFORTABLE_DOG_SIZE_CODES: Record<string, string> = {
  "소형견 (10kg 미만)": "SMALL",
  "중형견 (10~25kg)": "MEDIUM",
  "대형견 (25kg 이상)": "LARGE",
};
