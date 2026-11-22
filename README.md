# 이어주개 mobile app

Expo + React Native + TypeScript mobile app using Expo Router. The current flows use session-only mock data; they are not connected to a backend.

## Install and run

```sh
npm install
npx expo start
```

Run `npm run typecheck` to check TypeScript.
Run `node --test tests\mockSessionLogic.test.mjs` with Node.js 24 to test the mock booking and walk-record logic.

Volunteer app screen and backend handoff: [English](VOLUNTEER_HANDOFF_EN.md) · [한국어](VOLUNTEER_HANDOFF_KO.md).

## Shelter mobile web

The separate `shelter-web` project contains a mobile web preview for shelter management. It uses the app's Pretendard files from `src/assets/fonts`, so build it within this repository. It uses in-memory demo data only; login, shelter verification, live tracking and backend operations are not connected. Changes are reset on refresh. Do not enter real personal data or account credentials.

```sh
cd shelter-web
npm install
npm run dev
```

Run `npm run build` in `shelter-web` to type-check and build the web project.

Screen and backend handoff: [English](shelter-web/SCREEN_HANDOFF_EN.md) · [한국어](shelter-web/SCREEN_HANDOFF_KO.md).

## Current mock flows

- **Sign-up:** Phone verification requires a valid-length number, a mock request, and test code `123456`. No SMS is sent and no actual verification or consent is recorded. Terms and privacy links on the information form open a placeholder and return to the form; the actual documents are not connected.
- **Booking:** Select a dog and schedule → review → save a mock application → view the pending reservation. A confirmed example reservation can be cancelled via the confirmation screen; its status updates in the list. Neither action contacts a shelter or changes a server.
- **Walk:** Enter mock shelter code `428619` → complete the checklist → walk → handover checklist → save a record → history. Time, distance and map route are sample values. Selected marker types are kept in the record without location coordinates. Memos are not sent to shelters.
- **Profile and preferences:** Edits remain in memory during the app session. The selected dog size is used as the available-booking filter's default; duration and region filtering are not connected. Logging out resets session mock data.
- **Reporting and maps:** Reporting, shelter phone numbers, map image download, live GPS tracking and reconnection are not connected. The UI explicitly indicates when a report has not been sent. The GPS-loss screen is not triggered automatically.
- **Level-up:** The level-up screen is retained but is not shown on record save until the backend supplies the difficulty-based score and level-up result.

All session changes are lost when the app process closes. Seed bookings and walk records are examples, not actual reservations or activities. The screens added for settings and unavailable policy documents follow the existing app style and are not Figma-authored designs.

## Kakao map setup

The walk screen uses the Figma map mockup by default. Create a local `.env.local` file to configure the map mode and Kakao Native App Key:

```env
EXPO_PUBLIC_WALK_MAP_MOCKUP=true
EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY=your_kakao_native_app_key
```

Set `EXPO_PUBLIC_WALK_MAP_MOCKUP=false` to render Kakao Map instead of the mockup. If the variable is omitted, the mockup remains enabled. `.env.local` is git-ignored; do not commit the app key. Use the Native App Key from Kakao Developers, not the REST API key.

Before using Kakao Map:

1. Enable Kakao Map for the app in Kakao Developers.
2. Set the app's Android package name and iOS bundle identifier in the Expo config, then register those identifiers and the required platform signing information in Kakao Developers.
3. Build and run a native app with `npx expo run:android` or `npx expo run:ios`. The Kakao map module does not run in Expo Go or web.

The Android Maven repository and New Architecture requirement are configured in `app.json`. `src/components/KakaoWalkMap.tsx` initializes the map and centers it on the current location when foreground location permission is already granted; otherwise it shows a Seoul City Hall fallback with a notice. Live GPS route drawing, route markers, and walk-stat calculation are not connected yet. The Figma route and markers are only displayed in mockup mode.

## Structure

- `app/` – Expo Router route files; each numbered route re-exports a screen component.
- `src/screens/` – screen modules grouped by flow.
- `src/components/` – shared `Icon` and `Screen` components.
- `src/assets/icons/`, `src/assets/images/` – Step 1 assets (preserved).
- `src/assets/fonts/` – local font files to add manually.
- `src/theme/` – existing design tokens, typography mappings, and font loading.
- `src/data/` – typed dogs, bookings, and walk-record mock data.
- `src/context/` – session-only mock bookings, records, profile and preferences.
- `src/hooks/`, `src/utils/`, `src/types/` – shared project code.
- `_legacy-web/` – original `index.html`, `styles.css`, and `script.js`, kept unchanged and not migrated.

## Font files to add

Google fonts Noto Sans KR (400, 700) and Urbanist (500) load through `expo-font` packages. Download these exact local font files into `src/assets/fonts/`:

- `Pretendard-Regular.ttf`
- `Pretendard-Medium.ttf`
- `GumiRomance-Regular.ttf`
- `NanumSquareRoundR.ttf`
- `NanumSquareRoundB.ttf`
- `NanumSquareRoundEB.ttf`

