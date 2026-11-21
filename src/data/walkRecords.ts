import type { WalkRecord } from "../types/models";

export const walkRecords: WalkRecord[] = [
  {
    id: "walk-kongi-2026-11-12",
    dogId: "kongi",
    displayName: "콩이와 산책",
    displayDistance: "13km",
    displayDate: "11.12.",
    startedAt: "2026-11-12T14:00:00",
    durationSeconds: 5400,
    distanceMeters: 13000,
    shelterName: "행복 보호소",
  },
  {
    id: "walk-choco-2026-11-22",
    dogId: "moka",
    displayName: "초코랑 산책",
    displayDistance: "2km",
    displayDate: "11.22.",
    startedAt: "2026-11-22T10:00:00",
    durationSeconds: 3600,
    distanceMeters: 2000,
    shelterName: "해피 보호소",
  },
  {
    id: "walk-baekho-2026-12-01",
    dogId: "kongi",
    displayName: "백호랑 산책",
    displayDistance: "0.5km",
    displayDate: "12.01.",
    startedAt: "2026-12-01T09:30:00",
    durationSeconds: 2700,
    distanceMeters: 500,
    shelterName: "우와 보호소",
  },
];
