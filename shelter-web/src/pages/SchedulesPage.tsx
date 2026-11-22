import { useState, type FormEvent } from "react";

import { PageLayout } from "../components/PageLayout";
import { useDemo } from "../DemoContext";
import { newDemoId } from "../data/demo";

export function SchedulesPage() {
  const { dogs, schedules, toggleSchedule } = useDemo();
  const [message, setMessage] = useState("");

  function toggle(id: string) {
    const selected = schedules.find((schedule) => schedule.id === id);
    if (!selected) return;
    if (!selected.active && schedules.some((schedule) => schedule.id !== id && schedule.active && schedule.dogId === selected.dogId && schedule.date === selected.date && selected.start < schedule.end && selected.end > schedule.start)) {
      setMessage("같은 강아지의 공개 일정과 시간이 겹쳐 재개할 수 없어요.");
      return;
    }
    setMessage("");
    toggleSchedule(id);
  }
  return (
    <PageLayout title="산책 일정" description="강아지별 가능한 날짜와 시간을 확인해요.">
      <a className="primary-link section-action" href="#schedules/new">일정 등록</a>
      {message ? <p className="form-error section-action" role="alert">{message}</p> : null}
      <div className="content-list">
        {schedules.length === 0 ? <p className="empty-text">등록된 예시 일정이 없어요.</p> : null}
        {schedules.map((schedule) => {
          const dog = dogs.find((item) => item.id === schedule.dogId);
          return (
            <article className="content-card" key={schedule.id}>
              <div className="card-title-row"><h2>{dog?.name ?? "알 수 없는 강아지"}</h2><span className="small-badge">{schedule.active ? "공개 중" : "일시 중지"}</span></div>
              <p className="detail-emphasis">{schedule.date} · {schedule.start}–{schedule.end}</p>
              <p className="muted">최대 산책 {schedule.maxMinutes}분{dog && !dog.active ? " · 강아지 등록 일시 중지" : ""}</p>
              <div className="card-actions">
                <button className="small-action" type="button" onClick={() => toggle(schedule.id)}>{schedule.active ? "일정 일시 중지" : "일정 재개"}</button>
              </div>
            </article>
          );
        })}
      </div>
    </PageLayout>
  );
}

export function ScheduleFormPage() {
  const { dogs, schedules, addSchedule } = useDemo();
  const availableDogs = dogs.filter((dog) => dog.active);
  const [dogId, setDogId] = useState(availableDogs[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [maxMinutes, setMaxMinutes] = useState("");
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dog = availableDogs.find((item) => item.id === dogId);
    const duration = Number(maxMinutes);
    const parseTime = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return (hours ?? 0) * 60 + (minutes ?? 0);
    };
    if (!dog || !date || !start || !end || !Number.isInteger(duration) || duration <= 0) {
      setMessage("강아지와 일정, 산책 시간을 확인해 주세요.");
      return;
    }
    if (parseTime(end) <= parseTime(start) || duration > parseTime(end) - parseTime(start)) {
      setMessage("종료 시간은 시작보다 늦어야 하며 산책 시간은 가능 시간 이하여야 해요.");
      return;
    }
    if (schedules.some((schedule) => schedule.active && schedule.dogId === dogId && schedule.date === date && start < schedule.end && end > schedule.start)) {
      setMessage("같은 강아지의 공개 일정과 시간이 겹쳐요.");
      return;
    }
    addSchedule({ id: newDemoId("schedule"), dogId, date, start, end, maxMinutes: duration, active: true });
    window.location.hash = "schedules";
  }

  return (
    <PageLayout title="산책 일정 등록" description="같은 날의 시작·종료 시간과 최대 산책 시간을 입력해요." back="#schedules">
      {availableDogs.length === 0 ? <div className="content-card"><p>등록 중인 강아지가 없어요.</p><a className="inline-link" href="#dogs">강아지 관리로</a></div> : (
        <form className="form-card" onSubmit={submit}>
          <label>강아지<select value={dogId} onChange={(event) => setDogId(event.target.value)}>{availableDogs.map((dog) => <option value={dog.id} key={dog.id}>{dog.name}</option>)}</select></label>
          <label>가능한 날짜<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
          <label>시작 시간<input type="time" value={start} onChange={(event) => setStart(event.target.value)} required /></label>
          <label>종료 시간<input type="time" value={end} onChange={(event) => setEnd(event.target.value)} required /></label>
          <label>최대 산책 시간 (분)<input type="number" min="1" step="1" value={maxMinutes} onChange={(event) => setMaxMinutes(event.target.value)} placeholder="예: 30" required /></label>
          {message ? <p className="form-error" role="alert">{message}</p> : null}
          <button className="primary-button" type="submit">목업에 저장</button>
          <a className="secondary-link" href="#schedules">취소</a>
        </form>
      )}
    </PageLayout>
  );
}
