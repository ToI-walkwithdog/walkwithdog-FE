import type { ReactNode } from "react";

import { useSession } from "../session";

type PageLayoutProps = {
  title: string;
  description: string;
  back?: string;
  // 서버와 연결된 화면은 false. 예시 데이터를 쓰는 화면만 목업 안내를 보여 준다.
  demo?: boolean;
  children: ReactNode;
};

export function PageLayout({ title, description, back = "#dashboard", demo = true, children }: PageLayoutProps) {
  const { signOut } = useSession();
  return (
    <div className="page-shell dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <a className="back-link" href={back}>이전</a>
          <span className="header-page-title">{title}</span>
          <span className="header-actions">
            <a className="text-button" href="#dashboard">홈</a>
            <button className="text-button" type="button" onClick={() => void signOut()}>로그아웃</button>
          </span>
        </div>
      </header>
      <main className="inner-main">
        <div className="inner-heading">
          <span className="eyebrow">{demo ? "SHELTER SERVICE · DEMO" : "SHELTER SERVICE"}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {demo ? (
        <div className="demo-notice compact" role="note">
          <strong>목업 미리보기</strong>
          <span>변경 내용은 이 탭에서만 확인되며 새로고침하면 초기화돼요.</span>
        </div>
        ) : null}
        {children}
      </main>
      <footer className="dashboard-footer">{demo ? "이어주개 보호소 서비스 · 미리보기" : "이어주개 보호소 서비스"}</footer>
    </div>
  );
}
