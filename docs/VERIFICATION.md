# 검증 현황

단계마다 갱신한다. "확인"은 실제 기기와 로컬 BE로 본 것이고, "미확인"은 아직 보지 못한 것이다.
승인 상태 화면은 보호소 테스트 계정과 승인 API로 나중에 확인한다(DB를 직접 바꾸지 않는다).

## 6단계 내 예약, 취소 (8-1~8-8)

### 기기에서 확인함
- 내 예약 목록 불러오기와 "승인 대기" 카드 표시(시각은 KST)
- 대기 중인 예약 취소 흐름(8-4 → 8-7 → BottomSheet 확인 → 8-8)
- 취소 뒤 목록의 "지난 예약" 탭 반영
- 이미 취소된 예약의 안내 문구(409 `REQUEST_ALREADY_CANCELLED`)

### 미확인
- 승인 상태 화면: 8-3 상세, 승인 뒤 취소, 보호소 코드 입력으로 이동(보호소 계정과 승인 API 필요)
- 취소 오류 경로: `CANCEL_TIME_EXPIRED`, `WALK_RECORD_EXISTS`, `REQUEST_STATE_CONFLICT`, `REQUEST_LOCK_CONFLICT`
  (`REQUEST_ALREADY_CANCELLED`는 API 재전송으로 따로 확인한다)
- 한 페이지(20건)를 넘는 목록: 더보기, offset을 원본 개수만큼 더하는 동작, 예약 ID 중복 제거
- 403과 404 처리: HTTP 상태로만 나눈다. 나이 확인 대기 계정은 `GET /users/me`의 단계로 판단한다.
- 확정 탭에 산책을 마친 예약이 "산책 완료"로 보이는지

## 7단계 보호소 코드, 시작, 산책 중, 신고, 종료 (4-x, 5-x)

구현을 마쳤고 타입 검사만 통과했다. 기기와 인증된 API로는 아직 아무것도 확인하지 않았다.
보호소 테스트 계정이 코드를 발급하고 예약을 승인해야 끝까지 갈 수 있다.

### 미확인
- 보호소 코드: 정상 확인(4-1 → 4-4), 틀린 코드(422 `SHELTER_CODE_INVALID`), 5회 실패 잠금(429 `SHELTER_CODE_RATE_LIMITED`와 `retry_after_seconds`), 만료
- 산책 시작: `POST /walks` 성공, `WALK_START_CODE_REQUIRED`, `WALK_START_BOOKING_NOT_ELIGIBLE`, 응답 유실 뒤 `GET /walks/active`로 이어 가기
- 산책 중: 위치 권한 허용과 거부, 좌표 전송(10초 주기, 순번 연속), 앱 재시작 뒤 복구, 기기 시계가 서버와 다를 때의 시각 보정
- 마커 4종(포토스팟은 `OTHER` + 메모), 위치를 못 얻을 때 `MARKER_LOCATION_UNAVAILABLE`, 같은 키 재전송
- 신고 5종과 기타(설명 필수), 실패 뒤 "다시 전송하기"(같은 `client_report_id`), `DUPLICATE_RECENT` 확인
- 일시정지(서버에 개념 없음, 정지 중 좌표를 보내지 않는다), GPS 끊김 자동 안내(30초 무신호), 무수신 자동 종료 뒤 화면 처리
- 산책 종료(`PATCH end`)와 6-1로 이동. 6-x 이후는 아직 목업이다(8단계).
- 실제 기기의 백그라운드 위치. 지금은 앱이 켜져 있는 동안(foreground)만 수집한다.
