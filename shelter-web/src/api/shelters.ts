import { api } from "./client";

// GET /shelters/{id}. 이름, 연락처, 주소, 웹사이트는 수정 API가 없다.
export type Shelter = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  website_url: string | null;
  region_code: string | null;
};

export function fetchShelter(shelterId: string) {
  return api.get<Shelter>(`/shelters/${encodeURIComponent(shelterId)}`);
}

export type RegionUpdated = { shelter_id: number; region_code: string; region_name: string };

// 422는 선택할 수 없는 지역 코드다.
export function updateShelterRegion(shelterId: string, regionCode: string) {
  return api.patch<RegionUpdated>(`/shelters/${encodeURIComponent(shelterId)}/region`, { region_code: regionCode });
}

export type RegionItem = { region_code: string; region_name: string };
export type SigunguItem = RegionItem & { sido_code: string };

export function fetchSido() {
  return api.get<{ regions: RegionItem[] }>("/regions/sido", { auth: false });
}

export function fetchSigungu(sidoCode: string) {
  return api.get<{ sido_code: string; regions: SigunguItem[] }>(
    `/regions/sigungu?sido_code=${encodeURIComponent(sidoCode)}`,
    { auth: false },
  );
}
