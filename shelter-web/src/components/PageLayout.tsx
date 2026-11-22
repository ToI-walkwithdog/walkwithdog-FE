import type { ReactNode } from "react";

type PageLayoutProps = {
  title: string;
  description: string;
  back?: string;
  children: ReactNode;
};

export function PageLayout({ title, description, back = "#dashboard", children }: PageLayoutProps) {
  return (
    <div className="page-shell dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <a className="back-link" href={back}>이전</a>
          <span className="header-page-title">{title}</span>
          <a className="text-button" href="#dashboard">홈</a>
        </div>
      </header>
      <main className="inner-main">
        <div className="inner-heading">
          <span className="eyebrow">SHELTER SERVICE · DEMO</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="demo-notice compact" role="note">
          <strong>목업 미리보기</strong>
          <span>변경 내용은 이 탭에서만 확인되며 새로고침하면 초기화돼요.</span>
        </div>
        {children}
      </main>
      <footer className="dashboard-footer">이어주개 보호소 서비스 · 미리보기</footer>
    </div>
  );
}
