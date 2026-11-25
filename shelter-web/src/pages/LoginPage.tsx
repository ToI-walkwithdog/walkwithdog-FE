import { useRef, useState, type FormEvent } from "react";

import { signInAsShelter, signInErrorMessage, type Me } from "../api/auth";

type LoginPageProps = {
  // 개발 중 미리보기가 켜졌을 때만 넘어온다.
  onPreview?: (() => void) | undefined;
  onSignedIn: (me: Me) => void;
  // 세션이 끝나 로그인 화면으로 돌아왔을 때 보여 줄 안내.
  notice?: string | undefined;
};

export function LoginPage({ onPreview, onSignedIn, notice }: LoginPageProps) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setSubmitting(true);
    setMessage("");
    const result = await signInAsShelter(account.trim(), password);
    busy.current = false;
    setSubmitting(false);
    if (result.ok) {
      setPassword("");
      onSignedIn(result.me);
      return;
    }
    setPassword("");
    setMessage(signInErrorMessage(result));
  }

  return (
    <div className="page-shell login-shell">
      <header className="brand-header">
        <div className="brand-lockup">
          <span className="brand-name">이어주개</span>
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-caption">보호소 서비스</span>
        </div>
      </header>

      <main className="login-main">
        <div className="eyebrow">SHELTER SERVICE</div>
        <h1>안녕하세요,<br />보호소 담당자님.</h1>
        <p className="intro">
          보호견과 봉사자의 산책을<br />이어주개에서 함께 관리해요.
        </p>

        <section className="login-section" aria-labelledby="login-title">
          <div className="section-heading">
            <h2 id="login-title">로그인</h2>
            <span className="subtle-label">보호소 전용</span>
          </div>
          <form onSubmit={handleLogin}>
            <label htmlFor="account">아이디</label>
            <input id="account" name="account" autoComplete="username" placeholder="아이디를 입력해 주세요" required value={account} onChange={(event) => setAccount(event.target.value)} disabled={submitting} />
            <label htmlFor="password">비밀번호</label>
            <input id="password" name="password" type="password" autoComplete="current-password" placeholder="비밀번호를 입력해 주세요" required value={password} onChange={(event) => setPassword(event.target.value)} disabled={submitting} />
            {notice && !message ? <p className="form-message" role="status">{notice}</p> : null}
            {message ? <p className="form-error" role="alert">{message}</p> : null}
            <button className="primary-button" type="submit" disabled={submitting}>{submitting ? "로그인 중" : "로그인"}</button>
          </form>

          {onPreview ? (
            <>
              <div className="preview-divider"><span>또는</span></div>
              <button className="secondary-button" type="button" onClick={onPreview}>
                대시보드 미리보기 (개발용)
              </button>
            </>
          ) : null}
          <a className="verification-link" href="#verification">보호소 인증 안내</a>
        </section>

        <aside className="notice-box">
          <strong>일부 화면은 아직 예시예요</strong>
          <p>로그인은 서버와 연결돼 있지만, 강아지, 일정, 예약 등 다른 화면은 아직 예시 데이터로 표시돼요. 보호소 계정만 들어올 수 있어요.</p>
        </aside>
      </main>
      <footer className="login-footer">이어주개 · 보호소 서비스</footer>
    </div>
  );
}
