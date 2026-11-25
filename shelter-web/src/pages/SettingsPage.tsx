import { useEffect, useState, type FormEvent } from "react";

import { failureText } from "../api/failure";
import { fetchShelter, fetchSido, fetchSigungu, updateShelterRegion, type Shelter } from "../api/shelters";
import { LoadView, NoServerNotice } from "../components/LoadView";
import { PageLayout } from "../components/PageLayout";
import { useLoad } from "../hooks";
import { useShelterId } from "../session";

export function SettingsPage() {
  const shelterId = useShelterId();
  const { state, reload } = useLoad(() => fetchShelter(shelterId ?? ""), [shelterId]);
  return (
    <PageLayout title="보호소 설정" description="보호소의 기본 정보를 확인하고 활동 지역을 바꿔요.">
      {shelterId === null ? <NoServerNotice /> : (
        <LoadView state={state} onRetry={reload}>{(shelter) => <ShelterSettings shelterId={shelterId} shelter={shelter} />}</LoadView>
      )}
      <div className="content-card section-action"><h2>보호소 인증</h2><p className="body-copy">인증 방식은 아직 정해지지 않았어요.</p><a className="inline-link" href="#verification">인증 안내 보기</a></div>
    </PageLayout>
  );
}

function ShelterSettings({ shelterId, shelter }: { shelterId: string; shelter: Shelter }) {
  const rows: [string, string | null][] = [
    ["이름", shelter.name],
    ["연락처", shelter.phone],
    ["주소", shelter.address],
    ["웹사이트", shelter.website_url],
  ];
  return (
    <>
      <div className="content-card section-action">
        <h2>보호소 정보</h2>
        <dl className="details-list">
          {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "등록되지 않았어요"}</dd></div>)}
        </dl>
        <p className="field-hint">이름과 연락처는 담당자에게 문의해 주세요. 이 화면에서는 바꿀 수 없어요.</p>
      </div>
      <RegionForm shelterId={shelterId} initialCode={shelter.region_code} />
    </>
  );
}

function RegionForm({ shelterId, initialCode }: { shelterId: string; initialCode: string | null }) {
  const sido = useLoad(() => fetchSido(), []);
  const [sidoCode, setSidoCode] = useState("");
  const [sigunguCode, setSigunguCode] = useState("");
  const [sigungu, setSigungu] = useState<{ region_code: string; region_name: string }[]>([]);
  const [loadingSigungu, setLoadingSigungu] = useState(false);
  const [currentCode, setCurrentCode] = useState(initialCode);
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sidoCode) { setSigungu([]); return; }
    let active = true;
    setLoadingSigungu(true);
    setError("");
    void fetchSigungu(sidoCode).then((res) => {
      if (!active) return;
      setLoadingSigungu(false);
      if (res.ok) setSigungu(res.data.regions);
      else { setSigungu([]); setError(failureText(res)); }
    });
    return () => { active = false; };
  }, [sidoCode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (!sigunguCode) { setError("시도와 시군구를 선택해 주세요."); return; }
    setSaving(true);
    setError("");
    setMessage("");
    const res = await updateShelterRegion(shelterId, sigunguCode);
    setSaving(false);
    if (res.ok) {
      setCurrentCode(res.data.region_code);
      setCurrentName(res.data.region_name);
      setMessage(`활동 지역을 ${res.data.region_name}(으)로 바꿨어요.`);
    } else if (res.status === 422) {
      setError("선택할 수 없는 지역이에요. 다른 시군구를 골라 주세요.");
    } else {
      setError(failureText(res));
    }
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h2>활동 지역</h2>
      <p className="muted">현재 지역: {currentName ?? (currentCode ? `지역 코드 ${currentCode}` : "정해지지 않았어요")}</p>
      {sido.state.status === "error" ? (
        <>
          <p className="form-error" role="alert">{failureText(sido.state.failure)}</p>
          <button className="small-action" type="button" onClick={sido.reload}>시도 목록 다시 불러오기</button>
        </>
      ) : (
        <>
          <label>시도
            <select value={sidoCode} onChange={(event) => { setSidoCode(event.target.value); setSigunguCode(""); setMessage(""); }} disabled={sido.state.status !== "ok"}>
              <option value="">{sido.state.status === "ok" ? "시도를 선택해 주세요" : "불러오는 중"}</option>
              {sido.state.status === "ok" ? sido.state.data.regions.map((region) => <option key={region.region_code} value={region.region_code}>{region.region_name}</option>) : null}
            </select>
          </label>
          <label>시군구
            <select value={sigunguCode} onChange={(event) => { setSigunguCode(event.target.value); setMessage(""); }} disabled={!sidoCode || loadingSigungu}>
              <option value="">{loadingSigungu ? "불러오는 중" : "시군구를 선택해 주세요"}</option>
              {sigungu.map((region) => <option key={region.region_code} value={region.region_code}>{region.region_name}</option>)}
            </select>
          </label>
        </>
      )}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {message ? <p className="field-hint" role="status">{message}</p> : null}
      <button className="primary-button" type="submit" disabled={saving || !sigunguCode}>{saving ? "저장 중" : "지역 저장"}</button>
    </form>
  );
}

export function VerificationPage() {
  return (
    <PageLayout title="보호소 인증" description="보호소 확인 절차를 안내하는 화면이에요." back="#login">
      <div className="content-card section-action">
        <h2>인증 절차 준비 중</h2>
        <p className="body-copy">인증 방법과 필요한 서류, 승인 기준은 아직 정해지지 않았어요.</p>
        <p className="field-hint">현재 신청 접수와 서류 업로드는 지원하지 않아요. 미리보기는 인증 없이 이용할 수 있어요.</p>
        <a className="inline-link" href="#dashboard">대시보드 미리보기</a>
      </div>
    </PageLayout>
  );
}
