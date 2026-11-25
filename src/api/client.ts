import { clearToken, getToken } from "./tokenStorage";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
const TIMEOUT_MS = 10_000;

// 서버가 돌려주는 상대 경로(/media/...)를 이미지 주소로 바꿀 때 쓴다.
export const API_BASE_URL = BASE_URL;

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// 성공 본문은 두 가지다: 계약형 {code, data, message}와 /walks/*, /walk-requests/my 같은 본문 그대로.
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

// {code,data,message} / {detail: string} / {detail: {code, ...}} 를 하나로 정규화한다.
function normalizeError(status: number, body: unknown): ApiFailure {
  if (isRecord(body)) {
    const detail = body.detail;
    if (typeof detail === "string") {
      return { ok: false, status, code: null, message: detail };
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
    if (body !== undefined) {
      requestHeaders["Content-Type"] = "application/json";
    }
    if (auth) {
      const token = await getToken();
      if (token) requestHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
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
      if (response.status === 401 && auth) await clearToken();
      return normalizeError(response.status, json);
    }

    // 성공(2xx)인데 JSON이 아닌 본문은 null 성공으로 넘기지 않는다. 주소가 API가 아닌 서버(Metro 등)를
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

    // 본문이 비어 있는 2xx(204 등)는 데이터 없음으로 명시한다.
    if (text.trim() === "") {
      return { ok: true, status: response.status, data: undefined as T };
    }

    return { ok: true, status: response.status, data: unwrap<T>(json) };
  } catch (error) {
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
};
