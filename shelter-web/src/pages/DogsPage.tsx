import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import { mediaUrl, type ApiResult } from "../api/client";
import {
  dogWalkSettings, fetchDog, fetchShelterDogs, registerDog, updateDogTraits, updateWalkSettings,
  type DifficultyLevel, type DogDetail, type DogListItem, type DogTraits, type SizeCode, type WalkSettings,
} from "../api/dogs";
import { fieldErrors, failureText } from "../api/failure";
import { LoadView, NoServerNotice } from "../components/LoadView";
import { PageLayout } from "../components/PageLayout";
import { SlotRows } from "../components/SlotRows";
import { useLoad } from "../hooks";
import { useShelterId } from "../session";
import { emptySlot, slotToInput, type SlotDraft } from "../slots";

const SIZE_LABELS: Record<SizeCode, string> = { SMALL: "소형견", MEDIUM: "중형견", LARGE: "대형견" };
const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = { BEGINNER: "입문 봉사자도 가능", INTERMEDIATE: "경험이 조금 필요", EXPERIENCED: "경험자 권장" };
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

type DogsData = { dogs: DogListItem[]; walkableIds: Set<number> | null };

// 목록 응답에는 산책 설정이 없으므로, 산책 가능 목록(walkable=true)을 한 번 더 불러 상태를 표시한다.
async function loadDogs(shelterId: string): Promise<ApiResult<DogsData>> {
  const [all, walkable] = await Promise.all([fetchShelterDogs(shelterId), fetchShelterDogs(shelterId, true)]);
  if (!all.ok) return all;
  return { ok: true, status: all.status, data: { dogs: all.data, walkableIds: walkable.ok ? new Set(walkable.data.map((dog) => dog.id)) : null } };
}

function DogPhoto({ path, name }: { path: string | null; name: string }) {
  const url = mediaUrl(path);
  return url ? <img className="dog-photo" src={url} alt={`${name} 사진`} /> : <div className="dog-photo photo-empty">사진 없음</div>;
}

