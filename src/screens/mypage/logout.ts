// 마이페이지와 설정이 같이 쓰는 로그아웃 흐름.
import type { useRouter } from "expo-router";
import { Alert } from "react-native";

import { clearLocalSession, logoutFromServer } from "../../api/session";
import { getTrackerSnapshot } from "../../api/walkTracker";

type AppRouter = ReturnType<typeof useRouter>;

// 확인을 받고 서버에 로그아웃을 요청한 뒤, 결과와 상관없이 이 기기의 로그인 상태를 지우고 로그인 화면으로 간다.
// 서버 호출이 네트워크 문제로 실패하면 그 사실을 알려 준다(이미 만료된 토큰의 401은 정상으로 본다).
export function confirmLogout(router: AppRouter, setBusy: (busy: boolean) => void) {
  // 진행 중인 산책이 있으면 보내지 못한 기록이 사라지지 않도록 막는다.
  if (getTrackerSnapshot().walkId !== null) {
    Alert.alert("산책 중이에요", "산책을 마친 뒤에 로그아웃할 수 있어요.");
    return;
  }
  Alert.alert("로그아웃", "이 기기에서 로그아웃할까요?", [
    { text: "취소", style: "cancel" },
    {
      text: "로그아웃",
      onPress: () => {
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
      },
    },
  ]);
}
