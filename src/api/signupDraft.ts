// 1-4(개인정보 처리방침)에서 1-3(회원가입)으로 동의 결과를 넘기는 메모리 저장소.
// 저장하지 않고 가입 성공 시 비운다.

type SignupDraft = {
  policyVersion: string | null;
  ageConfirmed: boolean;
  collectionUseAgreed: boolean;
};

const initialDraft: SignupDraft = {
  policyVersion: null,
  ageConfirmed: false,
  collectionUseAgreed: false,
};

let draft: SignupDraft = { ...initialDraft };

export function getSignupDraft(): SignupDraft {
  return draft;
}

export function setPolicyVersion(version: string | null) {
  draft = { ...draft, policyVersion: version };
}

// 1-4 체크박스 순서: [개인정보 수집·이용, 산책 책임, 만 14세 이상 및 약관 확인]
// 산책 책임 항목에 대응하는 BE 필드가 없다(unverified 매핑).
export function setConsentFromChecks(checked: boolean[]) {
  draft = {
    ...draft,
    collectionUseAgreed: checked[0] === true,
    ageConfirmed: checked[2] === true,
  };
}

export function clearSignupDraft() {
  draft = { ...initialDraft };
}
