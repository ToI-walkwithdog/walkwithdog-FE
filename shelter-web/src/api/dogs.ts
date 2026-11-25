import { api } from "./client";

export type SizeCode = "SMALL" | "MEDIUM" | "LARGE";
export type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "EXPERIENCED";

// GET /shelters/{id}/dogs 항목. 산책 설정은 들어 있지 않다.
export type DogListItem = {
  id: number;
  name: string;
  breed: string | null;
  age: number | null;
  gender: string | null;
  image_url: string | null;
  personality_keywords?: string[] | null;
};

export function fetchShelterDogs(shelterId: string, walkableOnly = false) {
  const query = walkableOnly ? "?walkable=true" : "";
  return api.get<DogListItem[]>(`/shelters/${encodeURIComponent(shelterId)}/dogs${query}`);
}

export type WalkSettings = {
  walkable?: boolean | null;
  difficulty?: DifficultyLevel | null;
  precautions?: string | null;
  recommended_duration_minutes?: number | null;
  size_code?: SizeCode | null;
  difficulty_score?: number | null;
  max_walk_minutes?: number | null;
};

// GET /dogs/{id}. 응답 모양은 BE 문서에 없어 필드를 모두 선택으로 두고, 설정은 walk_settings 안(없으면 최상위)에서 읽는다.
export type DogDetail = WalkSettings & {
  id: number;
  name: string;
  breed?: string | null;
  age?: number | null;
  gender?: string | null;
  weight?: number | string | null;
  special_note?: string | null;
  description?: string | null;
  image_url?: string | null;
  walk_settings?: WalkSettings | null;
};

export function fetchDog(dogId: string) {
  return api.get<DogDetail>(`/dogs/${encodeURIComponent(dogId)}`);
}

export function dogWalkSettings(dog: DogDetail): WalkSettings {
  return dog.walk_settings ?? dog;
}

export type DateSlotInput = {
  slot_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: 30 | 60 | 90;
};

// POST /dogs/walk-registration (multipart). 이미지는 원본 File을 그대로 보내고 Content-Type은 브라우저가 붙인다.
export type DogRegistration = {
  name: string;
  breed: string;
  age: number;
  ageMonths: number;
  difficulty: DifficultyLevel;
  precautions: string;
  sizeCode: SizeCode;
  difficultyScore: number;
  maxWalkMinutes: number;
  shelterId: string;
  slots: DateSlotInput[];
  image: File;
};

export function registerDog(input: DogRegistration) {
  const form = new FormData();
  form.append("name", input.name);
  form.append("breed", input.breed);
  form.append("age", String(input.age));
  form.append("age_months", String(input.ageMonths));
  form.append("difficulty", input.difficulty);
  form.append("precautions", input.precautions);
  form.append("size_code", input.sizeCode);
  form.append("difficulty_score", String(input.difficultyScore));
  form.append("max_walk_minutes", String(input.maxWalkMinutes));
  form.append("shelter_id", input.shelterId);
  form.append("slots", JSON.stringify(input.slots));
  form.append("image", input.image);
  return api.post<unknown>("/dogs/walk-registration", form);
}

// PATCH /dogs/{id}/walk-settings. 한 가지 이상 보내야 한다.
export function updateWalkSettings(dogId: string, body: WalkSettings) {
  return api.patch<unknown>(`/dogs/${encodeURIComponent(dogId)}/walk-settings`, body);
}

export type DogTraits = {
  name?: string;
  breed?: string;
  age?: number;
  gender?: string;
  weight?: number | string;
  special_note?: string;
  description?: string;
};

// PUT /dogs/{id}/traits
export function updateDogTraits(dogId: string, body: DogTraits) {
  return api.put<unknown>(`/dogs/${encodeURIComponent(dogId)}/traits`, body);
}
