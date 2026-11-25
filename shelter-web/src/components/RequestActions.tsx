import { useState, type FormEvent } from "react";

import { failureText } from "../api/failure";
import type { ApiFailure } from "../api/client";
import {
  approveWalkRequest, CANCEL_REASONS, cancelWalkRequest, fetchWalkRequest, rejectWalkRequest, REJECTION_REASONS,
  type CancelReasonCode, type RejectionReasonCode, type WalkRequestDetail,
} from "../api/walkRequests";

type RequestActionsProps = {
  request: WalkRequestDetail;
  // 처리 결과(또는 이미 처리된 상태)를 알리고 상세를 다시 불러오게 한다.
  onChanged: (message: string) => void;
};

type Mode = "idle" | "reject" | "cancel";

export function RequestActions({ request, onChanged }: RequestActionsProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [rejectCode, setRejectCode] = useState<RejectionReasonCode>("SCHEDULE_CONFLICT");
  const [rejectText, setRejectText] = useState("");
  const [cancelCode, setCancelCode] = useState<CancelReasonCode>("SCHEDULE_CHANGED");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const start = Date.parse(request.requested_start_at);
  const canCancel = request.status === "APPROVED" && !request.walk_id && !Number.isNaN(start) && Date.now() < start;
  if (request.status !== "PENDING" && !canCancel) return null;

  // 409는 이미 처리된 신청이거나 충돌/잠금이다. 상태를 다시 확인해서 바뀌었으면 최신 상태를 보여 주고,
  // 그대로면 BE의 문장(또는 재시도 안내)을 보여 준다. 자동 재시도는 하지 않는다.
  async function handleFailure(failure: ApiFailure) {
    if (failure.status === 409) {
      const latest = await fetchWalkRequest(String(request.id));
      if (latest.ok && latest.data.status !== request.status) {
        onChanged("이미 처리된 신청이에요. 최신 상태를 불러왔어요.");
        return;
      }
    }
    setError(failureText(failure, true));
  }

  async function run(action: () => ReturnType<typeof approveWalkRequest>, successMessage: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await action();
    if (res.ok) {
      setBusy(false);
      setMode("idle");
      setRejectText("");
      onChanged(successMessage);
      return;
    }
    await handleFailure(res);
    setBusy(false);
  }

  function approve() {
    if (!window.confirm("이 신청을 승인할까요?")) return;
    void run(() => approveWalkRequest(request.id), "신청을 승인했어요.");
  }

  function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rejectCode === "OTHER" && !rejectText.trim()) { setError("기타를 고르면 거절 사유를 적어 주세요."); return; }
    if (!window.confirm("이 신청을 거절할까요?")) return;
    void run(() => rejectWalkRequest(request.id, rejectCode, rejectText), "신청을 거절했어요.");
  }

  function cancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm("승인한 예약을 취소할까요? 취소한 예약은 되돌릴 수 없어요.")) return;
    void run(() => cancelWalkRequest(request.id, cancelCode), "예약을 취소했어요.");
  }

  return (
    <div className="section-action">
      {mode === "idle" ? (
        <div className="card-actions">
          {request.status === "PENDING" ? (
            <>
              <button className="small-action" type="button" disabled={busy} onClick={approve}>승인</button>
              <button className="small-action" type="button" disabled={busy} onClick={() => { setError(""); setMode("reject"); }}>거절</button>
            </>
          ) : <button className="small-action" type="button" disabled={busy} onClick={() => { setError(""); setMode("cancel"); }}>예약 취소</button>}
        </div>
      ) : null}
      {mode === "reject" ? (
        <form className="form-card" onSubmit={reject}>
          <label>거절 사유<select value={rejectCode} onChange={(event) => setRejectCode(event.target.value as RejectionReasonCode)} disabled={busy}>
            {REJECTION_REASONS.map((reason) => <option key={reason.code} value={reason.code}>{reason.label}</option>)}
          </select></label>
          <label>{rejectCode === "OTHER" ? "사유 (필수)" : "사유 (선택)"}<textarea value={rejectText} onChange={(event) => setRejectText(event.target.value)} rows={3} maxLength={500} disabled={busy} /></label>
          <div className="card-actions">
            <button className="small-action" type="submit" disabled={busy}>{busy ? "처리 중" : "거절하기"}</button>
            <button className="small-action" type="button" disabled={busy} onClick={() => { setMode("idle"); setError(""); }}>닫기</button>
          </div>
        </form>
      ) : null}
      {mode === "cancel" ? (
        <form className="form-card" onSubmit={cancel}>
          <label>취소 사유<select value={cancelCode} onChange={(event) => setCancelCode(event.target.value as CancelReasonCode)} disabled={busy}>
            {CANCEL_REASONS.map((reason) => <option key={reason.code} value={reason.code}>{reason.label}</option>)}
          </select></label>
          <p className="field-hint">시작 전이고 산책이 시작되지 않은 승인 예약만 취소할 수 있어요.</p>
          <div className="card-actions">
            <button className="small-action" type="submit" disabled={busy}>{busy ? "처리 중" : "예약 취소하기"}</button>
            <button className="small-action" type="button" disabled={busy} onClick={() => { setMode("idle"); setError(""); }}>닫기</button>
          </div>
        </form>
      ) : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  );
}
