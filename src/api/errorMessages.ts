// 오류 코드를 사용자에게 보여 줄 짧은 한국어 문구로 바꾼다.
// 화면의 분기는 항상 코드로 하고, 이 문구로 비교하지 않는다.

export const GENERIC_ERROR_MESSAGE = "문제가 생겼어요. 잠시 후 다시 시도해 주세요.";

const RETRY_LATER = "잠시 후 다시 시도해 주세요.";
const CHECK_NETWORK = "네트워크 상태를 확인해 주세요.";

const MESSAGES: Record<string, string> = {
  // 공통
  NETWORK_ERROR: CHECK_NETWORK,
  TIMEOUT: CHECK_NETWORK,
  TOO_MANY_REQUESTS: RETRY_LATER,
  INTERNAL_SERVER_ERROR: GENERIC_ERROR_MESSAGE,

  // 로그인, 회원가입
  INVALID_CREDENTIALS: "아이디와 비밀번호를 확인해 주세요.",
  ROLE_NOT_ALLOWED: "이 앱은 봉사자 계정으로만 이용할 수 있어요.",
  LOGIN_ID_ALREADY_EXISTS: "이미 사용 중인 아이디예요.",
  NICKNAME_ALREADY_EXISTS: "*중복입니다. 다른 닉네임을 사용해 주세요",
  INVALID_LOGIN_ID_LENGTH: "아이디는 4~20자의 영문과 숫자만 사용할 수 있어요.",
  INVALID_LOGIN_ID_FORMAT: "아이디는 4~20자의 영문과 숫자만 사용할 수 있어요.",
  INVALID_NICKNAME_LENGTH:
    "닉네임은 3~20자의 한글, 영문, 숫자, 밑줄만 사용할 수 있어요.",
  INVALID_NICKNAME_FORMAT:
    "닉네임은 3~20자의 한글, 영문, 숫자, 밑줄만 사용할 수 있어요.",
  INVALID_PASSWORD_LENGTH: "비밀번호 규칙을 확인해 주세요.",
  PASSWORD_UPPERCASE_REQUIRED: "비밀번호 규칙을 확인해 주세요.",
  PASSWORD_LOWERCASE_REQUIRED: "비밀번호 규칙을 확인해 주세요.",
  PASSWORD_NUMBER_REQUIRED: "비밀번호 규칙을 확인해 주세요.",
  PASSWORD_SPECIAL_REQUIRED: "비밀번호 규칙을 확인해 주세요.",
  POLICY_DOCUMENT_UNAVAILABLE: RETRY_LATER,
  POLICY_VERSION_MISMATCH: "약관이 바뀌었어요. 다시 시도해 주세요.",
  AGE_CONFIRMATION_REQUIRED: "만 14세 이상 확인에 동의해 주세요.",
  PRIVACY_CONFIRMATION_REQUIRED: "필수 동의 항목을 확인해 주세요.",
  TERMS_AGREEMENT_REQUIRED: "필수 동의 항목을 확인해 주세요.",
  INVALID_PRIVACY_PAYLOAD: "필수 동의 항목을 확인해 주세요.",

  // 서약
  PLEDGE_VERSION_MISMATCH: "서약 내용이 바뀌었어요. 다시 시도해 주세요.",
  PLEDGE_NOT_ALLOWED: GENERIC_ERROR_MESSAGE,

  // 2-2 기본 정보, 휴대폰 인증
  INVALID_PHONE_NUMBER: "전화번호를 올바르게 입력해 주세요.",
  PHONE_NUMBER_REQUIRED: "전화번호를 올바르게 입력해 주세요.",
  PHONE_VERIFICATION_RATE_LIMITED: RETRY_LATER,
  VERIFICATION_ATTEMPTS_EXCEEDED: RETRY_LATER,
  SMS_DELIVERY_UNAVAILABLE: "인증번호를 보내지 못했어요. 잠시 후 다시 시도해 주세요.",
  PHONE_ALREADY_REGISTERED: "이미 등록된 휴대폰 번호예요.",
  VERIFICATION_EXPIRED: "인증 시간이 지났어요. 다시 요청해 주세요.",
  VERIFICATION_CODE_INVALID: "인증번호가 맞지 않아요.",
  VERIFICATION_NOT_FOUND: "인증을 다시 요청해 주세요.",
  VERIFICATION_ALREADY_CONSUMED: "인증을 다시 요청해 주세요.",
  PHONE_VERIFICATION_REQUIRED: "휴대폰 인증을 완료해 주세요.",
  INVALID_FULL_NAME: "이름은 2~10자로 입력해 주세요.",
  INVALID_BIRTH_DATE: "생년월일을 확인해 주세요.",
  BIRTH_DATE_REQUIRED: "생년월일을 확인해 주세요.",
  AGE_ABOVE_MAXIMUM: "생년월일을 확인해 주세요.",
  AGE_BELOW_MINIMUM: "만 14세 이상만 이용할 수 있어요.",

  // 2-4 반려견 경험
  EXPERIENCED_BREED_REQUIRED: "경험한 견종을 입력해 주세요.",
  INVALID_EXPERIENCED_BREED: "견종 입력을 확인해 주세요.",
  CHALLENGE_NONE_CONFLICT: "어려웠던 상황을 확인해 주세요.",

  // 2-5 산책 루틴
  REGIONS_REQUIRED: "활동 지역을 선택해 주세요.",
  REGION_LIMIT_EXCEEDED: "활동 지역은 최대 3개까지 선택할 수 있어요.",
  INVALID_REGION_CODE: "활동 지역을 다시 선택해 주세요.",
  TIME_SLOTS_REQUIRED: "산책 가능한 때를 선택해 주세요.",
  REGION_DATA_UNAVAILABLE: RETRY_LATER,

  // 7-x 산책 목록, 신청
  ONBOARDING_NOT_COMPLETED: "온보딩을 먼저 완료해 주세요.",
  AGE_REVIEW_REQUIRED: "나이 확인이 끝난 뒤 이용할 수 있어요.",
  WALK_LIST_NOT_ALLOWED: "이 계정으로는 산책 목록을 볼 수 없어요.",
  INVALID_DOG_SIZE: "강아지 크기 조건을 확인해 주세요.",
  INVALID_PAGINATION: RETRY_LATER,
  INVALID_DOG_ID: "강아지 정보를 불러오지 못했어요.",
  WALK_DOG_NOT_AVAILABLE: "지금은 산책할 수 없는 강아지예요.",
  WALK_REQUEST_NOT_ALLOWED: "산책을 신청할 수 없는 계정이에요.",
  INVALID_WALK_REQUEST: "신청 내용을 확인해 주세요.",
  WALK_SLOT_CHANGED: "선택한 일정이 바뀌었어요. 일정을 다시 선택해 주세요.",
  WALK_SLOT_UNAVAILABLE:
    "이미 신청됐거나 마감된 일정이에요. 다른 일정을 선택해 주세요.",
  WALK_REQUEST_RETRYABLE: RETRY_LATER,
  WALK_REQUEST_CONFLICT:
    "이미 신청했거나 시간이 겹치는 예약이 있어요. 내 예약을 확인해 주세요.",

  // 8-x 내 예약, 취소
  RESERVATION_FILTER_CONFLICT: RETRY_LATER,
  REQUEST_ALREADY_CANCELLED: "이미 취소된 예약이에요.",
  REQUEST_STATE_CONFLICT: "지금 상태에서는 예약을 취소할 수 없어요.",
  CANCEL_TIME_EXPIRED: "예약 시작 시간이 되어 취소할 수 없어요.",
  WALK_RECORD_EXISTS: "산책이 이미 시작되어 취소할 수 없어요.",
  REQUEST_LOCK_CONFLICT: "다른 작업과 겹쳤어요. 잠시 후 다시 시도해 주세요.",

  // 4-x 보호소 코드
  INVALID_SHELTER_CODE_FORMAT: "6자리 숫자 코드를 입력해 주세요.",
  INVALID_WALK_REQUEST_ID: "예약 정보를 확인해 주세요.",
  SHELTER_CODE_INVALID: "코드가 맞지 않거나 만료되었어요.",
  SHELTER_CODE_RATE_LIMITED: "코드를 여러 번 잘못 입력했어요. 잠시 후 다시 입력해 주세요.",
  WALK_REQUEST_NOT_FOUND: "예약을 찾을 수 없어요.",
  WALK_REQUEST_NOT_ELIGIBLE: "지금은 보호소 코드를 사용할 수 없는 예약이에요. 예약 상태를 확인해 주세요.",

  // 4-4 산책 시작
  WALK_START_CODE_REQUIRED: "보호소 코드를 다시 확인해 주세요.",
  WALK_START_BOOKING_NOT_ELIGIBLE: "지금은 산책을 시작할 수 없는 예약이에요.",
  WALK_START_ALREADY_STARTED: "이미 산책 중이에요.",
  WALK_START_RETRYABLE: RETRY_LATER,

  // 5-x 산책 중
  MARKER_LOCATION_UNAVAILABLE: "위치를 확인할 수 없어 저장하지 못했어요. 잠시 후 다시 눌러 주세요.",
  DUPLICATE_RECENT: "방금 같은 유형의 신고를 보냈어요.",
};

export function errorMessage(code: string | null | undefined): string {
  return (code ? MESSAGES[code] : undefined) ?? GENERIC_ERROR_MESSAGE;
}
