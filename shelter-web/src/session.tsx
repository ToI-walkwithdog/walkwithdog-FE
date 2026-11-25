import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { dropSession, fetchMe, gateMessage, shelterGateFailure, type Me } from "./api/auth";
import { configureApiAuth } from "./api/client";
import { errorMessage } from "./api/errorMessages";
import { clearToken, getToken } from "./api/tokenStorage";

const RELOGIN_NOTICE = "다시 로그인해 주세요.";

type SessionState =
  | { status: "checking" }
  | { status: "out"; notice?: string }
  // me가 null이면 개발용 미리보기(로그인 없음)다.
  | { status: "in"; me: Me | null };

type SessionContextValue = {
  state: SessionState;
  signedIn: (me: Me) => void;
  preview: () => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

// 화면을 처음 열 때 한 번만 확인한다(StrictMode의 두 번째 effect가 요청과 로그아웃을 되풀이하지 않도록 캐시한다).
let initialCheck: Promise<SessionState> | null = null;

async function checkSession(): Promise<SessionState> {
  if (!getToken()) return { status: "out" };
  const res = await fetchMe();
  if (!res.ok) {
    // 401은 client의 onUnauthorized가 토큰을 지운다. 그 밖의 실패(서버 꺼짐 등)는 토큰을 그대로 둔다.
    if (res.status === 401) return { status: "out", notice: RELOGIN_NOTICE };
    return { status: "out", notice: errorMessage(res.code) };
  }
  const gate = shelterGateFailure(res.data);
  if (gate) {
    await dropSession();
    return { status: "out", notice: gateMessage(gate) };
  }
  return { status: "in", me: res.data };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: "checking" });

  useEffect(() => {
    let active = true;
    configureApiAuth({
      getToken,
      onUnauthorized: () => {
        clearToken();
        if (active) setState({ status: "out", notice: RELOGIN_NOTICE });
        window.location.hash = "login";
      },
    });
    initialCheck ??= checkSession();
    void initialCheck.then((next) => { if (active) setState(next); });
    return () => { active = false; };
  }, []);

  const value: SessionContextValue = {
    state,
    signedIn: (me) => setState({ status: "in", me }),
    preview: () => setState({ status: "in", me: null }),
    signOut: async () => {
      // 토큰이 있을 때만 서버 로그아웃을 한 번 부르고, 실패해도 로컬 토큰을 지우고 로그인으로 간다.
      if (getToken()) {
        try { await dropSession(); } catch { /* dropSession이 토큰은 항상 지운다 */ }
      }
      clearToken();
      setState({ status: "out" });
      window.location.hash = "login";
    },
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("SessionProvider is missing.");
  return context;
}

// 로그인한 계정의 담당 보호소 ID. 개발용 미리보기(로그인 없음)이면 null이다.
export function useShelterId(): string | null {
  const { state } = useSession();
  if (state.status !== "in" || !state.me || state.me.shelter_id === null) return null;
  return String(state.me.shelter_id);
}
