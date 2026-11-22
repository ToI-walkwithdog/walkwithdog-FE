import { useState, type FormEvent } from "react";

import { PageLayout } from "../components/PageLayout";
import { useDemo } from "../DemoContext";

export function SettingsPage() {
  const { shelter, setShelter, reset } = useDemo();
  const [name, setName] = useState(shelter.name);
  const [area, setArea] = useState(shelter.area);
  const [phone, setPhone] = useState(shelter.phone);
  const [message, setMessage] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !area.trim()) { setMessage("보호소 이름과 지역을 입력해 주세요."); return; }
    setShelter({ name: name.trim(), area: area.trim(), phone: phone.trim() });
    setMessage("보호소 정보를 목업에 저장했어요. 서버로 전송되지 않았어요.");
  }
  function resetPreview() {
    if (!window.confirm("모든 목업 변경 내용을 초기 예시로 되돌릴까요?")) return;
    reset();
    window.location.hash = "dashboard";
  }
  return (
    <PageLayout title="보호소 설정" description="보호소의 기본 정보를 확인하고 수정해요.">
      <form className="form-card" onSubmit={submit}>
        <label>보호소 이름<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} /></label>
        <label>보호소 지역<input value={area} onChange={(event) => setArea(event.target.value)} required maxLength={100} /></label>
        <label>연락처 (선택)<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30} /></label>
        {message ? <p className="field-hint" role="status">{message}</p> : null}
        <button className="primary-button" type="submit">목업에 저장</button>
      </form>
      <div className="content-card section-action"><h2>보호소 인증</h2><p className="body-copy">인증 방식은 아직 정해지지 않았어요.</p><a className="inline-link" href="#verification">인증 안내 보기</a></div>
      <button className="secondary-button section-action" type="button" onClick={resetPreview}>모든 목업 내용 초기화</button>
    </PageLayout>
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
