// 산책 화면(4-x, 5-x)과 이어지는 6-x 사이에서 값을 넘기는 메모리 저장소. 디스크에 저장하지 않는다.
import type { Walk } from "./walks";

// 보호소 코드 확인을 마친 예약. 4-4가 이 예약으로 POST /walks를 호출한다.
let verifiedRequestId: number | null = null;

export function getVerifiedRequestId() {
  return verifiedRequestId;
}

export function setVerifiedRequestId(id: number | null) {
  verifiedRequestId = id;
}

// 산책 중 화면에 보여 줄 강아지와 보호소 정보(GET /walk-requests/{id}).
export type WalkContext = {
  walkRequestId: number;
  dogName: string;
  imageUrl: string | null;
  shelterName: string;
  // 종료 전 승인 예약의 본인에게만 온다. 없으면 null.
  shelterPhone: string | null;
};

let walkContext: WalkContext | null = null;

export function getWalkContext() {
  return walkContext;
}

export function setWalkContext(value: WalkContext | null) {
  walkContext = value;
}

// 종료한 산책(PATCH end 응답). 6-x가 이어서 쓴다.
let endedWalk: Walk | null = null;

export function getEndedWalk() {
  return endedWalk;
}

export function setEndedWalk(value: Walk | null) {
  endedWalk = value;
}

export function clearWalkSession() {
  verifiedRequestId = null;
  walkContext = null;
  endedWalk = null;
}
