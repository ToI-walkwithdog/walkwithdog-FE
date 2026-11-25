// 회원가입 입력 규칙. BE의 app/account_rules.py와 같은 값을 유지한다.
// 규칙이 바뀌면 이 파일만 고친다.

export const LOGIN_ID_MIN_LENGTH = 4;
export const LOGIN_ID_MAX_LENGTH = 20;
export const NICKNAME_MIN_LENGTH = 3;
export const NICKNAME_MAX_LENGTH = 20;
export const PASSWORD_MIN_LENGTH = 15;
export const PASSWORD_MAX_LENGTH = 128;

const LOGIN_ID_PATTERN = /^[A-Za-z0-9]+$/;
const NICKNAME_PATTERN = /^[가-힣A-Za-z0-9_]+$/;
// Python string.punctuation과 같은 ASCII 문장부호만 특수문자로 센다.
const PASSWORD_SPECIAL_CHARACTERS = new Set(
  "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
);

// BE는 문자 수(코드 포인트)로 길이를 센다.
function lengthOf(value: string) {
  return Array.from(value).length;
}

export function isValidLoginId(value: string) {
  const length = lengthOf(value);
  return (
    length >= LOGIN_ID_MIN_LENGTH &&
    length <= LOGIN_ID_MAX_LENGTH &&
    LOGIN_ID_PATTERN.test(value)
  );
}

export function isValidNickname(value: string) {
  const length = lengthOf(value);
  return (
    length >= NICKNAME_MIN_LENGTH &&
    length <= NICKNAME_MAX_LENGTH &&
    NICKNAME_PATTERN.test(value)
  );
}

export function isValidPassword(value: string) {
  const characters = Array.from(value);
  return (
    characters.length >= PASSWORD_MIN_LENGTH &&
    characters.length <= PASSWORD_MAX_LENGTH &&
    characters.some((c) => c >= "A" && c <= "Z") &&
    characters.some((c) => c >= "a" && c <= "z") &&
    characters.some((c) => c >= "0" && c <= "9") &&
    characters.some((c) => PASSWORD_SPECIAL_CHARACTERS.has(c))
  );
}

export const FULL_NAME_MIN_LENGTH = 2;
export const FULL_NAME_MAX_LENGTH = 10;

// 010 휴대전화만 허용한다(BE normalize_phone과 같은 형식).
const PHONE_PATTERN = /^010-?\d{4}-?\d{4}$/;

export function isValidPhoneNumber(value: string) {
  return PHONE_PATTERN.test(value.trim());
}

export function isValidFullName(value: string) {
  const name = value.normalize("NFC").trim();
  const length = lengthOf(name);
  return (
    length >= FULL_NAME_MIN_LENGTH &&
    length <= FULL_NAME_MAX_LENGTH &&
    // eslint-disable-next-line no-control-regex
    !/[\u0000-\u001f\u007f-\u009f]/.test(name)
  );
}

// 생년월일 입력은 YYYY.MM.DD로 보여 주고 서버에는 YYYY-MM-DD로 보낸다.
export function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}.${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
}

export function isValidBirthDate(value: string) {
  const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12) {
    return false;
  }

  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  if (day < 1 || day > daysInMonth[month - 1]) {
    return false;
  }

  const today = new Date();
  return (
    year < today.getFullYear() ||
    (year === today.getFullYear() &&
      (month < today.getMonth() + 1 ||
        (month === today.getMonth() + 1 && day <= today.getDate())))
  );
}

export function toApiBirthDate(value: string) {
  return value.replace(/\./g, "-");
}
