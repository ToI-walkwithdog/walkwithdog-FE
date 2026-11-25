// 산책 중 화면들(5-x)이 같이 쓰는 신고 전송과 종료 흐름.
import type { useRouter } from "expo-router";
import { Alert } from "react-native";

import { routeForFailure } from "../../api/auth";
import type { ApiFailure } from "../../api/client";
import { errorMessage } from "../../api/errorMessages";
import { fetchActiveWalk } from "../../api/walks";
import {
  discardWalk,
  finishWalk,
  getPendingIncident,
  submitIncident,
} from "../../api/walkTracker";

function confirmDuplicate(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert("알림", `${errorMessage("DUPLICATE_RECENT")}\n그래도 다시 보낼까요?`, [
      { text: "취소", style: "cancel", onPress: () => resolve(false) },
      { text: "다시 보내기", onPress: () => resolve(true) },
    ]);
  });
}

type AppRouter = ReturnType<typeof useRouter>;
type Navigate = "push" | "replace";

// 만들어 둔 신고(prepareIncident)를 보낸다. 성공하면 5-7, 실패하면 5-6으로 간다.
// 같은 신고를 다시 보낼 때도 처음 만든 키와 본문을 그대로 쓴다.
export async function sendPendingIncident(router: AppRouter, mode: Navigate = "push") {
  const draft = getPendingIncident();
  if (!draft) return;
  const go = mode === "push" ? router.push : router.replace;
  let result = await submitIncident();
  if (!result.ok && result.code === "DUPLICATE_RECENT") {
    // 같은 유형의 신고가 방금 있었다. 사용자가 확인하면 그대로 다시 보낸다.
    if (!(await confirmDuplicate())) return;
    result = await submitIncident(true);
  }
  if (result.ok) {
    go({ pathname: "/5-7", params: { report: draft.label } });
    return;
  }
  if (result.status === 401) {
    router.replace("/1-2");
    return;
  }
  go({ pathname: "/5-6", params: { report: draft.label, code: result.code ?? "" } });
}

async function handleEndFailure(router: AppRouter, failure: ApiFailure) {
  const route = await routeForFailure(failure);
  if (route) {
    router.replace(route);
    return;
  }
  if (failure.code === null && failure.status === 409) {
    // 이미 끝난 산책(자동 종료 등)이면 서버에 진행 중인 산책이 없다. 그때는 종료한 것으로 이어 간다.
    const active = await fetchActiveWalk();
    if (!active.ok && active.status === 404) {
      discardWalk();
      router.replace("/6-1");
      return;
    }
  }
  Alert.alert("알림", `산책을 종료하지 못했어요.\n${errorMessage(failure.code)}`);
}

// 산책 종료를 확인받고 서버에 종료를 요청한다. 성공하면 6-1(인계)로 간다.
export function endWalkWithConfirm(router: AppRouter, setBusy: (busy: boolean) => void) {
  Alert.alert("산책을 종료할까요?", "종료하면 이어서 기록할 수 없어요.", [
    { text: "계속 걷기", style: "cancel" },
    {
      text: "종료",
      onPress: () => {
        setBusy(true);
        void finishWalk()
          .then(async (result) => {
            if (result.ok) {
              router.replace("/6-1");
              return;
            }
            await handleEndFailure(router, result);
          })
          .finally(() => setBusy(false));
      },
    },
  ]);
}
