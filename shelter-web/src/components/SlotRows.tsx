import { DURATIONS, emptySlot, endTime, type Duration, type SlotDraft } from "../slots";

type SlotRowsProps = {
  slots: SlotDraft[];
  onChange: (slots: SlotDraft[]) => void;
  disabled?: boolean;
};

// 일정 입력 줄(날짜, 시작, 산책 시간). 종료 시간은 시작 + 산책 시간으로 자동 계산한다. 최소 1줄이 남는다.
export function SlotRows({ slots, onChange, disabled = false }: SlotRowsProps) {
  const update = (index: number, patch: Partial<SlotDraft>) =>
    onChange(slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  return (
    <div className="slot-rows">
      {slots.map((slot, index) => {
        const end = endTime(slot.start, slot.duration);
        return (
          <div className="slot-row" key={index}>
            <label>날짜<input type="date" value={slot.date} onChange={(event) => update(index, { date: event.target.value })} required disabled={disabled} /></label>
            <label>시작 시간<input type="time" value={slot.start} onChange={(event) => update(index, { start: event.target.value })} required disabled={disabled} /></label>
            <label>산책 시간<select value={slot.duration} onChange={(event) => update(index, { duration: Number(event.target.value) as Duration })} disabled={disabled}>
              {DURATIONS.map((value) => <option key={value} value={value}>{value}분</option>)}
            </select></label>
            <p className="field-hint">{slot.start ? (end ? `종료 ${end} (한국 시간)` : "종료 시간이 자정을 넘어요") : "종료 시간은 시작 시간과 산책 시간으로 정해져요"}</p>
            {slots.length > 1 ? <button className="small-action" type="button" onClick={() => onChange(slots.filter((_, i) => i !== index))} disabled={disabled}>이 줄 빼기</button> : null}
          </div>
        );
      })}
      <button className="small-action" type="button" onClick={() => onChange([...slots, emptySlot()])} disabled={disabled}>일정 줄 추가</button>
    </div>
  );
}
