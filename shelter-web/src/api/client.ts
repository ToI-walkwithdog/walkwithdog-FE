// 모바일 앱의 src/api/client.ts를 웹용으로 옮긴 복사본이다(폴더 사이 import는 하지 않는다).
// 다른 점: Base URL은 Vite 환경변수, 토큰 저장과 401 처리는 configureApiAuth로 주입한다.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TIMEOUT_MS = 10_000;

export const API_BASE_URL = BASE_URL;

// 서버가 돌려주는 상대 경로(/media/...)를 이미지 주소로 바꾼다. 이미 완전한 주소면 그대로 쓴다.
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export type ApiSuccess<T> = { ok: true; status: number; data: T };
export type ApiFailure = {
  ok: false;
  status: number;
  code: string | null;
  message: string | null;
  data?: unknown;
};
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

type RequestOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
};

// 토큰 저장소와 401 후처리는 client가 알지 못하게 바깥에서 연결한다.
type ApiAuthHooks = {
  getToken: () => string | null;
  // 인증이 필요한 요청이 401을 받았을 때 호출한다(토큰 삭제와 로그인 화면 이동).
  onUnauthorized: (failure: ApiFailure) => void;
};

let authHooks: ApiAuthHooks = { getToken: () => null, onUnauthorized: () => {} };

export function configureApiAuth(hooks: ApiAuthHooks) {
  authHooks = hooks;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// 성공 본문은 두 가지다: 계약형 {code, data, message}와 본문 그대로(legacy 모델).
function unwrap<T>(json: unknown): T {
  if (
    isRecord(json) &&
    !Array.isArray(json) &&
    typeof json.code === "string" &&
    "data" in json
  ) {
    return json.data as T;
  }
  return json as T;
}

// {code,data,message} / {detail: string} / {detail: {code, message}} / {detail: [...]}(422)를 하나로 정규화한다.
// detail은 문자열, 객체, 배열일 수 있으므로 종류를 확인한 뒤에만 code를 읽는다.
function normalizeError(status: number, body: unknown): ApiFailure {
  if (isRecord(body) && !Array.isArray(body)) {
    const detail = body.detail;
    if (typeof detail === "string") {
      return { ok: false, status, code: null, message: detail };
    }
    if (Array.isArray(detail)) {
      return { ok: false, status, code: "VALIDATION_ERROR", message: null, data: detail };
    }
    if (isRecord(detail)) {
      return {
        ok: false,
        status,
        code: typeof detail.code === "string" ? detail.code : null,
        message: typeof detail.message === "string" ? detail.message : null,
        data: detail,
      };
    }
    if (typeof body.code === "string") {
      return {
        ok: false,
        status,
        code: body.code,
        message: typeof body.message === "string" ? body.message : null,
        data: body.data,
      };
    }
  }
  return { ok: false, status, code: null, message: null };
}

// 429의 대기 시간은 브라우저가 Retry-After 헤더를 읽을 수 없어 본문의 값을 쓴다.
// 계약형은 data.retry_after_seconds, legacy는 detail 객체 안에 있다(normalizeError가 data에 담는다).
export function retryAfterSeconds(failure: ApiFailure): number | null {
  if (isRecord(failure.data) && !Array.isArray(failure.data)) {
    const value = failure.data.retry_after_seconds;
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return Math.ceil(value);
    }
  }
  return null;
}

async function request<T>(
  method: string,
  path: string,
  { body, headers, auth = true }: RequestOptions = {},
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const requestHeaders: Record<string, string> = {
      Accept: "application/json",
      ...headers,
    };
    // FormData(multipart)는 브라우저가 boundary가 든 Content-Type을 직접 붙이므로 헤더를 지정하지 않는다.
    const isForm = body instanceof FormData;
    if (body !== undefined && !isForm) {
      requestHeaders["Content-Type"] = "application/json";
    }
    if (auth) {
      const token = authHooks.getToken();
      if (token) requestHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? null : isForm ? body : JSON.stringify(body),
      signal: controller.signal,
    });

    // 본문은 한 번만 읽는다(text 후 직접 파싱). 파싱 실패와 빈 본문을 구분하기 위해서다.
    const text = await response.text();
    let json: unknown = null;
    let parseFailed = false;
    if (text.trim() !== "") {
      try {
        json = JSON.parse(text);
      } catch {
        parseFailed = true;
      }
    }

    if (!response.ok) {
      const failure = normalizeError(response.status, json);
      if (response.status === 401 && auth) authHooks.onUnauthorized(failure);
      return failure;
    }

    // 성공(2xx)인데 JSON이 아닌 본문은 null 성공으로 넘기지 않는다. 주소가 API가 아닌 서버(Vite 등)를
    // 가리킬 때 HTML 200이 오는 경우가 대표적이다.
    if (parseFailed) {
      const type = response.headers.get("content-type") ?? "unknown";
      return {
        ok: false,
        status: response.status,
        code: "INVALID_RESPONSE",
        message: `JSON이 아닌 응답(${type}): ${text.slice(0, 80)}`,
      };
    }

    if (text.trim() === "") {
      return { ok: true, status: response.status, data: undefined as T };
    }

    return { ok: true, status: response.status, data: unwrap<T>(json) };
  } catch (error) {
    // CORS 차단과 서버 꺼짐은 브라우저에서 모두 TypeError로 보이므로 NETWORK_ERROR로 묶는다.
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      status: 0,
      code: aborted ? "TIMEOUT" : "NETWORK_ERROR",
      message: null,
    };
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, options),
};
