# Implementation progress

| Screen | Status | Files changed | Assumptions |
|---|---|---|---|
| 1-2 | Done | `src/screens/onboarding/LoginScreen.tsx`, `src/components/OnboardingBackground.tsx`, `src/components/PillTextInput.tsx`, `src/theme/tokens.ts` | Figma specifies Urbanist SemiBold, but only Urbanist Medium is registered; use Medium. The sheet's visible Figma span is 518dp (the 524dp node extends 6dp beyond the frame), so use 518dp anchored to bottom. Fake login accepts any non-empty ID/password and replaces to Home. |
| 1-4 | Done | `src/screens/onboarding/PrivacyPolicyScreen.tsx`, `src/components/OnboardingBackground.tsx`, `src/components/OnboardingActionButton.tsx`, `src/components/ConsentCheckbox.tsx`, `src/components/Icon.tsx`, `src/screens/onboarding/LoginScreen.tsx`, `src/theme/tokens.ts` | Figma specifies Pretendard Light and Noto Sans KR Medium, but only Regular is registered for those families; use Regular. “전체 동의” and “전문보기” both open 1-5 to follow the specified flow. |
| 1-5 | Done | `src/screens/onboarding/PrivacyDetailsScreen.tsx`, `src/components/OnboardingActionButton.tsx`, `src/components/ConsentCheckbox.tsx`, `src/theme/tokens.ts` | Figma specifies Noto Sans KR Medium/DemiLight, but only Regular is registered; use Regular. The duplicate “주거 형태” in the Figma text is preserved. The consent button replaces this route with 1-3. |
| 1-3 | Done | `src/screens/onboarding/RegisterScreen.tsx`, `src/components/PillTextInput.tsx`, `src/components/OnboardingPillButton.tsx`, `src/screens/onboarding/LoginScreen.tsx` | Figma's Pretendard/Urbanist SemiBold styles use available Medium font families. Duplicate-name check accepts any non-empty nickname; fake validation checks email format, password rules, and confirmation. No error UI was added because none is shown in this frame. |
| 1-6 | Done | `src/screens/onboarding/PledgeScreen.tsx`, `src/components/OnboardingPillButton.tsx`, `src/theme/tokens.ts` | Reused the existing dog, paw-print, and paw-stamp assets. The local paw-stamp SVG has the matching gradient shape but lacks the source frame's drop shadow. |
| 2-1 | Done | `src/screens/onboarding/OnboardingWaitingScreen.tsx`, `src/components/OnboardingBackground.tsx` | The waiting frame has no explicit duration or control; auto-advance to 2-2 after 1.5 seconds. |
| 2-2 | Done | `src/screens/onboarding/UserInput1Screen.tsx`, `src/components/PillTextInput.tsx`, `src/components/UserInfoBackground.tsx`, `src/components/OnboardingStepNavigation.tsx`, `src/theme/tokens.ts`, `src/theme/typography.ts` | Fake verification accepts any six-digit code after a valid phone number is submitted; next requires name, positive age, and verified phone. Previous returns to 1-6. |
| 2-3 | Done | `src/screens/onboarding/UserInput2Screen.tsx`, `src/components/UserInfoBackground.tsx`, `src/components/OnboardingStepNavigation.tsx`, `src/theme/tokens.ts`, `src/theme/typography.ts` | Experience defaults to “no experience.” Despite copy suggesting first-time users go home, Next follows the stated linear flow to 2-4. |
| 2-4 | Done | `src/screens/onboarding/UserInput3Screen.tsx`, `src/components/OnboardingStepNavigation.tsx`, `src/components/UserInfoBackground.tsx`, `src/theme/tokens.ts` | The Figma frame is 375×1168, so the form scrolls while navigation remains anchored at the viewport bottom. Initial selections mirror the screenshot; Next follows the linear flow to 2-5. |
| 2-5 | Done | `src/screens/onboarding/UserInput4Screen.tsx`, `src/components/ConsentCheckbox.tsx`, `src/components/OnboardingChoiceChip.tsx`, `src/components/OnboardingRadioOption.tsx`, `src/components/OnboardingStepNavigation.tsx`, `src/screens/onboarding/UserInput3Screen.tsx`, `src/theme/tokens.ts` | The region selectors accept typed mock values because the frame has no picker state/design. Both “보기” links open the existing privacy detail screen. Completion requires both region fields and required consents; mock selections start as shown. |
| 2-6 | Done | `src/screens/onboarding/UserInput5Screen.tsx`, `src/theme/tokens.ts`, `src/theme/typography.ts` | The screen requests foreground location permission when opened and replaces to Home after either grant or denial. The header back button returns to 2-5. A permission API error is logged and leaves the guidance visible. |
| 3 | Done | `src/screens/home/HomeScreen.tsx`, `src/data/bookings.ts`, `src/data/walkRecords.ts`, `src/types/models.ts` | Tap targets for not-yet-implemented screens log only. The frame is 375×1133 and scrolls. |
| 4-1 | Done | `src/screens/walk/ShelterCodeScreen.tsx` | A six-digit code routes to 4-2 success; any other code routes to 4-3 error. Reservation detail is a log-only tap. |
| 4-2 | Done | `src/screens/walk/CodeEntryResultScreen.tsx` | The success state shows the mock code 428619 and “확인하고 시작하개” pushes 4-4. |
| 4-3 | Done | `src/screens/walk/CodeEntryResultScreen.tsx`, `src/theme/tokens.ts` | The error state shows code 428610, pink code field, and routes “코드 다시 입력하기” back to 4-1. Reservation detail remains a log-only tap. |
| 4-4 | Done | `src/screens/walk/WalkChecklistScreen.tsx`, `src/theme/tokens.ts` | All four preparation checks must be selected before “시작하개!” pushes 5-1. |
| 5-1 | Done | `src/screens/walk/WalkStartScreen.tsx`, `src/theme/tokens.ts` | The active-map frame uses the existing walking-map and kongi assets. Pause pushes 5-2, add pushes 5-4, report pushes 5-5; stop has no unimplemented-flow target and logs only. |
| 5-2 | Done | `src/screens/walk/WalkActiveScreen.tsx` | Resume replaces to 5-1; report pushes 5-5; add pushes 5-4; stop logs only. |
| 5-3 | Done | `src/screens/walk/WalkActiveScreen.tsx` | “위치 다시 연결하기” replaces to 5-1. Existing-record termination is a log-only tap. |
| 5-4 | Done | `src/screens/walk/WalkActiveScreen.tsx` | The add button opens the mock marker menu; selecting a marker or close returns to 5-1. |
| 5-5 | Done | `src/screens/walk/WalkActiveScreen.tsx` | Report options are mock selection UI. “보호소에 전화하기” goes to 5-7; cancel replaces to 5-1. |
| 5-6 | Done | `src/screens/walk/WalkActiveScreen.tsx` | Retry replaces to 5-7 mock success; contact check is a log-only tap. |
| 5-7 | Done | `src/screens/walk/WalkActiveScreen.tsx` | The mock report success routes via 5-5/5-6 transitions. Contact-check and return-to-walk controls are implemented as log-only/replace flows. |
| 6-1 | Done | `src/screens/walk/WalkHandoverScreen.tsx` | The three handover checks must be selected before the primary button pushes 6-2. Return-to-walk replaces to 5-1. |
| 6-2 | Done | `src/screens/walk/WalkRecordSaveScreen.tsx` | Saving the mock record replaces to 6-3. The optional shelter message is editable. |
| 6-3 | Done | `src/screens/walk/LevelUpScreen.tsx` | “이어하개!” replaces to Home 3. Decorative confetti is approximated with simple code shapes and existing layout colors. |
| 7-1 | Done | `src/screens/booking/AvailableBookingsScreen.tsx` | The loading state auto-replaces to 7-2 after 1.5 seconds. |
| 7-2 | Done | `src/screens/booking/AvailableBookingsScreen.tsx`, `src/data/availableBookings.ts`, `src/data/dogs.ts` | Mock filter and booking cards use src/data. Card taps push 7-3; more and unknown filters log only. |
| 7-3 | Done | `src/screens/booking/DogDetailsScreen.tsx` | Kongi is the mock selected dog. The second schedule is initially selected; applying pushes 7-4. |
| 7-4 | Done | `src/screens/booking/ApplicationReviewScreen.tsx` | Applying pushes 7-5; choosing a schedule again returns to 7-3. |
| 7-5 | Done | `src/screens/booking/ApplicationCompleteScreen.tsx` | The “내 예약 현황 보기” destination is not implemented yet and logs only; Home replaces to 3. |
| 8-6 | Done | `src/screens/bookings/BookingCancellationScreen.tsx` | The cancellation-complete frame is shown for 8-6; actions route to the next existing cancellation/list screens. |
| 8-7 | Done | `src/screens/bookings/BookingCancellationScreen.tsx` | The confirmation state selects a mock cancellation reason and proceeds to 8-8 or back to 8-3. |
| 8-8 | Done | `src/screens/bookings/BookingCancellationScreen.tsx` | The completed-cancellation state routes to 8-1. |
| 9-1 | Done | `src/screens/history/WalkHistoryScreen.tsx` | Mock totals and four recent records use fixed design values. Record cards push 9-2. |
| 9-2 | Done | `src/screens/history/WalkRecordDetailScreen.tsx` | Kongi's mock walk detail and handover summary are displayed; back returns to 9-1. |
| 10-1 | Done | `src/screens/mypage/MyPageScreen.tsx` | Existing routes are profile edit and walk preferences; history and bookings are linked. Other menu actions log only. |
| 10-2 | Done | `src/screens/mypage/EditProfileScreen.tsx` | Profile fields are mock editable values. Save and cancel replace to 10-1. |
| 10-3 | Done | `src/screens/mypage/WalkPreferencesScreen.tsx` | Duration and dog-size selections are local mock state; save replaces to 10-1. |
| 8-1 | Done | `src/screens/bookings/MyBookingsScreen.tsx` | Mock list uses confirmed, pending, rejected, and cancelled cards. Filters are local mock filters. |
| 8-2 | Done | `src/screens/bookings/MyBookingsScreen.tsx` | The empty state shares the 8-1 component and returns to 3 with the back button. |
| 8-3 | Done | `src/screens/bookings/BookingDetailScreen.tsx` | Confirmed state links shelter-code entry and cancellation flow. |
| 8-4 | Done | `src/screens/bookings/BookingDetailScreen.tsx` | Pending state has mock approval status and returns to the list. |
| 8-5 | Done | `src/screens/bookings/BookingDetailScreen.tsx` | Rejected state uses a mock rejection reason and returns to the list. |
| 8-6 | In progress | — | — |

## Assumptions

- The current `figma-screens.md` copy does not contain a "화면 이동 흐름" section, so navigation follows the explicit onboarding flow previously provided by the user.
