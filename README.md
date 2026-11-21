# 이어주개 mobile app

Expo + React Native + TypeScript project using Expo Router. Screen routes currently render empty safe-area placeholders; screen UI has not been implemented.

## Install and run

```sh
npm install
npx expo start
```

Run `npm run typecheck` to check TypeScript. Location and map packages are configured for the mobile flows. A Google Maps API key must be supplied before creating standalone native builds that use Google map tiles.

## Structure

- `app/` – Expo Router route files; each numbered route re-exports a screen component.
- `src/screens/` – placeholder screen modules grouped by flow.
- `src/components/` – shared `Icon` and `Screen` components.
- `src/assets/icons/`, `src/assets/images/` – Step 1 assets (preserved).
- `src/assets/fonts/` – local font files to add manually.
- `src/theme/` – existing design tokens, typography mappings, and font loading.
- `src/data/` – typed dogs, bookings, and walk-record mock data.
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
| 4-2 | `/4-2` | `src/screens/walk/CodeEntryResultScreen.tsx` |
| 4-3 | `/4-3` | `src/screens/walk/CodeEntryResultScreen.tsx` |
| 4-4 | `/4-4` | `src/screens/walk/WalkChecklistScreen.tsx` |
| 5-1 | `/5-1` | `src/screens/walk/WalkStartScreen.tsx` |
| 5-2 | `/5-2` | `src/screens/walk/WalkActiveScreen.tsx` |
| 5-3 | `/5-3` | `src/screens/walk/WalkActiveScreen.tsx` |
| 5-4 | `/5-4` | `src/screens/walk/WalkActiveScreen.tsx` |
| 5-5 | `/5-5` | `src/screens/walk/WalkActiveScreen.tsx` |
| 5-6 | `/5-6` | `src/screens/walk/WalkActiveScreen.tsx` |
| 5-7 | `/5-7` | `src/screens/walk/WalkActiveScreen.tsx` |
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

Related frames documented as states share one screen component and receive a state prop from their route export.
