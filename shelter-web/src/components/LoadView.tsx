import type { ReactNode } from "react";

import { failureText } from "../api/failure";
import type { LoadState } from "../hooks";

type LoadViewProps<T> = {
  state: LoadState<T>;
  onRetry: () => void;
  children: (data: T) => ReactNode;
};

// 불러오는 중, 실패(다시 불러오기 버튼), 성공 세 가지를 한곳에서 보여 준다.
export function LoadView<T>({ state, onRetry, children }: LoadViewProps<T>) {
  if (state.status === "loading") return <p className="empty-text" role="status">불러오는 중이에요.</p>;
  if (state.status === "error") {
    return (
      <div className="content-card section-action">
        <p className="form-error" role="alert">{failureText(state.failure)}</p>
        <button className="small-action section-action" type="button" onClick={onRetry}>다시 불러오기</button>
      </div>
    );
  }
  return <>{children(state.data)}</>;
}

// 개발용 미리보기(로그인 없음)에서는 서버 데이터를 볼 수 없다.
export function NoServerNotice() {
  return (
    <div className="content-card section-action">
      <p className="body-copy">미리보기에서는 서버 데이터를 불러올 수 없어요. 보호소 계정으로 로그인해 주세요.</p>
    </div>
  );
}
