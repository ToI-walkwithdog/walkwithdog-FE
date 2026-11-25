// 산책 중 화면(5-x)의 라벨과 BE 코드 대응표. BE 값은 app/walk_record_schemas.py의
// WalkMarkerCreate.marker_type, WalkIncidentCreate.incident_type과 같다.
import type { IncidentType, MarkerType } from "./walks";

// 마커 메뉴. 포토스팟은 BE에 전용 유형이 없어 OTHER와 메모("포토스팟")로 저장한다.
export const MARKER_ITEMS: { label: string; type: MarkerType; memo?: string }[] = [
  { label: "냄새 맡기", type: "SNIFF" },
  { label: "배변", type: "POOP" },
  { label: "다른 개", type: "DOG_ENCOUNTER" },
  { label: "포토스팟", type: "OTHER", memo: "포토스팟" },
];

// 신고 유형. "기타"는 설명이 필요하다(5-5-other).
export const INCIDENT_ITEMS: { label: string; type: IncidentType }[] = [
  { label: "도주", type: "LOST_DOG" },
  { label: "부상", type: "INJURY" },
  { label: "배변봉투 부족", type: "POOP_NO_BAG" },
  { label: "이물질 섭취", type: "ATE_FOREIGN_OBJECT" },
  { label: "기타", type: "OTHER" },
];

export function incidentTypeForLabel(label: string): IncidentType | null {
  return INCIDENT_ITEMS.find((item) => item.label === label)?.type ?? null;
}

export const INCIDENT_DESCRIPTION_MAX = 1000;