After adding them, register their static `require()` assets in `src/theme/localFonts.ts`; local fonts are intentionally not substituted or fabricated.

## Figma screen mapping

| Screen # | Route | Screen component |
|---|---|---|
| 1-1 | `/1-1` | `src/screens/onboarding/WelcomeScreen.tsx` |
| 1-2 | `/1-2` | `src/screens/onboarding/LoginScreen.tsx` |
| 1-3 | `/1-3` | `src/screens/onboarding/RegisterScreen.tsx` |
| 1-4 | `/1-4` | `src/screens/onboarding/PrivacyPolicyScreen.tsx` |
| 1-5 | `/1-5` | `src/screens/onboarding/PrivacyDetailsScreen.tsx` |
| 1-6 | `/1-6` | `src/screens/onboarding/PledgeScreen.tsx` |
| 2-1 | `/2-1` | `src/screens/onboarding/OnboardingWaitingScreen.tsx` |
| 2-2 | `/2-2` | `src/screens/onboarding/UserInput1Screen.tsx` |
| 2-3 | `/2-3` | `src/screens/onboarding/UserInput2Screen.tsx` |
| 2-4 | `/2-4` | `src/screens/onboarding/UserInput3Screen.tsx` |
| 2-5 | `/2-5` | `src/screens/onboarding/UserInput4Screen.tsx` |
| 2-6 | `/2-6` | `src/screens/onboarding/UserInput5Screen.tsx` |
| 3 | `/3` | `src/screens/home/HomeScreen.tsx` |
| 4-1 | `/4-1` | `src/screens/walk/ShelterCodeScreen.tsx` |
| 4-2 | `/4-2` | `src/screens/walk/ShelterCodeScreen.tsx` |
| 4-3 | `/4-3` | `src/screens/walk/ShelterCodeScreen.tsx` |
| 4-4 | `/4-4` | `src/screens/walk/WalkChecklistScreen.tsx` |
| 5-1 | `/5-1` | `src/screens/walk/WalkScreen.tsx` |
| 5-2 | `/5-2` | `src/screens/walk/WalkScreen.tsx` |
| 5-3 | `/5-3` | `src/screens/walk/GPSLostScreen.tsx` |
| 5-4 | `/5-4` | `src/screens/walk/WalkScreen.tsx` |
| 5-5 | `/5-5` | `src/screens/walk/WalkScreen.tsx` |
| 기타 신고 | `/5-5-other` | `src/screens/walk/OtherReportScreen.tsx` |
| 5-6 | `/5-6` | `src/screens/walk/ReportResultScreen.tsx` |
| 5-7 | `/5-7` | `src/screens/walk/ReportResultScreen.tsx` |
| 6-1 | `/6-1` | `src/screens/walk/WalkHandoverScreen.tsx` |
| 6-2 | `/6-2` | `src/screens/walk/WalkRecordSaveScreen.tsx` |
| 6-3 | `/6-3` | `src/screens/walk/LevelUpScreen.tsx` |
| 7-1 | `/7-1` | `src/screens/booking/AvailableBookingsScreen.tsx` |
| 7-2 | `/7-2` | `src/screens/booking/AvailableBookingsScreen.tsx` |
| 7-3 | `/7-3` | `src/screens/booking/DogDetailsScreen.tsx` |
| 7-4 | `/7-4` | `src/screens/booking/ApplicationReviewScreen.tsx` |
| 7-5 | `/7-5` | `src/screens/booking/ApplicationCompleteScreen.tsx` |
| 8-1 | `/8-1` | `src/screens/bookings/MyBookingsScreen.tsx` |
| 8-2 | `/8-2` | `src/screens/bookings/MyBookingsScreen.tsx` |
| 8-3 | `/8-3` | `src/screens/bookings/BookingDetailScreen.tsx` |
| 8-4 | `/8-4` | `src/screens/bookings/BookingDetailScreen.tsx` |
| 8-5 | `/8-5` | `src/screens/bookings/BookingDetailScreen.tsx` |
| 8-6 | `/8-6` | `src/screens/bookings/BookingCancellationScreen.tsx` |
| 8-7 | `/8-7` | `src/screens/bookings/BookingCancellationScreen.tsx` |
| 8-8 | `/8-8` | `src/screens/bookings/BookingCancellationScreen.tsx` |
| 9-1 | `/9-1` | `src/screens/history/WalkHistoryScreen.tsx` |
| 9-2 | `/9-2` | `src/screens/history/WalkRecordDetailScreen.tsx` |
| 10-1 | `/10-1` | `src/screens/mypage/MyPageScreen.tsx` |
| 10-2 | `/10-2` | `src/screens/mypage/EditProfileScreen.tsx` |
| 10-3 | `/10-3` | `src/screens/mypage/WalkPreferencesScreen.tsx` |
| 설정 | `/settings` | `src/screens/mypage/SettingsScreen.tsx` |
| 약관 안내 | `/policy-info` | `src/screens/onboarding/PolicyInfoScreen.tsx` |

Related frames documented as states share one screen component and receive a state prop from their route export.
