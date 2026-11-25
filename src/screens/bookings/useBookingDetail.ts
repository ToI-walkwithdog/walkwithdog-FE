import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";

import { routeForFailure } from "../../api/auth";
import type { ApiFailure } from "../../api/client";
import { getSelectedBookingId } from "../../api/myBookings";
import { fetchWalkRequestDetail, type WalkRequestDetail } from "../../api/walkRequests";

export type BookingDetailState =
  | { phase: "loading" }
  | { phase: "error"; failure: ApiFailure }
  | { phase: "ready"; detail: WalkRequestDetail };

// 선택한 예약의 상세를 서버에서 불러온다. 401과 온보딩 미완료는 해당 화면으로 보낸다.
export function useBookingDetail() {
  const router = useRouter();
  const [state, setState] = useState<BookingDetailState>({ phase: "loading" });
  const sequence = useRef(0);

  const load = useCallback(async () => {
    const id = getSelectedBookingId();
    if (id === null) {
      router.replace("/8-1");
      return null;
    }
    const current = ++sequence.current;
    setState({ phase: "loading" });
    const result = await fetchWalkRequestDetail(id);
    if (current !== sequence.current) return null; // 더 새로운 요청이 있으면 버린다.
    if (result.ok) {
      setState({ phase: "ready", detail: result.data });
      return result.data;
    }
    const route = await routeForFailure(result);
    if (route) {
      router.replace(route);
      return null;
    }
    setState({ phase: "error", failure: result });
    return null;
  }, [router]);

  useEffect(() => {
    void load();
    return () => {
      sequence.current += 1; // 화면을 떠나면 늦게 온 응답을 버린다.
    };
  }, [load]);

  return { state, reload: load };
}
