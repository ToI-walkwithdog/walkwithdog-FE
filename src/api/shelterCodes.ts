import { api } from "./client";

// POST /walk-requests/{id}/shelter-code/verify 200의 data. 코드는 6자리 숫자 문자열(앞자리 0 유지)이다.
export type ShelterCodeVerified = {
  request_id: number;
  // 이 시각 전에 POST /walks로 시작해야 한다(발급 10분 뒤와 예약 종료 중 빠른 시각).
  verified_until: string;
};

// 오류는 {code, message, data?} 형식이다. 422 SHELTER_CODE_INVALID, 429 SHELTER_CODE_RATE_LIMITED
// (data.retry_after_seconds)는 실패 횟수에 들어간다.
export function verifyShelterCode(requestId: number, shelterCode: string) {
  return api.post<ShelterCodeVerified>(
    `/walk-requests/${requestId}/shelter-code/verify`,
    { shelter_code: shelterCode },
  );
}
