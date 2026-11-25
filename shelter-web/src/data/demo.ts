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
