import { useState, type FormEvent } from "react";

type LoginPageProps = {
  onPreview: () => void;
};

export function LoginPage({ onPreview }: LoginPageProps) {
  const [message, setMessage] = useState("");

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("로그인과 보호소 인증은 아직 연결되지 않았어요.");
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
            <input id="account" name="account" autoComplete="username" placeholder="아이디를 입력해 주세요" required />
            <label htmlFor="password">비밀번호</label>
            <input id="password" name="password" type="password" autoComplete="current-password" placeholder="비밀번호를 입력해 주세요" required />
            {message ? <p className="form-message" role="status">{message}</p> : null}
            <button className="primary-button" type="submit">로그인</button>
          </form>

          <div className="preview-divider"><span>또는</span></div>
          <button className="secondary-button" type="button" onClick={onPreview}>
            대시보드 미리보기
          </button>
          <a className="verification-link" href="#verification">보호소 인증 안내</a>
        </section>

        <aside className="notice-box">
          <strong>아직 준비 중인 서비스예요</strong>
          <p>보호소 가입과 인증, 실제 로그인은 연결되지 않았어요. 실제 계정 정보는 입력하지 마세요. 미리보기는 예시 데이터로 표시됩니다.</p>
        </aside>
      </main>
      <footer className="login-footer">이어주개 · 보호소 서비스</footer>
    </div>
  );
}
