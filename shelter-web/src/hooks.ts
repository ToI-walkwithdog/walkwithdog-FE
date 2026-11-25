import { useCallback, useEffect, useState } from "react";

import type { ApiFailure, ApiResult } from "./api/client";

export type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; failure: ApiFailure }
  | { status: "ok"; data: T };

// 화면이 열릴 때(또는 deps가 바뀔 때) 한 번 불러오고, reload로 다시 불러온다. 자동 재시도는 하지 않는다.
export function useLoad<T>(load: () => Promise<ApiResult<T>>, deps: readonly unknown[]) {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    void load().then((res) => {
      if (!active) return;
      setState(res.ok ? { status: "ok", data: res.data } : { status: "error", failure: res });
    });
    return () => { active = false; };
    // load는 deps가 바뀔 때마다 새로 만들어지므로 deps로만 다시 실행한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);
  return { state, reload };
}
