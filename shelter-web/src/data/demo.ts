export type DemoDog = {
  id: string;
  name: string;
  breed: string;
  age: number;
  size: "소형견" | "중형견" | "대형견";
  difficulty: number;
  notes: string;
  photo: string | null;
  active: boolean;
};

export type DemoSchedule = {
  id: string;
  dogId: string;
  date: string;
  start: string;
  end: string;
  maxMinutes: number;
  active: boolean;
};

export type DemoBooking = {
  id: string;
  dogId: string;
  scheduleId: string;
  applicant: string;
  age: number;
  experience: string;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
};

export type DemoReport = {
  id: string;
  kind: "incoming" | "outgoing";
  title: string;
  person: string;
  dogName: string;
  message: string;
  reviewed: boolean;
};

export type DemoWalk = {
  id: string;
  dogName: string;
  applicant: string;
  date: string;
  duration: string;
  distance: string;
  memo: string;
  evaluation: string;
};

export type DemoShelter = { name: string; area: string; phone: string };

export const initialShelter: DemoShelter = {
  name: "행복 보호소",
  area: "서울 성북구",
  phone: "",
};

export const initialDogs: DemoDog[] = [
  { id: "kongi", name: "콩이", breed: "믹스견", age: 3, size: "소형견", difficulty: 3.5, notes: "활동량이 많아요.", photo: null, active: true },
];

export const initialSchedules: DemoSchedule[] = [
  { id: "schedule-1", dogId: "kongi", date: "2026-11-13", start: "10:00", end: "11:00", maxMinutes: 30, active: true },
];

export const initialBookings: DemoBooking[] = [
  { id: "booking-1", dogId: "kongi", scheduleId: "schedule-1", applicant: "봉사자 A", age: 27, experience: "반려견 돌봄 경험 있음 · 주 1~2회 산책", status: "pending" },
];

export const initialReports: DemoReport[] = [
  { id: "report-1", kind: "incoming", title: "부상", person: "봉사자 A", dogName: "콩이", message: "발을 살펴봐 주세요. (예시)", reviewed: false },
];

export const initialWalks: DemoWalk[] = [
  { id: "walk-1", dogName: "콩이", applicant: "봉사자 A", date: "2026-11-12", duration: "32분 15초", distance: "2.4 km", memo: "천천히 산책했어요. (예시)", evaluation: "" },
];

let nextId = 0;
export function newDemoId(prefix: string) {
  nextId += 1;
  return `${prefix}-${Date.now()}-${nextId}`;
}
