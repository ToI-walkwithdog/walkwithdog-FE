import { api } from "./client";
import type { DogSizeCode } from "./bookingCodes";

// app/walk_schemas.py의 AvailableDog 계열. 시각은 UTC ISO 8601이다.
export type AvailableDateSlot = {
  date_slot_id: number;
  starts_at: string;
  ends_at: string;
};

export type AvailableDog = {
  dog_id: number;
  name: string;
  image_url: string | null;
  size_code: DogSizeCode | null;
  difficulty_score: number | null;
  max_walk_minutes: number | null;
  shelter: {
    id: number;
    name: string;
    region_code: string | null;
    region_name: string | null;
  };
  date_slots: AvailableDateSlot[];
};

export type AvailableDogPreview = AvailableDog & {
  has_more_date_slots: boolean;
};

export type AvailableDogDetail = AvailableDog & {
  description: string | null;
  precautions: string | null;
};

export type AvailabilityPage = {
  items: AvailableDogPreview[];
  limit: number;
  offset: number;
  has_more: boolean;
  next_offset: number | null;
};

export const AVAILABILITY_PAGE_SIZE = 20;

type AvailabilityQuery = {
  regionCodes: string[];
  sizeCode: DogSizeCode | null;
  offset: number;
  limit?: number;
};

// region_codes는 같은 이름을 반복해서 보낸다(1~3개).
export function fetchWalkAvailability({
  regionCodes,
  sizeCode,
  offset,
  limit = AVAILABILITY_PAGE_SIZE,
}: AvailabilityQuery) {
  const params = regionCodes.map(
    (code) => `region_codes=${encodeURIComponent(code)}`,
  );
  if (sizeCode) params.push(`size_code=${sizeCode}`);
  params.push(`limit=${limit}`, `offset=${offset}`);
  return api.get<AvailabilityPage>(`/dogs/walk-availability?${params.join("&")}`);
}

export function fetchDogAvailability(dogId: number) {
  return api.get<AvailableDogDetail>(`/dogs/${dogId}/walk-availability`);
}
