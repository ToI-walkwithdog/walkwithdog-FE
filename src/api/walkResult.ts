// 산책을 마친 뒤의 화면(6-1 인계, 6-2 기록 저장, 6-3 레벨업, 9-x 이력)이 값을 넘기는 메모리 저장소와 도우미.
import type { ApiFailure, ApiResult } from "./client";
import { errorMessage } from "./errorMessages";
import { fetchWalkRequestDetail } from "./walkRequests";
import { getEndedWalk, setEndedWalk } from "./walkSession";
import {
  fetchWalkDetail,
  fetchWalkHistory,
  fetchWalkSummary,
  type HandoverStatus,
  type Walk,
  type WalkHistoryItem,
  type WalkSummary,
} from "./walks";

// 지금 인계와 기록을 다루는 산책. 이력에서 고른 산책이거나 방금 끝낸 산책이다.
let resultWalkId: number | null = null;

export function getResultWalkId() {
  return resultWalkId;
}

export function setResultWalkId(id: number | null) {
  resultWalkId = id;
}

// 6-3이 보여 줄 레벨업 이벤트.
export type LevelUpEvent = NonNullable<WalkSummary["level_up_event"]>;

let levelUpEvent: LevelUpEvent | null = null;

export function getLevelUpEvent() {
  return levelUpEvent;
}

export function setLevelUpEvent(value: LevelUpEvent | null) {
  levelUpEvent = value;
}

// 9-1에서 고른 이력 항목. 9-2가 강아지와 보호소 이름을 여기서 쓴다.
let selectedHistoryItem: WalkHistoryItem | null = null;

export function getSelectedHistoryItem() {
  return selectedHistoryItem;
}

export function setSelectedHistoryItem(value: WalkHistoryItem | null) {
  selectedHistoryItem = value;
}

// 이력 목록의 캐시 세대. 인계나 메모를 저장하면 올리고, 목록은 다시 보일 때 첫 페이지부터 새로 불러온다.
let historyVersion = 0;

export function getHistoryVersion() {
  return historyVersion;
}

export function invalidateHistoryCache() {
  historyVersion += 1;
}

export const HISTORY_PAGE_SIZE = 20;

// 처리할 산책을 정한다: 방금 끝낸 산책, 이력에서 고른 산책, 인계를 아직 접수하지 않은 가장 최근 산책 순이다.
// 이력에서 산책을 고르면(selectHistoryWalk) 방금 끝낸 산책 기록을 비워 고른 산책이 우선한다.
export async function resolveResultWalkId(): Promise<number | null> {
  const ended = getEndedWalk();
  if (ended) {
    resultWalkId = ended.id;
    return resultWalkId;
  }
  if (resultWalkId !== null) return resultWalkId;
  const pending = await fetchWalkHistory(1, 0, "NOT_CONFIRMED");
  if (pending.ok && pending.data.walks.length > 0) {
    resultWalkId = pending.data.walks[0].walk_id;
  }
  return resultWalkId;
}

// 9-1에서 산책을 고른다. 9-2와 거기서 가는 6-1이 이 산책을 다룬다.
export function selectHistoryWalk(item: WalkHistoryItem) {
  setEndedWalk(null);
  selectedHistoryItem = item;
  resultWalkId = item.walk_id;
}

export type WalkResult = {
  walk: Walk;
  handoverStatus: HandoverStatus;
  dogName: string;
  shelterName: string;
};

// 산책과 강아지·보호소 이름을 함께 불러온다. 이름을 못 불러와도 산책 자체는 보여 준다.
export async function loadWalkResult(walkId: number): Promise<ApiResult<WalkResult>> {
  const detail = await fetchWalkDetail(walkId);
  if (!detail.ok) return detail;
  const selected = getSelectedHistoryItem();
  let dogName = selected?.walk_id === walkId ? selected.dog.name : "";
  let shelterName = selected?.walk_id === walkId ? (selected.shelter_name ?? "") : "";
  if (!dogName) {
    const request = await fetchWalkRequestDetail(detail.data.walk.walk_request_id);
    if (request.ok) {
      dogName = request.data.dog.name;
      shelterName = request.data.shelter?.name ?? request.data.shelter_name ?? "";
    }
  }
  return {
    ok: true,
    status: detail.status,
    data: {
      walk: detail.data.walk,
      handoverStatus: detail.data.handover_status,
      dogName,
      shelterName,
    },
  };
}

// 산책 결과 화면의 오류 문구. 403, 404, 409는 detail이 문자열이라 code가 없어 HTTP 상태로 나눈다.
export function walkFailureMessage(failure: ApiFailure): string {
  if (failure.code === null) {
    if (failure.status === 403) return "이 산책은 볼 수 없어요.";
    if (failure.status === 404) return "산책 기록을 찾을 수 없어요.";
    if (failure.status === 409) return "지금은 처리할 수 없는 산책이에요.";
    if (failure.status === 422) return "입력 내용을 확인해 주세요.";
  }
  return errorMessage(failure.code);
}

// 레벨업 확인은 사용자가 정상 종료한 산책(COMPLETED + USER)만 대상이다.
// 자동 종료(AUTO_TIMEOUT)와 직원 중단(STAFF, INTERRUPTED)은 서버도 평가하지 않는다.
export function isLevelEligibleWalk(walk: Pick<Walk, "status" | "end_reason">): boolean {
  return walk.status === "COMPLETED" && walk.end_reason === "USER";
}

const LEVEL_POLL_INTERVAL_MS = 3000;
// 서버의 평가 작업이 30초마다 돌아서, 그 주기를 한 번 넘기도록 약 33초까지 기다린다.
const LEVEL_POLL_MAX_TRIES = 11;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// 서버의 레벨 평가 결과를 확인한다. PENDING이면 정해진 횟수만 다시 조회하고,
// 끝내 NOT_ELIGIBLE, FAILED, PENDING이면 레벨업이 없는 것으로 보고 건너뛴다.
export async function resolveLevelUp(
  walkId: number,
  walk: Pick<Walk, "status" | "end_reason">,
  first: WalkSummary,
  isCancelled: () => boolean,
): Promise<LevelUpEvent | null> {
  if (!isLevelEligibleWalk(walk)) return null;
  let summary = first;
  for (let attempt = 0; ; attempt += 1) {
    const status = summary.level_evaluation_status;
    if (status === "COMPLETED") {
      const event = summary.level_up_event;
      return event && event.after_level > event.before_level ? event : null;
    }
    if (status !== "PENDING" || attempt >= LEVEL_POLL_MAX_TRIES) return null;
    await sleep(LEVEL_POLL_INTERVAL_MS);
    if (isCancelled()) return null;
    const next = await fetchWalkSummary(walkId);
    if (next.ok) summary = next.data;
  }
}
