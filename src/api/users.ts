import { api } from "./client";

type Availability = { available: boolean };

export type PrivacyPolicy = {
  kind: string;
  title: string;
  document_version: string;
  effective_at: string;
  content_format: string;
  content: string;
};

// privacy는 추가 키 없이, 모든 값이 JSON boolean이어야 한다.
export type PrivacyConsent = {
  document_version: string;
  age_14_plus_confirmed: boolean;
  collection_use_agreed: boolean;
  ai_overseas_transfer_agreed: boolean;
};

export type RegisterBody = {
  login_id: string;
  nickname: string;
  password: string;
  privacy: PrivacyConsent;
};

type RegisteredUser = {
  id: number | string;
  login_id: string;
  nickname: string;
  role: string;
  shelter_id: number | string | null;
};

type PledgeData = {
  pledge_completed: boolean;
  pledge_version: string;
  acknowledged_at: string;
};

export function checkIdAvailability(loginId: string) {
  return api.get<Availability>(
    `/users/id-availability?login_id=${encodeURIComponent(loginId)}`,
    { auth: false },
  );
}

export function checkNicknameAvailability(nickname: string) {
  return api.get<Availability>(
    `/users/nickname-availability?nickname=${encodeURIComponent(nickname)}`,
    { auth: false },
  );
}

export function fetchPrivacyPolicy() {
  return api.get<PrivacyPolicy>("/policies/privacy", { auth: false });
}

export function registerUser(body: RegisterBody) {
  return api.post<RegisteredUser>("/users/", body, { auth: false });
}

export function savePledge(pledgeVersion: string) {
  return api.put<PledgeData>("/users/me/pledge", {
    pledge_version: pledgeVersion,
  });
}

export function fetchPolicyDocument(kind: "terms" | "privacy") {
  return api.get<PrivacyPolicy>(`/policies/${kind}`, { auth: false });
}

export type AgeReviewResult = {
  account_status: string;
  age_review_required: boolean;
  step1_completed: boolean;
  next_onboarding_step: string | null;
};

export function correctBirthDate(birthDate: string) {
  return api.put<AgeReviewResult>("/users/me/age-review/birth-date", {
    birth_date: birthDate,
  });
}
