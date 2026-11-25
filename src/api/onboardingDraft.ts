// 온보딩 화면 사이에서 값을 넘기는 메모리 저장소. 디스크에 저장하지 않는다.

type OnboardingDraft = {
  // 2-3의 경험 여부. 2-4에서 한 번에 저장한다.
  hasExperience: boolean | null;
  // 2-5 지역 코드(1~3개). 지역 선택 UI가 생기면 채운다.
  regionCodes: string[];
};

const initialDraft: OnboardingDraft = { hasExperience: null, regionCodes: [] };

let draft: OnboardingDraft = { ...initialDraft };

export function getOnboardingDraft(): OnboardingDraft {
  return draft;
}

export function setHasExperience(value: boolean) {
  draft = { ...draft, hasExperience: value };
}

export function setRegionCodes(codes: string[]) {
  draft = { ...draft, regionCodes: codes };
}

export function clearOnboardingDraft() {
  draft = { ...initialDraft };
}
