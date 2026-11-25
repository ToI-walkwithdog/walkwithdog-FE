import { useDemo } from "../DemoContext";
import { fetchShelter } from "../api/shelters";
import { useLoad } from "../hooks";
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
  const { dogs, schedules, bookings, reports } = useDemo();
  const shelterId = useShelterId();
  const pending = bookings.filter((booking) => booking.status === "pending");
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
          <strong>예시 화면입니다</strong>
          <span>표시된 내용은 실제 예약이나 신고가 아니에요.</span>
        </div>

        <section className="dashboard-section" aria-labelledby="status-title">
          <div className="section-heading">
            <h2 id="status-title">한눈에 보기</h2>
            <span className="subtle-label">예시 데이터</span>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">승인 대기</span>
              <strong className="stat-number">{pending.length}<span>건</span></strong>
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
            <span className="count-badge">{pending.length}</span>
          </div>
          {pending.map((request) => {
            const dog = dogs.find((item) => item.id === request.dogId);
            const schedule = schedules.find((item) => item.id === request.scheduleId);
            return (
            <article className="request-card" key={request.id}>
              <div className="request-topline">
                <span className="request-status">승인 대기</span>
                <span className="example-label">예시</span>
              </div>
              <h3>{dog?.name ?? "알 수 없는 강아지"}와 산책</h3>
              <dl className="request-details">
                <div><dt>신청자</dt><dd>{request.applicant}</dd></div>
                <div><dt>신청 일정</dt><dd>{schedule ? `${schedule.date} · ${schedule.start}–${schedule.end}` : "일정 없음"}</dd></div>
              </dl>
              <a className="inline-link" href={`#bookings/${request.id}`}>신청 확인하기</a>
            </article>
          )})}
          {pending.length === 0 ? <p className="empty-text">승인 대기 중인 예시 신청이 없어요.</p> : null}
          <p className="section-footnote">승인 결과는 앱이나 서버에 전달되지 않아요.</p>
        </section>

        <section className="dashboard-section" aria-labelledby="menu-title">
          <div className="section-heading">
            <div>
              <h2 id="menu-title">보호소 관리</h2>
              <p className="section-description">각 메뉴를 목업으로 확인할 수 있어요.</p>
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
