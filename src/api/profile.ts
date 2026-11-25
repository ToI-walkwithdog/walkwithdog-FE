import { api } from "./client";

// GET /users/me/profile (봉사자 본인만). 본문은 {code, data, message}이고 data만 돌려받는다.
// 온보딩 Step 1 전이면 full_name과 phone_number는 null이다.
export type Profile = {
  nickname: string;
  full_name: string | null;
  // 인증된 번호. 국내 표기 원문("010-1234-5678")이다.
  phone_number: string | null;
  phone_verified_at: string | null;
  profile_version: number;
};

export function fetchProfile() {
  return api.get<Profile>("/users/me/profile");
}

// PATCH /users/me/profile. expected_profile_version은 필수이고, 보내지 않은 필드는 바뀌지 않는다.
// 빈 값과 null은 422다(비워서 지울 수 없다). 번호를 바꾸려면 프로필용 인증을 마친 phone_verification_id가 필요하다.
// 409: PROFILE_VERSION_MISMATCH, NICKNAME_ALREADY_EXISTS, PHONE_VERIFICATION_REQUIRED,
// PHONE_ALREADY_REGISTERED, PROFILE_BASIC_INFO_REQUIRED
export type ProfilePatch = {
  expected_profile_version: number;
  nickname?: string;
  full_name?: string;
  phone_number?: string;
  phone_verification_id?: string;
};

export type ProfileSaved = Profile & { changed_fields: string[] };

export function patchProfile(body: ProfilePatch) {
  return api.patch<ProfileSaved>("/users/me/profile", body);
}

// 번호 변경용 인증은 온보딩 인증과 다른 경로를 쓴다(/users/me/profile/phone-verifications).
// 확인만으로는 번호가 바뀌지 않고, 위 PATCH로 저장할 때만 바뀐다. 인증은 확인 뒤 15분 안에 저장해야 한다.
export type ProfilePhoneVerificationSent = {
  verification_id: string;
  expires_in_seconds: number;
  resend_after_seconds: number;
};

export function sendProfilePhoneVerification(phoneNumber: string) {
  return api.post<ProfilePhoneVerificationSent>("/users/me/profile/phone-verifications", {
    phone_number: phoneNumber,
  });
}

export function confirmProfilePhoneVerification(verificationId: string, code: string) {
  return api.post<{ verified: boolean; verified_at: string }>(
    "/users/me/profile/phone-verifications/confirm",
    { verification_id: verificationId, code },
  );
}
