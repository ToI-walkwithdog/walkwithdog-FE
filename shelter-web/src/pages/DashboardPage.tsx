import { useDemo } from "../DemoContext";
import { failureText } from "../api/failure";
import { fetchShelter } from "../api/shelters";
import { countPendingRequests } from "../api/walkRequests";
import { useLoad } from "../hooks";
import { formatKstRange } from "../time";
import { useSession, useShelterId } from "../session";

const menuItems = [
  { title: "강아지 관리", description: "보호견 정보와 사진", href: "#dogs" },
  { title: "산책 일정", description: "가능한 날짜와 시간", href: "#schedules" },
  { title: "예약 관리", description: "신청 확인과 승인", href: "#bookings" },
  { title: "산책 현황", description: "진행 상황과 위치 연결", href: "#live" },
  { title: "신고 관리", description: "접수된 신고와 산책자 신고", href: "#reports" },
  { title: "산책 이력", description: "완료된 산책과 평가", href: "#history" },
  { title: "보호소 설정", description: "보호소 정보와 인증", href: "#settings" },
];

export function DashboardPage() {
  const { signOut } = useSession();
  const { reports } = useDemo();
  const shelterId = useShelterId();
  // 승인 대기 수와 카드만 서버 데이터다. total이 없어서 전체 쪽수를 넘기며 센다. 실패해도 나머지 화면은 그대로 보인다.
  const pendingLoad = useLoad(() => (shelterId === null ? Promise.resolve({ ok: true as const, status: 200, data: { count: 0, first: [] } }) : countPendingRequests(shelterId)), [shelterId]);
  const pendingCount = pendingLoad.state.status === "ok" ? pendingLoad.state.data.count : null;
  const pendingCards = pendingLoad.state.status === "ok" ? pendingLoad.state.data.first.slice(0, 5) : [];
  const unreadReports = reports.filter((report) => report.kind === "incoming" && !report.reviewed);
  return (
    <div className="page-shell dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="brand-lockup">
            <span className="brand-name">이어주개</span>
            <span className="brand-divider" aria-hidden="true" />
            <span className="brand-caption">보호소</span>
          </div>
          <button className="text-button" type="button" onClick={() => void signOut()}>로그아웃</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-intro">
          <div>
            <span className="eyebrow">SHELTER DASHBOARD</span>
            {shelterId === null ? <ShelterHeading name={null} area={null} /> : <ConnectedHeading shelterId={shelterId} />}
          </div>
          <span className="preview-badge">미리보기</span>
        </div>

        <div className="demo-notice" role="note">
          <strong>일부는 예시 화면이에요</strong>
          <span>승인 대기 신청은 실제 데이터예요. 신고와 산책 현황은 아직 예시예요.</span>
        </div>

        <section className="dashboard-section" aria-labelledby="status-title">
          <div className="section-heading">
            <h2 id="status-title">한눈에 보기</h2>
            <span className="subtle-label">신고는 예시</span>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">승인 대기</span>
              <strong className="stat-number">{pendingCount === null ? "—" : pendingCount}{pendingCount === null ? null : <span>건</span>}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">산책 중</span>
              <strong className="stat-number">—</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">확인할 신고</span>
              <strong className="stat-number">{unreadReports.length}<span>건</span></strong>
            </div>
          </div>
        </section>

        <section className="dashboard-section" aria-labelledby="request-title">
          <div className="section-heading">
            <div>
              <h2 id="request-title">확인이 필요한 신청</h2>
              <p className="section-description">봉사자의 산책 신청을 확인해요.</p>
            </div>
            <span className="count-badge">{pendingCount === null ? "—" : pendingCount}</span>
          </div>
          {pendingCards.map((request) => (
            <article className="request-card" key={request.id}>
              <div className="request-topline">
                <span className="request-status">승인 대기</span>
              </div>
              <h3>{request.dog?.name ?? "강아지"}와 산책</h3>
              <dl className="request-details">
                <div><dt>신청 일정</dt><dd>{formatKstRange(request.requested_start_at, request.requested_end_at)}</dd></div>
              </dl>
              <a className="inline-link" href={`#bookings/${request.id}`}>신청 확인하기</a>
            </article>
          ))}
          {pendingLoad.state.status === "loading" ? <p className="empty-text" role="status">불러오는 중이에요.</p> : null}
          {pendingLoad.state.status === "error" ? (
            <div>
              <p className="form-error" role="alert">{failureText(pendingLoad.state.failure)}</p>
              <button className="small-action section-action" type="button" onClick={pendingLoad.reload}>다시 불러오기</button>
            </div>
          ) : null}
          {pendingLoad.state.status === "ok" && pendingCards.length === 0 ? <p className="empty-text">{shelterId === null ? "미리보기에서는 서버 데이터를 볼 수 없어요." : "승인 대기 중인 신청이 없어요."}</p> : null}
          {pendingCount !== null && pendingCount > pendingCards.length ? <a className="inline-link" href="#bookings">나머지 {pendingCount - pendingCards.length}건 보기</a> : null}
        </section>

        <section className="dashboard-section" aria-labelledby="menu-title">
          <div className="section-heading">
            <div>
              <h2 id="menu-title">보호소 관리</h2>
              <p className="section-description">강아지, 일정, 예약, 설정은 서버와 연결돼 있어요. 나머지 메뉴는 예시예요.</p>
            </div>
          </div>
          <div className="menu-list">
            {menuItems.map((item) => (
              <a className="menu-row" key={item.title} href={item.href}>
                <div><h3>{item.title}</h3><p>{item.description}</p></div>
                <span className="coming-soon">보기</span>
              </a>
            ))}
          </div>
        </section>
      </main>
      <footer className="dashboard-footer">이어주개 보호소 서비스 · 미리보기</footer>
    </div>
  );
}

// 이름과 주소만 서버에서 가져온다. 실패해도 대시보드의 나머지는 그대로 보여 준다.
function ConnectedHeading({ shelterId }: { shelterId: string }) {
  const { state } = useLoad(() => fetchShelter(shelterId), [shelterId]);
  return state.status === "ok"
    ? <ShelterHeading name={state.data.name} area={state.data.address} />
    : <ShelterHeading name={null} area={null} />;
}

function ShelterHeading({ name, area }: { name: string | null; area: string | null }) {
  return (
    <>
      <h1>{name ?? "보호소"}님,<br />안녕하세요.</h1>
      <p>{area ? `${area} · ` : ""}보호소 운영 현황</p>
    </>
  );
}
