// 웹 토큰 저장소. 탭이 닫히면 사라지는 sessionStorage만 쓴다(localStorage는 쓰지 않는다).
// 저장소가 막혀 있어도(시크릿 창, 차단) 이 탭 안에서는 로그인이 유지되도록 메모리에 같이 둔다.
// 토큰 값은 로그에 남기지 않는다.

const TOKEN_KEY = "shelter_access_token";

let memoryToken: string | null = null;

export function getToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    memoryToken = window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    // 저장소를 읽을 수 없으면 메모리 값만 쓴다.
  }
  return memoryToken;
}

export function saveToken(token: string): void {
  memoryToken = token;
  try {
    window.sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // 저장하지 못해도 메모리 값으로 이 탭에서는 계속 쓴다.
  }
}

export function clearToken(): void {
  memoryToken = null;
  try {
    window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}