export function DogsPage() {
  const shelterId = useShelterId();
  const { state, reload } = useLoad(() => loadDogs(shelterId ?? ""), [shelterId]);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  async function toggle(dog: DogListItem, walkable: boolean) {
    if (busyId !== null) return;
    setBusyId(dog.id);
    setMessage("");
    const res = await updateWalkSettings(String(dog.id), { walkable: !walkable });
    setBusyId(null);
    if (!res.ok) setMessage(failureText(res, true));
    reload();
  }

  return (
    <PageLayout demo={false} title="강아지 관리" description="보호견의 정보와 산책 가능 상태를 관리해요.">
      {shelterId === null ? <NoServerNotice /> : (
        <>
          <a className="primary-link section-action" href="#dogs/new">강아지 등록</a>
          {message ? <p className="form-error section-action" role="alert">{message}</p> : null}
          <LoadView state={state} onRetry={reload}>{({ dogs, walkableIds }) => (
            <div className="content-list">
              {dogs.length === 0 ? <p className="empty-text">등록된 강아지가 없어요.</p> : null}
              {dogs.map((dog) => {
                const walkable = walkableIds ? walkableIds.has(dog.id) : null;
                return (
                  <article className="content-card" key={dog.id}>
                    <div className="dog-summary">
                      <DogPhoto path={dog.image_url} name={dog.name} />
                      <div>
                        <div className="card-title-row"><h2>{dog.name}</h2>{walkable === null ? null : <span className="small-badge">{walkable ? "산책 가능" : "산책 중지"}</span>}</div>
                        <p className="muted">{[dog.breed, dog.age === null ? null : `${dog.age}살`, dog.gender].filter(Boolean).join(" · ")}</p>
                        {dog.personality_keywords && dog.personality_keywords.length > 0 ? <p className="muted">{dog.personality_keywords.join(", ")}</p> : null}
                      </div>
                    </div>
                    <div className="card-actions">
                      <a className="small-action" href={`#dogs/edit/${dog.id}`}>정보 수정</a>
                      {walkable === null ? null : (
                        <button className="small-action" type="button" disabled={busyId !== null} onClick={() => void toggle(dog, walkable)}>
                          {walkable ? "산책 가능 해제" : "산책 가능으로 전환"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
              {dogs.length > 0 ? <p className="field-hint">강아지 삭제는 지원하지 않아요. 산책을 쉬게 하려면 "산책 가능 해제"를 눌러 주세요.</p> : null}
            </div>
          )}</LoadView>
        </>
      )}
    </PageLayout>
  );
}

export function DogFormPage({ dogId }: { dogId?: string }) {
  const shelterId = useShelterId();
  if (shelterId === null) {
    return <PageLayout demo={false} title={dogId ? "강아지 정보 수정" : "강아지 등록"} description="서버와 연결된 계정에서만 쓸 수 있어요." back="#dogs"><NoServerNotice /></PageLayout>;
  }
  if (!dogId) return <DogCreateForm shelterId={shelterId} />;
  return <DogEditLoader dogId={dogId} />;
}

function DogEditLoader({ dogId }: { dogId: string }) {
  const { state, reload } = useLoad(() => fetchDog(dogId), [dogId]);
  return (
    <PageLayout demo={false} title="강아지 정보 수정" description="이름, 견종, 나이와 산책 설정을 바꿀 수 있어요." back="#dogs">
      <LoadView state={state} onRetry={reload}>{(dog) => <DogEditForm dog={dog} />}</LoadView>
    </PageLayout>
  );
}

function FieldError({ errors, name }: { errors: Record<string, string>; name: string }) {
  return errors[name] ? <p className="field-error" role="alert">{errors[name]}</p> : null;
}

function DifficultyFields({ level, setLevel, score, setScore, size, setSize, minutes, setMinutes, errors }: {
  level: DifficultyLevel; setLevel: (value: DifficultyLevel) => void;
  score: string; setScore: (value: string) => void;
  size: SizeCode; setSize: (value: SizeCode) => void;
  minutes: string; setMinutes: (value: string) => void;
  errors: Record<string, string>;
}) {
  const minuteOptions = Array.from(new Set([30, 60, 90, Number(minutes)].filter((value) => Number.isInteger(value) && value > 0))).sort((a, b) => a - b);
  return (
    <>
      <label>크기<select value={size} onChange={(event) => setSize(event.target.value as SizeCode)}>
        {(Object.keys(SIZE_LABELS) as SizeCode[]).map((code) => <option key={code} value={code}>{SIZE_LABELS[code]}</option>)}
      </select></label>
      <FieldError errors={errors} name="size_code" />
      <label>봉사자 경험 수준<select value={level} onChange={(event) => setLevel(event.target.value as DifficultyLevel)}>
        {(Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map((code) => <option key={code} value={code}>{DIFFICULTY_LABELS[code]}</option>)}
      </select></label>
      <FieldError errors={errors} name="difficulty" />
      <label>산책 난이도 (1~5, 0.5 단위)<input type="number" min="1" max="5" step="0.5" value={score} onChange={(event) => setScore(event.target.value)} placeholder="예: 3.5" required /></label>
      <FieldError errors={errors} name="difficulty_score" />
      <label>최대 산책 시간 (분)<select value={minutes} onChange={(event) => setMinutes(event.target.value)}>
        {minuteOptions.map((value) => <option key={value} value={value}>{value}분</option>)}
      </select></label>
      <FieldError errors={errors} name="max_walk_minutes" />
    </>
  );
}

function validScore(value: string): number | null {
  const score = Number(value);
  if (value === "" || !Number.isFinite(score) || score < 1 || score > 5 || Math.round(score * 2) !== score * 2) return null;
  return score;
}

function DogCreateForm({ shelterId }: { shelterId: string }) {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [ageMonths, setAgeMonths] = useState("0");
  const [size, setSize] = useState<SizeCode>("SMALL");
  const [level, setLevel] = useState<DifficultyLevel>("BEGINNER");
  const [score, setScore] = useState("");
  const [minutes, setMinutes] = useState("30");
  const [precautions, setPrecautions] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [slots, setSlots] = useState<SlotDraft[]>([emptySlot()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // 사진은 원본 File을 보내고, 미리보기만 임시 주소로 보여 준다.
  const preview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && (!file.type.startsWith("image/") || file.size > MAX_PHOTO_BYTES)) {
      event.target.value = "";
      setImage(null);
      setErrors((current) => ({ ...current, image: "사진은 5MB 이하의 이미지 파일을 선택해 주세요." }));
      return;
    }
    setErrors((current) => { const { image: _removed, ...rest } = current; return rest; });
    setImage(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setMessage("");
    const found: Record<string, string> = {};
    const ageValue = Number(age);
    const monthsValue = Number(ageMonths);
    const scoreValue = validScore(score);
    if (!name.trim() || name.trim().length > 50) found.name = "이름은 1~50자로 입력해 주세요.";
    if (!breed.trim()) found.breed = "견종을 입력해 주세요.";
    if (age === "" || !Number.isInteger(ageValue) || ageValue < 0) found.age = "나이를 0 이상의 정수로 입력해 주세요.";
    if (!Number.isInteger(monthsValue) || monthsValue < 0 || monthsValue > 11) found.age_months = "개월은 0~11로 입력해 주세요.";
    if (scoreValue === null) found.difficulty_score = "1~5 사이에서 0.5 단위로 입력해 주세요.";
    if (!image) found.image = "사진을 선택해 주세요.";
    const slotInputs = slots.map(slotToInput);
    const badSlot = slotInputs.find((item) => !item.ok);
    if (badSlot && !badSlot.ok) found.slots = badSlot.message;
    if (Object.keys(found).length > 0 || !image || scoreValue === null) { setErrors(found); return; }

    setSaving(true);
    setErrors({});
    const res = await registerDog({
      name: name.trim(), breed: breed.trim(), age: ageValue, ageMonths: monthsValue, difficulty: level,
      precautions: precautions.trim(), sizeCode: size, difficultyScore: scoreValue, maxWalkMinutes: Number(minutes),
      shelterId, slots: slotInputs.flatMap((item) => (item.ok ? [item.slot] : [])), image,
    });
    setSaving(false);
    if (res.ok) { window.location.hash = "dogs"; return; }
    const perField = fieldErrors(res);
    setErrors(perField);
    if (Object.keys(perField).length === 0) {
      setMessage(res.status === 409 && !res.message ? "일정이 겹치거나 다른 작업과 충돌했어요. 날짜와 시간을 확인한 뒤 다시 시도해 주세요." : failureText(res, true));
    }
  }

  return (
    <PageLayout demo={false} title="강아지 등록" description="사진과 첫 산책 일정을 함께 등록해요." back="#dogs">
      <form className="form-card" onSubmit={submit} noValidate>
        <label>이름<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={50} /></label>
        <FieldError errors={errors} name="name" />
        <label>견종<input value={breed} onChange={(event) => setBreed(event.target.value)} placeholder="예: 믹스견" required maxLength={40} /></label>
        <FieldError errors={errors} name="breed" />
        <label>나이 (살)<input type="number" min="0" step="1" value={age} onChange={(event) => setAge(event.target.value)} required /></label>
        <FieldError errors={errors} name="age" />
        <label>나이 (개월, 0~11)<input type="number" min="0" max="11" step="1" value={ageMonths} onChange={(event) => setAgeMonths(event.target.value)} required /></label>
        <FieldError errors={errors} name="age_months" />
        <DifficultyFields level={level} setLevel={setLevel} score={score} setScore={setScore} size={size} setSize={setSize} minutes={minutes} setMinutes={setMinutes} errors={errors} />
        <label>주의사항<textarea value={precautions} onChange={(event) => setPrecautions(event.target.value)} rows={4} maxLength={500} placeholder="산책 시 주의할 점을 입력해 주세요" /></label>
        <FieldError errors={errors} name="precautions" />
        <label>사진<input type="file" accept="image/*" onChange={choosePhoto} /></label>
        <p className="field-hint">이미지 5MB 이하 · 사진은 꼭 필요해요.</p>
        <FieldError errors={errors} name="image" />
        {preview ? <div className="photo-preview"><img src={preview} alt="선택한 강아지 사진 미리보기" /></div> : null}
        <h2>첫 산책 일정</h2>
        <p className="field-hint">시간은 한국 시간이에요. 일정은 한 개 이상 필요해요.</p>
        <SlotRows slots={slots} onChange={setSlots} disabled={saving} />
        <FieldError errors={errors} name="slots" />
        {message ? <p className="form-error" role="alert">{message}</p> : null}
        <button className="primary-button" disabled={saving} type="submit">{saving ? "등록 중" : "등록하기"}</button>
        <a className="secondary-link" href="#dogs">취소</a>
      </form>
    </PageLayout>
  );
}

function DogEditForm({ dog }: { dog: DogDetail }) {
  const settings = dogWalkSettings(dog);
  const [name, setName] = useState(dog.name);
  const [breed, setBreed] = useState(dog.breed ?? "");
  const [age, setAge] = useState(dog.age === null || dog.age === undefined ? "" : String(dog.age));
  const [size, setSize] = useState<SizeCode>(settings.size_code ?? "SMALL");
  const [level, setLevel] = useState<DifficultyLevel>(settings.difficulty ?? "BEGINNER");
  const [score, setScore] = useState(settings.difficulty_score === null || settings.difficulty_score === undefined ? "" : String(settings.difficulty_score));
  const [minutes, setMinutes] = useState(String(settings.max_walk_minutes ?? 30));
  const [precautions, setPrecautions] = useState(settings.precautions ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const photo = mediaUrl(dog.image_url ?? null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setMessage("");
    const found: Record<string, string> = {};
    const ageValue = Number(age);
    const scoreValue = validScore(score);
    if (!name.trim() || name.trim().length > 50) found.name = "이름은 1~50자로 입력해 주세요.";
    if (!breed.trim()) found.breed = "견종을 입력해 주세요.";
    if (age === "" || !Number.isInteger(ageValue) || ageValue < 0) found.age = "나이를 0 이상의 정수로 입력해 주세요.";
    if (scoreValue === null) found.difficulty_score = "1~5 사이에서 0.5 단위로 입력해 주세요.";
    if (Object.keys(found).length > 0 || scoreValue === null) { setErrors(found); return; }

    // 바뀐 칸만 보낸다. traits에는 서버가 돌려준 나머지 값(성별, 몸무게 등)을 그대로 함께 보내 지워지지 않게 한다.
    const traitsChanged = name.trim() !== dog.name || breed.trim() !== (dog.breed ?? "") || ageValue !== dog.age;
    const traits: DogTraits = { name: name.trim(), breed: breed.trim(), age: ageValue };
    if (dog.gender) traits.gender = dog.gender;
    if (dog.weight !== null && dog.weight !== undefined && dog.weight !== "") traits.weight = dog.weight;
    if (dog.special_note) traits.special_note = dog.special_note;
    if (dog.description) traits.description = dog.description;

    const walk: WalkSettings = {};
    if (size !== settings.size_code) walk.size_code = size;
    if (level !== settings.difficulty) walk.difficulty = level;
    if (scoreValue !== settings.difficulty_score) walk.difficulty_score = scoreValue;
    if (Number(minutes) !== settings.max_walk_minutes) walk.max_walk_minutes = Number(minutes);
    if (precautions.trim() !== (settings.precautions ?? "")) walk.precautions = precautions.trim();
    const walkChanged = Object.keys(walk).length > 0;
    if (!traitsChanged && !walkChanged) { setErrors({}); setMessage("바뀐 내용이 없어요."); return; }

    setSaving(true);
    setErrors({});
    const dogId = String(dog.id);
    if (traitsChanged) {
      const res = await updateDogTraits(dogId, traits);
      if (!res.ok) { setSaving(false); fail(res); return; }
    }
    if (walkChanged) {
      const res = await updateWalkSettings(dogId, walk);
      if (!res.ok) {
        setSaving(false);
        fail(res, traitsChanged ? "이름, 견종, 나이는 저장됐지만 산책 설정은 저장하지 못했어요. " : "");
        return;
      }
    }
    setSaving(false);
    window.location.hash = "dogs";
  }

  function fail(res: Extract<ApiResult<unknown>, { ok: false }>, prefix = "") {
    const perField = fieldErrors(res);
    setErrors(perField);
    if (Object.keys(perField).length === 0 || prefix) setMessage(prefix + failureText(res, true));
  }

  return (
    <form className="form-card" onSubmit={submit} noValidate>
      {photo ? <div className="photo-preview"><img src={photo} alt={`${dog.name} 사진`} /></div> : null}
      <p className="field-hint">사진은 여기서 바꿀 수 없어요. 성별과 몸무게 등은 그대로 유지돼요.</p>
      <label>이름<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={50} /></label>
      <FieldError errors={errors} name="name" />
      <label>견종<input value={breed} onChange={(event) => setBreed(event.target.value)} required maxLength={40} /></label>
      <FieldError errors={errors} name="breed" />
      <label>나이 (살)<input type="number" min="0" step="1" value={age} onChange={(event) => setAge(event.target.value)} required /></label>
      <FieldError errors={errors} name="age" />
      <DifficultyFields level={level} setLevel={setLevel} score={score} setScore={setScore} size={size} setSize={setSize} minutes={minutes} setMinutes={setMinutes} errors={errors} />
      <label>주의사항<textarea value={precautions} onChange={(event) => setPrecautions(event.target.value)} rows={4} maxLength={500} /></label>
      <FieldError errors={errors} name="precautions" />
      {message ? <p className="form-error" role="alert">{message}</p> : null}
      <button className="primary-button" disabled={saving} type="submit">{saving ? "저장 중" : "저장하기"}</button>
      <a className="secondary-link" href="#dogs">취소</a>
    </form>
  );
}
