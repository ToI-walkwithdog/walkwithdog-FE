import { useEffect, useState } from "react";

import { issueShelterCode, type WalkRequestDetail } from "../api/walkRequests";
import { failureText } from "../api/failure";
import { formatCountdown, formatKst } from "../time";

type ShownCode = { code: string; expiresAt: number | null };

// 보호소 코드는 이 컴포넌트의 상태에만 둔다. 저장소, 주소, 로그, 다른 상태에는 넣지 않는다.
// 컴포넌트가 사라지면(다른 화면으로 이동, 새로고침) 코드도 사라진다.
export function ShelterCodePanel({ request }: { request: WalkRequestDetail }) {
  const [shown, setShown] = useState<ShownCode | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [issuedBefore, setIssuedBefore] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const start = Date.parse(request.requested_start_at);
  const end = Date.parse(request.requested_end_at);
  const inWindow = now >= start && now < end;

  // 발급 가능 시간 판정이 시간이 지나면서 바뀌도록 주기적으로 갱신한다(서버가 최종 판단한다).
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  // 코드가 보이는 동안 1초마다 남은 시간을 갱신하고, 만료되면 코드를 지운다.
  useEffect(() => {
    if (!shown || shown.expiresAt === null) { setRemaining(null); return; }
    const expiresAt = shown.expiresAt;
    const tick = () => {
      const left = Math.ceil((expiresAt - Date.now()) / 1000);
      if (left <= 0) {
        setShown(null);
        setRemaining(null);
        setMessage("코드가 만료돼 화면에서 지웠어요. 필요하면 다시 발급해 주세요.");
      } else {
        setRemaining(left);
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [shown]);

  async function issue() {
    if (issuing) return;
    if ((shown || issuedBefore) && !window.confirm("이미 발급한 코드가 있어요. 새로 발급하면 이전 코드는 쓸 수 없게 돼요. 계속할까요?")) return;
    setIssuing(true);
    setMessage("");
    const res = await issueShelterCode(request.id);
    setIssuing(false);
    if (res.ok) {
      const expires = Date.parse(res.data.expires_at);
      setShown({ code: res.data.shelter_code, expiresAt: Number.isNaN(expires) ? null : expires });
      setIssuedBefore(true);
      return;
    }
    setShown(null);
    setMessage(issueErrorText(res.status, res.code, failureText(res, true)));
  }

  let disabledReason = "";
  if (Number.isNaN(start) || Number.isNaN(end)) disabledReason = "예약 시간을 확인할 수 없어요.";
  else if (now < start) disabledReason = `예약 시작(${formatKst(request.requested_start_at)}) 이후에 발급할 수 있어요.`;
  else if (now >= end) disabledReason = "예약 시간이 지나 코드를 발급할 수 없어요.";

  return (
    <section className="code-panel section-action" aria-labelledby="code-title">
      <h3 id="code-title">보호소 코드</h3>
      <p className="field-hint">봉사자가 산책을 시작할 때 입력하는 6자리 코드예요. 예약 시간 안에서만 발급할 수 있어요.</p>
      {shown ? (
        <div className="code-box" role="status">
          <p className="code-display">{shown.code}</p>
          <p className="muted">{shown.expiresAt !== null ? `${formatKst(new Date(shown.expiresAt).toISOString())}까지 · 남은 시간 ${remaining === null ? "-" : formatCountdown(remaining)}` : "만료 시각을 알 수 없어요. 사용 후 숨겨 주세요."}</p>
          <button className="small-action" type="button" onClick={() => { setShown(null); setMessage(""); }}>숨기기</button>
        </div>
      ) : null}
      {message ? <p className="form-error" role="alert">{message}</p> : null}
      <div className="card-actions">
        <button className="small-action" type="button" disabled={!inWindow || issuing} onClick={() => void issue()}>{issuing ? "발급 중" : shown || issuedBefore ? "코드 다시 발급" : "코드 발급"}</button>
      </div>
      {disabledReason && !inWindow ? <p className="field-hint">{disabledReason}</p> : null}
    </section>
  );
}

function issueErrorText(status: number, code: string | null, fallback: string): string {
  if (status === 409 && code === "WALK_REQUEST_NOT_ELIGIBLE") {
    return "지금은 코드를 발급할 수 없어요. 승인된 예약의 시작~종료 시간 안이고, 아직 산책이 시작되지 않았을 때만 발급돼요.";
  }
  if (status === 409 && code === "WALK_REQUEST_RETRYABLE") return "다른 작업과 겹쳤어요. 잠시 뒤 버튼을 한 번 더 눌러 주세요.";
  if (status === 409) return "지금은 코드를 발급할 수 없어요. 신청 상태를 다시 불러와서 확인해 주세요.";
  if (status === 403) return "이 보호소의 예약이 아니라서 코드를 발급할 수 없어요.";
  if (status === 404) return "신청을 찾을 수 없어요.";
  if (status === 500) return "서버 설정 문제로 코드를 만들지 못했어요. 관리자에게 알려 주세요.";
  return fallback;
}
