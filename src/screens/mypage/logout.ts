// 마이페이지와 설정이 같이 쓰는 로그아웃 흐름.
import type { useRouter } from "expo-router";
import { Alert } from "react-native";

import { clearLocalSession, logoutFromServer } from "../../api/session";
import { getTrackerSnapshot } from "../../api/walkTracker";

type AppRouter = ReturnType<typeof useRouter>;

// 서버에 로그아웃을 요청한 뒤, 결과와 상관없이 이 기기의 로그인 상태를 지우고 로그인 화면으로 간다.
// 서버 호출이 네트워크 문제로 실패하면 그 사실을 알려 준다(이미 만료된 토큰의 401은 정상으로 본다).
function runLogout(router: AppRouter, setBusy: (busy: boolean) => void) {
  setBusy(true);
  void (async () => {
    const result = await logoutFromServer();
    await clearLocalSession();
    setBusy(false);
    const goToLogin = () => {
      router.dismissAll();
      router.replace("/1-2");
    };
    const unreachable =
      !result.ok &&
      (result.code === "NETWORK_ERROR" || result.code === "TIMEOUT" || result.status >= 500);
    if (unreachable) {
      Alert.alert(
        "알림",
        "서버와 연결하지 못해 이 기기에서만 로그아웃했어요. 서버의 로그인은 시간이 지나면 만료돼요.",
        [{ text: "확인", onPress: goToLogin }],
      );
      return;
    }
    goToLogin();
  })();
}

// 확인을 받고 로그아웃한다.
// 진행 중인 산책에 서버로 보내지 못한 위치 기록이 남아 있을 때만 한 번 더 확인한다. 그 경우에도
// "그래도 로그아웃"을 고르면 막지 않으므로 사용자가 갇히지 않는다. 그 밖의 경우는 모두 바로 로그아웃할 수 있다.
export function confirmLogout(router: AppRouter, setBusy: (busy: boolean) => void) {
  const tracker = getTrackerSnapshot();
  if (tracker.walkId !== null && tracker.unsentCount > 0) {
    Alert.alert(
      "보내지 못한 산책 기록이 있어요",
      `산책 중이고 서버에 보내지 못한 위치 기록이 ${tracker.unsentCount}개 있어요. 지금 로그아웃하면 이 기록은 사라져요.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "그래도 로그아웃 (미전송 기록 삭제)",
          style: "destructive",
          onPress: () => runLogout(router, setBusy),
        },
      ],
    );
    return;
  }
  Alert.alert("로그아웃", "이 기기에서 로그아웃할까요?", [
    { text: "취소", style: "cancel" },
    { text: "로그아웃", onPress: () => runLogout(router, setBusy) },
  ]);
}
