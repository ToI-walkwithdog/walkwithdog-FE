// 산책 가능 목록(7-1, 7-2)을 불러오는 순서를 한곳에 모은다.
import type { ApiFailure, ApiResult } from "./client";
import { isDogSizeCode, type DogSizeCode } from "./bookingCodes";
import type { AvailabilityList } from "./bookingDraft";
import { fetchWalkAvailability } from "./dogs";
import { fetchSigungu, fetchWalkingRoutine } from "./onboarding";
import { fetchWalkPreferences } from "./walkPreferences";

function failure(code: string): ApiFailure {
  return { ok: false, status: 0, code, message: null };
}

// 지역 코드(시군구 5자리, 세종은 36_SPECIAL_ALL)를 이름으로 바꾼다. 못 바꾼 코드는 뺀다.
async function regionNamesFor(codes: string[]): Promise<string[]> {
  const sidoCodes = [...new Set(codes.map((code) => code.slice(0, 2)))];
  const results = await Promise.all(sidoCodes.map((sido) => fetchSigungu(sido)));
  const names = new Map<string, string>();
  for (const result of results) {
    if (!result.ok) continue;
    for (const region of result.data.regions) {
      names.set(region.region_code, region.region_name);
    }
  }
  return codes.flatMap((code) => {
    const name = names.get(code);
    return name ? [name] : [];
  });
}

// 지역은 온보딩 Step 3 값, 크기는 저장한 선호 → 온보딩 값 → 전체 순서로 정한다.
export async function loadInitialAvailability(): Promise<ApiResult<AvailabilityList>> {
  const routine = await fetchWalkingRoutine();
  if (!routine.ok) return routine;
  const regionCodes = routine.data.routine?.region_codes ?? [];
  if (regionCodes.length === 0) return failure("REGIONS_REQUIRED");

  // 선호 조회가 실패해도 목록은 크기 조건 없이 보여 준다.
  const [preferences, regionNames] = await Promise.all([
    fetchWalkPreferences(),
    regionNamesFor(regionCodes),
  ]);
  const preferred = preferences.ok
    ? preferences.data.effective_preferences.size_code
    : null;
  const sizeCode = isDogSizeCode(preferred) ? preferred : null;

  const page = await fetchWalkAvailability({ regionCodes, sizeCode, offset: 0 });
  if (!page.ok) return page;
  return {
    ok: true,
    status: page.status,
    data: {
      regionCodes,
      regionNames,
      sizeCode,
      items: page.data.items,
      hasMore: page.data.has_more,
      nextOffset: page.data.next_offset,
    },
  };
}

// 크기 필터를 바꾸면 첫 페이지부터 다시 불러온다.
export async function reloadAvailability(
  current: AvailabilityList,
  sizeCode: DogSizeCode | null,
): Promise<ApiResult<AvailabilityList>> {
  const page = await fetchWalkAvailability({
    regionCodes: current.regionCodes,
    sizeCode,
    offset: 0,
  });
  if (!page.ok) return page;
  return {
    ok: true,
    status: page.status,
    data: {
      ...current,
      sizeCode,
      items: page.data.items,
      hasMore: page.data.has_more,
      nextOffset: page.data.next_offset,
    },
  };
}

// 더보기: 다음 페이지를 뒤에 붙인다.
export async function loadMoreAvailability(
  current: AvailabilityList,
): Promise<ApiResult<AvailabilityList>> {
  if (current.nextOffset === null) return failure("INVALID_PAGINATION");
  const page = await fetchWalkAvailability({
    regionCodes: current.regionCodes,
    sizeCode: current.sizeCode,
    offset: current.nextOffset,
  });
  if (!page.ok) return page;
  return {
    ok: true,
    status: page.status,
    data: {
      ...current,
      items: [...current.items, ...page.data.items],
      hasMore: page.data.has_more,
      nextOffset: page.data.next_offset,
    },
  };
}
