import type { IconName } from "../../components/Icon";

export type WalkGuideCard = {
  icon: IconName;
  title: string;
  subtitle: string;
  points: string[];
};

// 가이드 글은 저장소에 이미 있는 문구에서 가져왔다. 출처를 못 댄 문장은 "DRAFT"로 표시했다.
// DRAFT = 팀/보호소 검토가 필요한 초안이다(새 규칙, 숫자, 안전 주장은 넣지 않았다).
// 카드 제목과 부제는 모두 DRAFT다(화면 구성용 새 문구).
export const walkGuideCards: WalkGuideCard[] = [
  {
    icon: "icon-footprints",
    // DRAFT
    title: "산책은 이렇게 진행돼요",
    // DRAFT
    subtitle: "코드 입력부터 인계까지",
    points: [
      // 출처: ShelterCodeScreen 안내문("안전 교육과 강아지 인계 후, 담당자에게 받은 6자리 코드를 입력해 주세요!")
      "안전 교육과 강아지 인계를 마치면 담당자에게 받은 6자리 코드를 입력해요",
      // 출처: ShelterCodeScreen("코드는 발급 후 10분 안에 입력해 주세요.")
      "코드는 발급 후 10분 안에 입력해 주세요",
      // 출처: WalkChecklistScreen ITEMS와 "모든 물품을 확인하면 산책을 시작할 수 있어요."
      "리드줄·하네스, 배변봉투, 물·휴대용 물그릇, 물티슈를 확인하면 산책을 시작할 수 있어요",
      // 출처: WalkHandoverScreen("보호소 담당자와 인계를 마무리해 주세요")
      "산책이 끝나면 보호소 담당자와 인계를 마무리해요",
    ],
  },
  {
    icon: "icon-shield",
    // DRAFT
    title: "강아지와 안전하게",
    // DRAFT
    subtitle: "출발 전에 꼭 확인해요",
    points: [
      // 출처: WalkChecklistScreen 02("하네스와 리드줄의 연결 상태를 확인하고, 보호소 담당자에게 주의사항을 안내받으세요!")
      "하네스와 리드줄의 연결 상태를 확인해요",
      "보호소 담당자에게 주의사항을 안내받으세요",
      // 출처: PledgeScreen 서약("보호견과 함께 안전하게 산책을 진행할 거예요!")
      "보호견과 함께 안전하게 산책을 진행해요",
      // 출처: PledgeScreen 서약("산책 승인 여부는 보호소에게 있어요!")
      "산책 승인 여부는 보호소에 있어요",
    ],
  },
  {
    icon: "icon-paw",
    // DRAFT
    title: "산책 중에는 기록을 남겨요",
    // DRAFT
    subtitle: "마커와 정지, 위치 신호",
    points: [
      // 출처: WalkScreen 마커 라벨(냄새 맡기, 배변, 다른 개, 포토스팟)과 "산책 기록 추가".
      // DRAFT: 마커를 "무엇을 위해" 쓰는지(보호소에 어떻게 전달되는지)는 저장소에 설명이 없다.
      "냄새 맡기, 배변, 다른 개, 포토스팟을 눌러 산책 기록에 남길 수 있어요",
      // 출처: WalkScreen 버튼 라벨("정지하개", "이어 걷개")
      "잠시 멈출 때는 정지하개, 다시 걸을 때는 이어 걷개를 눌러요",
      // 출처: GPSLostScreen("현재 산책은 유지하고 있어요", "신호가 끊긴 구간은 경로와 거리가 정확히 기록되지 않을 수 있어요.")
      "위치 신호가 끊겨도 산책은 유지돼요. 끊긴 구간은 경로와 거리가 정확히 기록되지 않을 수 있어요",
    ],
  },
  {
    icon: "icon-warning",
    // DRAFT
    title: "문제가 생기면",
    // DRAFT
    subtitle: "신고하고 보호소에 연락해요",
    points: [
      // 출처: WalkScreen 신고 유형(도주, 부상, 배변봉투 부족, 이물질 섭취, 기타)과 "신고하면 보호소에 바로 전달돼요."
      "산책 화면의 신고에서 도주, 부상, 배변봉투 부족, 이물질 섭취, 기타를 고르면 보호소에 바로 전달돼요",
      // 출처: ReportResultScreen("긴급한 상황에서는 재전송을 기다리지 말고 보호소에 전화해 주세요.")
      "긴급한 상황에서는 재전송을 기다리지 말고 보호소에 전화해 주세요",
      // 출처: ReportResultScreen("안전한 곳에서 멈춰 아래 보호소 연락처를 확인하여 전화로 위치와 상황을 전달해 주세요!")
      "안전한 곳에서 멈춰 전화로 위치와 상황을 전달해 주세요",
    ],
  },
];
