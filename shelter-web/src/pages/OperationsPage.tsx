import { useState, type FormEvent } from "react";

import { PageLayout } from "../components/PageLayout";
import { useDemo } from "../DemoContext";
import { newDemoId } from "../data/demo";

export function LivePage() {
  return (
    <PageLayout title="산책 현황" description="강아지별 진행 상황과 시간 초과를 확인하는 화면이에요.">
      <div className="content-card section-action">
        <h2>실시간 연결 전</h2>
        <p className="body-copy">현재 진행 중인 산책, 위치, GPS 연결 상태 및 시간 초과 여부를 확인할 수 없어요.</p>
        <p className="field-hint">위치 수집·동의와 시간 초과 기준은 백엔드 및 운영 정책이 필요해요.</p>
      </div>
    </PageLayout>
  );
}

export function ReportsPage() {
  const { reports, reviewReport } = useDemo();
  return (
    <PageLayout title="신고 관리" description="접수 예시와 보호소가 작성한 신고 목업을 확인해요.">
      <a className="primary-link section-action" href="#reports/new">산책자 신고 작성</a>
      <div className="content-list">
        {reports.length === 0 ? <p className="empty-text">예시 신고가 없어요.</p> : null}
        {reports.map((report) => (
          <article className="content-card" key={report.id}>
            <div className="card-title-row"><h2>{report.title}</h2><span className="small-badge">{report.kind === "incoming" ? (report.reviewed ? "확인 예시" : "미확인 예시") : "작성 예시"}</span></div>
            <p className="muted">{report.kind === "incoming" ? "봉사자 접수 예시" : "보호소 작성 예시"} · {report.person} · {report.dogName}</p>
            <p className="body-copy preserve-lines">{report.message}</p>
            {report.kind === "incoming" && !report.reviewed ? <button className="small-action section-action" type="button" onClick={() => reviewReport(report.id)}>목업 확인 처리</button> : null}
          </article>
        ))}
      </div>
      <p className="field-hint section-action">신고 확인 및 작성은 서버나 앱으로 전달되지 않아요.</p>
    </PageLayout>
  );
}

export function ReportFormPage() {
  const { addReport } = useDemo();
  const [person, setPerson] = useState("");
  const [dogName, setDogName] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!person.trim() || !dogName.trim() || !title.trim() || !message.trim()) {
      setError("모든 항목을 입력해 주세요.");
      return;
    }
    addReport({ id: newDemoId("report"), kind: "outgoing", person: person.trim(), dogName: dogName.trim(), title: title.trim(), message: message.trim(), reviewed: false });
    window.location.hash = "reports";
  }
  return (
    <PageLayout title="산책자 신고 작성" description="예시 신고를 작성해요. 실제 개인정보는 입력하지 마세요." back="#reports">
      <form className="form-card" onSubmit={submit}>
        <label>산책자<input value={person} onChange={(event) => setPerson(event.target.value)} required maxLength={50} /></label>
        <label>강아지<input value={dogName} onChange={(event) => setDogName(event.target.value)} required maxLength={30} /></label>
        <label>신고 제목<input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={80} /></label>
        <label>신고 내용<textarea value={message} onChange={(event) => setMessage(event.target.value)} required maxLength={1000} rows={5} /></label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="primary-button" type="submit">목업에 저장</button>
        <a className="secondary-link" href="#reports">취소</a>
      </form>
    </PageLayout>
  );
}

export function HistoryPage({ walkId }: { walkId?: string }) {
  const { walks } = useDemo();
  const selected = walkId ? walks.find((walk) => walk.id === walkId) : undefined;
  if (walkId && !selected) return <PageLayout title="산책 이력 없음" description="요청한 예시 기록을 찾을 수 없어요." back="#history"><a className="secondary-link section-action" href="#history">이력 목록</a></PageLayout>;
  return (
    <PageLayout title={selected ? "산책 이력 상세" : "산책 이력"} description="완료된 산책 예시와 보호소 평가를 확인해요." back={selected ? "#history" : "#dashboard"}>
      <div className="content-list">
        {(selected ? [selected] : walks).map((walk) => (
          <article className="content-card" key={walk.id}>
            <div className="card-title-row"><h2>{walk.dogName} · {walk.applicant}</h2><span className="small-badge">완료 예시</span></div>
            <dl className="details-list">
              <div><dt>날짜</dt><dd>{walk.date}</dd></div>
              <div><dt>시간</dt><dd>{walk.duration}</dd></div>
              <div><dt>거리</dt><dd>{walk.distance}</dd></div>
              <div><dt>산책 메모</dt><dd>{walk.memo || "없음"}</dd></div>
              <div><dt>보호소 평가</dt><dd>{walk.evaluation || "아직 없음"}</dd></div>
            </dl>
            {selected ? <EvaluationForm key={walk.id} id={walk.id} initial={walk.evaluation} /> : <a className="inline-link" href={`#history/${walk.id}`}>상세 및 평가</a>}
          </article>
        ))}
        {walks.length === 0 ? <p className="empty-text">완료된 예시 산책이 없어요.</p> : null}
      </div>
      <div className="notice-box"><strong>인계 확인 미연결</strong><p>산책 종료 후 강아지와 물품 인계 여부는 서버에서 확인할 수 있도록 논의가 필요해요. 현재 인계 여부를 확인할 수 없어요.</p></div>
    </PageLayout>
  );
}

function EvaluationForm({ id, initial }: { id: string; initial: string }) {
  const { saveEvaluation } = useDemo();
  const [value, setValue] = useState(initial);
  const [message, setMessage] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) { setMessage("평가 내용을 입력해 주세요."); return; }
    saveEvaluation(id, value.trim());
    setMessage("평가를 목업에 저장했어요. 서버로 전송되지 않았어요.");
  }
  return (
    <form className="evaluation-form" onSubmit={submit}>
      <label>보호소 평가<textarea value={value} onChange={(event) => setValue(event.target.value)} rows={4} maxLength={500} required placeholder="평가 예시를 입력해 주세요" /></label>
      <button className="small-action" type="submit">목업 평가 저장</button>
      {message ? <p className="field-hint" role="status">{message}</p> : null}
    </form>
  );
}
