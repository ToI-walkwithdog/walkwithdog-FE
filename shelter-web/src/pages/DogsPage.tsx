import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { PageLayout } from "../components/PageLayout";
import { useDemo } from "../DemoContext";
import { newDemoId, type DemoDog } from "../data/demo";

export function DogsPage() {
  const { dogs, toggleDog } = useDemo();

  return (
    <PageLayout title="강아지 관리" description="보호견의 정보와 산책 가능 상태를 관리해요.">
      <a className="primary-link section-action" href="#dogs/new">강아지 등록</a>
      <div className="content-list">
        {dogs.length === 0 ? <p className="empty-text">등록된 예시 강아지가 없어요.</p> : null}
        {dogs.map((dog) => (
          <article className="content-card" key={dog.id}>
            <div className="dog-summary">
              {dog.photo ? <img className="dog-photo" src={dog.photo} alt={`${dog.name} 사진`} /> : <div className="dog-photo photo-empty">사진 없음</div>}
              <div>
                <div className="card-title-row"><h2>{dog.name}</h2><span className="small-badge">{dog.active ? "등록 중" : "일시 중지"}</span></div>
                <p className="muted">{dog.breed} · {dog.age}살 · {dog.size}</p>
                <p className="muted">산책 난이도 {dog.difficulty}</p>
              </div>
            </div>
            <div className="card-actions">
              <a className="small-action" href={`#dogs/edit/${dog.id}`}>정보 수정</a>
              <button className="small-action" type="button" onClick={() => toggleDog(dog.id)}>
                {dog.active ? "등록 일시 중지" : "등록 재개"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </PageLayout>
  );
}

export function DogFormPage({ dogId }: { dogId?: string }) {
  const { dogs } = useDemo();
  const existing = dogId ? dogs.find((dog) => dog.id === dogId) : undefined;
  if (dogId && !existing) return <PageLayout title="강아지 정보 없음" description="요청한 예시 강아지를 찾을 수 없어요." back="#dogs"><a className="secondary-link section-action" href="#dogs">목록으로</a></PageLayout>;
  return <DogForm key={dogId ?? "new"} existing={existing} />;
}

function DogForm({ existing }: { existing: DemoDog | undefined }) {
  const { saveDog } = useDemo();
  const [name, setName] = useState(existing?.name ?? "");
  const [breed, setBreed] = useState(existing?.breed ?? "");
  const [age, setAge] = useState(existing ? String(existing.age) : "");
  const [size, setSize] = useState<DemoDog["size"]>(existing?.size ?? "소형견");
  const [difficulty, setDifficulty] = useState(existing ? String(existing.difficulty) : "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [photo, setPhoto] = useState(existing?.photo ?? null);
  const [message, setMessage] = useState("");
  const [reading, setReading] = useState(false);
  const readerRef = useRef<FileReader | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => () => { readerRef.current?.abort(); }, []);

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    readerRef.current?.abort();
    const file = event.target.files?.[0];
    if (!file) { setReading(false); return; }
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setReading(false);
      setMessage("사진은 5MB 이하의 이미지 파일을 선택해 주세요.");
      event.target.value = "";
      return;
    }
    setMessage("");
    setReading(true);
    const reader = new FileReader();
    readerRef.current = reader;
    reader.onload = () => {
      if (readerRef.current !== reader) return;
      if (typeof reader.result !== "string") {
        setMessage("사진을 읽지 못했어요. 다시 선택해 주세요.");
      } else {
        setPhoto(reader.result);
      }
      setReading(false);
      readerRef.current = null;
    };
    reader.onerror = () => {
      if (readerRef.current !== reader) return;
      setMessage("사진을 읽지 못했어요. 다시 선택해 주세요.");
      setReading(false);
      readerRef.current = null;
    };
    reader.readAsDataURL(file);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !breed.trim() || age === "" || difficulty === "") {
      setMessage("이름, 견종, 나이와 난이도를 확인해 주세요.");
      return;
    }
    const ageValue = Number(age);
    const difficultyValue = Number(difficulty);
    if (!Number.isInteger(ageValue) || ageValue < 0 || !Number.isFinite(difficultyValue) || difficultyValue < 0) {
      setMessage("나이와 난이도를 올바르게 입력해 주세요.");
      return;
    }
    saveDog({ id: existing?.id ?? newDemoId("dog"), name: name.trim(), breed: breed.trim(), age: ageValue, size, difficulty: difficultyValue, notes: notes.trim(), photo, active: existing?.active ?? true });
    window.location.hash = "dogs";
  }

  return (
    <PageLayout title={existing ? "강아지 정보 수정" : "강아지 등록"} description="입력한 정보는 서버에 저장되지 않아요." back="#dogs">
      <form className="form-card" onSubmit={submit}>
        <label>이름<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={30} /></label>
        <label>견종<input value={breed} onChange={(event) => setBreed(event.target.value)} placeholder="예: 믹스견" required maxLength={40} /></label>
        <label>나이 (살)<input type="number" min="0" step="1" value={age} onChange={(event) => setAge(event.target.value)} required /></label>
        <label>크기<select value={size} onChange={(event) => {
          const value = event.target.value;
          if (value === "소형견" || value === "중형견" || value === "대형견") setSize(value);
        }}><option>소형견</option><option>중형견</option><option>대형견</option></select></label>
        <label>산책 난이도<input type="number" min="0" step="0.1" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} placeholder="예: 3.5" required /></label>
        <p className="field-hint">난이도 기준은 백엔드 연동 전에 정해야 해요.</p>
        <label>주의사항<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} maxLength={500} placeholder="산책 시 주의할 점을 입력해 주세요" /></label>
        <label>사진<input ref={photoInputRef} type="file" accept="image/*" onChange={choosePhoto} /></label>
        <p className="field-hint">이미지 5MB 이하 · 선택한 파일은 전송되지 않고 이 탭에서만 보여요.</p>
        {photo ? <div className="photo-preview"><img src={photo} alt="선택한 강아지 사진 미리보기" /><button className="small-action" type="button" onClick={() => { readerRef.current?.abort(); readerRef.current = null; if (photoInputRef.current) photoInputRef.current.value = ""; setReading(false); setPhoto(null); }}>사진 제거</button></div> : null}
        {message ? <p className="form-error" role="alert">{message}</p> : null}
        <button className="primary-button" disabled={reading} type="submit">{reading ? "사진 읽는 중" : "목업에 저장"}</button>
        <a className="secondary-link" href="#dogs">취소</a>
      </form>
    </PageLayout>
  );
}
