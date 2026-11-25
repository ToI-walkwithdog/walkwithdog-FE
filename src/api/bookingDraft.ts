// 산책 예약 화면(7-1~7-5, 홈) 사이에서 값을 넘기는 메모리 저장소. 디스크에 저장하지 않는다.
import type { DogSizeCode } from "./bookingCodes";
import type {
  AvailableDateSlot,
  AvailableDogDetail,
  AvailableDogPreview,
} from "./dogs";
import type { MyWalkRequest, WalkRequestReceipt } from "./walkRequests";

// 7-1이 불러온 첫 페이지. 7-2가 이어서 쓴다.
export type AvailabilityList = {
  regionCodes: string[];
  regionNames: string[];
  sizeCode: DogSizeCode | null;
  items: AvailableDogPreview[];
  hasMore: boolean;
  nextOffset: number | null;
};

let availabilityList: AvailabilityList | null = null;
let selectedDogId: number | null = null;

export function getAvailabilityList() {
  return availabilityList;
}

export function setAvailabilityList(value: AvailabilityList) {
  availabilityList = value;
}

export function getSelectedDogId() {
  return selectedDogId;
}

export function setSelectedDogId(id: number) {
  selectedDogId = id;
}

// 7-3에서 고른 강아지와 일정. 7-4가 신청한다.
export type ApplicationTarget = {
  dog: AvailableDogDetail;
  slot: AvailableDateSlot;
};

let applicationTarget: ApplicationTarget | null = null;

export function getApplicationTarget() {
  return applicationTarget;
}

export function setApplicationTarget(value: ApplicationTarget) {
  applicationTarget = value;
}

// Idempotency-Key. 같은 강아지와 일정의 신청이면 화면을 다시 열어도 같은 키를 쓴다.
// 응답이 유실된 신청을 다른 키로 다시 보내 중복 신청이 되는 것을 막는다.
let pendingKey: { key: string; dogId: number; slotId: number } | null = null;

export function applicationKeyFor(
  dogId: number,
  slotId: number,
  create: () => string,
): string {
  if (pendingKey && pendingKey.dogId === dogId && pendingKey.slotId === slotId) {
    return pendingKey.key;
  }
  pendingKey = { key: create(), dogId, slotId };
  return pendingKey.key;
}

export function clearApplicationKey() {
  pendingKey = null;
}

// 7-5에 보여 줄 접수 결과.
export type SubmittedApplication = {
  receipt: WalkRequestReceipt;
  dogName: string;
  imageUrl: string | null;
  shelterName: string;
};

let submittedApplication: SubmittedApplication | null = null;

export function getSubmittedApplication() {
  return submittedApplication;
}

export function setSubmittedApplication(value: SubmittedApplication) {
  submittedApplication = value;
}

// 홈 "산책 시작하개"가 찾은 시작 가능한 예약. 4-x(보호소 코드)가 이어서 쓴다.
let startableRequest: MyWalkRequest | null = null;

export function getStartableRequest() {
  return startableRequest;
}

export function setStartableRequest(value: MyWalkRequest | null) {
  startableRequest = value;
}

export function clearBookingDraft() {
  availabilityList = null;
  selectedDogId = null;
  applicationTarget = null;
  pendingKey = null;
  submittedApplication = null;
  startableRequest = null;
}
