import { useState, type FormEvent } from "react";

import { createDateSlots, deleteDateSlot, fetchDateSlots, type DateSlot } from "../api/dateSlots";
import { fetchShelterDogs, type DogListItem } from "../api/dogs";
import { failureText } from "../api/failure";
import type { ApiResult } from "../api/client";
import { LoadView, NoServerNotice } from "../components/LoadView";
import { PageLayout } from "../components/PageLayout";
import { SlotRows } from "../components/SlotRows";
import { useLoad } from "../hooks";
import { useShelterId } from "../session";
import { emptySlot, slotToInput, type SlotDraft } from "../slots";

const CONCURRENCY = 3;

type ScheduleEntry = { dog: DogListItem; slot: DateSlot };
type SchedulesData = { entries: ScheduleEntry[]; failedDogs: string[] };

// 보호소 전체 일정 목록 API가 없어서 강아지 목록을 받은 뒤 강아지별 일정을 몇 개씩만 동시에 불러온다.
async function loadSchedules(shelterId: string): Promise<ApiResult<SchedulesData>> {
  const dogs = await fetchShelterDogs(shelterId);
  if (!dogs.ok) return dogs;
  const dogList = dogs.data;
  const entries: ScheduleEntry[] = [];
  const failedDogs: string[] = [];
  let next = 0;
  async function worker() {
    while (next < dogList.length) {
      const dog = dogList[next];
      next += 1;
      if (!dog) continue;
      const res = await fetchDateSlots(String(dog.id));
      if (res.ok) entries.push(...res.data.map((slot) => ({ dog, slot })));
      else failedDogs.push(dog.name);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, dogList.length) }, worker));
  entries.sort((a, b) => `${a.slot.date} ${a.slot.start}`.localeCompare(`${b.slot.date} ${b.slot.start}`) || a.dog.id - b.dog.id);
  return { ok: true, status: 200, data: { entries, failedDogs } };
}

export function SchedulesPage() {
  const shelterId = useShelterId();
  const { state, reload } = useLoad(() => loadSchedules(shelterId ?? ""), [shelterId]);
  const [showEnded, setShowEnded] = useState(false);
  const [message, setMessage] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function endSlot(entry: ScheduleEntry) {
    if (busyKey !== null) return;
    if (!window.confirm("이 일정을 종료할까요? 종료한 일정은 다시 열 수 없어요. 필요하면 새 일정을 등록해야 해요.")) return;
    const key = `${entry.dog.id}-${entry.slot.id}`;
    setBusyKey(key);
    setMessage("");
    const res = await deleteDateSlot(String(entry.dog.id), entry.slot.id);
    setBusyKey(null);
    if (!res.ok) {
      setMessage(res.status === 409 ? "이 일정에 진행 중인 예약이 있어요. 예약을 먼저 취소한 뒤 종료해 주세요." : failureText(res, true));
    }
    reload();
  }

  return (
    <PageLayout title="산책 일정" description="강아지별 가능한 날짜와 시간을 확인해요.">
      {shelterId === null ? <NoServerNotice /> : (
        <>
          <a className="primary-link section-action" href="#schedules/new">일정 등록</a>
          {message ? <p className="form-error section-action" role="alert">{message}</p> : null}
          <LoadView state={state} onRetry={reload}>{({ entries, failedDogs }) => {
            const shown = showEnded ? entries : entries.filter((entry) => entry.slot.active);
            return (
              <>
                {failedDogs.length > 0 ? <p className="form-error section-action" role="alert">{failedDogs.join(", ")}의 일정을 불러오지 못했어요. 다시 불러오기를 눌러 주세요.</p> : null}
                <label className="check-row section-action"><input type="checkbox" checked={showEnded} onChange={(event) => setShowEnded(event.target.checked)} /> 종료된 일정도 보기</label>
                <div className="content-list">
                  {shown.length === 0 ? <p className="empty-text">등록된 일정이 없어요.</p> : null}
                  {shown.map((entry) => (
                    <article className="content-card" key={`${entry.dog.id}-${entry.slot.id}`}>
                      <div className="card-title-row"><h2>{entry.dog.name}</h2><span className="small-badge">{entry.slot.active ? "공개 중" : "종료됨"}</span></div>
                      <p className="detail-emphasis">{entry.slot.date} · {entry.slot.start}–{entry.slot.end}</p>
                      <p className="muted">{entry.slot.durationMinutes ? `산책 ${entry.slot.durationMinutes}분` : "산책 시간 정보 없음"}</p>
                      {entry.slot.active ? (
                        <div className="card-actions">
                          <button className="small-action" type="button" disabled={busyKey !== null} onClick={() => void endSlot(entry)}>일정 종료</button>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
                <p className="field-hint section-action">종료한 일정은 다시 열 수 없어요. 일정 수정은 아직 지원하지 않아요(종료 후 새로 등록해 주세요).</p>
              </>
            );
          }}</LoadView>
        </>
      )}
    </PageLayout>
  );
}

export function ScheduleFormPage() {
  const shelterId = useShelterId();
  return (
    <PageLayout title="산책 일정 등록" description="강아지를 고르고 날짜, 시작 시간, 산책 시간을 입력해요." back="#schedules">
      {shelterId === null ? <NoServerNotice /> : <ScheduleForm shelterId={shelterId} />}
    </PageLayout>
  );
}

function ScheduleForm({ shelterId }: { shelterId: string }) {
  const { state, reload } = useLoad(() => fetchShelterDogs(shelterId), [shelterId]);
  return <LoadView state={state} onRetry={reload}>{(dogs) => (
    dogs.length === 0
      ? <div className="content-card"><p>등록된 강아지가 없어요.</p><a className="inline-link" href="#dogs">강아지 관리로</a></div>
      : <ScheduleFields dogs={dogs} />
  )}</LoadView>;
}

function ScheduleFields({ dogs }: { dogs: DogListItem[] }) {
  const [dogId, setDogId] = useState(String(dogs[0]?.id ?? ""));
  const [slots, setSlots] = useState<SlotDraft[]>([emptySlot()]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const inputs = slots.map(slotToInput);
    const bad = inputs.find((item) => !item.ok);
    if (bad && !bad.ok) { setMessage(bad.message); return; }
    setSaving(true);
    setMessage("");
    const res = await createDateSlots(dogId, inputs.flatMap((item) => (item.ok ? [item.slot] : [])));
    setSaving(false);
    if (res.ok) { window.location.hash = "schedules"; return; }
    // 과거 날짜, 겹침 등은 BE가 검증하므로 BE의 문장을 그대로 보여 준다.
    setMessage(failureText(res, true));
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <label>강아지<select value={dogId} onChange={(event) => setDogId(event.target.value)} disabled={saving}>{dogs.map((dog) => <option value={dog.id} key={dog.id}>{dog.name}</option>)}</select></label>
      <p className="field-hint">시간은 한국 시간이에요. 같은 강아지의 일정과 겹치거나 지난 날짜면 등록되지 않아요.</p>
      <SlotRows slots={slots} onChange={setSlots} disabled={saving} />
      {message ? <p className="form-error" role="alert">{message}</p> : null}
      <button className="primary-button" type="submit" disabled={saving}>{saving ? "등록 중" : "일정 등록"}</button>
      <a className="secondary-link" href="#schedules">취소</a>
    </form>
  );
}
