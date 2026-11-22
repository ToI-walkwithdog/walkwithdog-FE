# Volunteer mobile app: detailed backend handoff

The Korean translation is [VOLUNTEER_HANDOFF_KO.md](./VOLUNTEER_HANDOFF_KO.md). Shelter web: [English](./shelter-web/SCREEN_HANDOFF_EN.md) · [Korean](./shelter-web/SCREEN_HANDOFF_KO.md).

## 1. Purpose, status and reading rules

This document describes the code currently in this repository and proposes integration requirements. **It is not a finalized API specification, database schema, legal policy, or promise that features are implemented.** Field names and examples below are illustrative and must be agreed between backend, frontend and product. Route numbers identify Expo Router screens, not backend endpoints. UI wording and example values are not authoritative business rules.

The project has two separate clients:

- The **volunteer mobile app** is Expo / React Native / TypeScript. It uses Expo Router and mostly Figma-based screens.
- The **shelter mobile web** is a separate React/Vite preview. It has its own independent in-memory data. Neither client talks to the other or to a shared server.

The intended end-to-end product flow is: shelter registers a dog and availability → volunteer browses and applies → shelter reviews → volunteer receives a decision → an approved volunteer visits and enters a shelter code → completes the departure checklist → walks → returns the dog and equipment → records the walk. Reports, live monitoring and shelter evaluations also need shared backend support. **This is the intended flow, not current cross-client behavior.**

### Critical current limitations

1. No real login, registration, phone verification, consent storage, shelter-code validation, booking transmission, approval, cancellation, report submission, evaluation or backend persistence exists. The app can navigate with arbitrary nonempty login values. Do not use real credentials or personal data in this preview.
2. `MockSessionProvider` in [src/context/MockSession.tsx](./src/context/MockSession.tsx) holds example bookings, selected IDs, records, marker labels, profile and preferences in React memory. It resets on app-process termination and on mock logout. It is not a database or authenticated session. The shelter web has a different provider and resets on page refresh.
3. Selected dog and schedule are carried through the mock booking flow, but creation only adds a local `pending` entry. Cancellation only changes a locally confirmed entry. Shelter approval in the web preview cannot change the app.
4. The walk is **not measured**. Time, distance, speed, route, dog and shelter shown during/after walking are examples. A saved local record always uses the example dog, 1,935 seconds and 2,400 meters, regardless of the selected booking. Marker labels are stored without coordinates. Never import these values as real activity.
5. Date of birth, experience answers, onboarding activity region/time/size selections and consents are not saved to the shared mock profile or sent anywhere. Only nickname, name and phone are stored there during parts of onboarding. Password/account ID are not registered or retained as an account. Do not assume form completion means data was collected.
6. Map, reports and monitoring are incomplete: default map and route are static; actual Kakao mode only centers once; no live GPS collection, background tracking, server upload, real-time shelter view, automatic overtime warning or report delivery exists. Timeouts and offline recovery are not implemented.
7. Walk completion currently navigates through a **post-walk** handover checklist before local record save. The checks are not saved as evidence and are not confirmed by the shelter. The history detail displays an example handover label even for seed records, not an actual handover result.
8. The level-up screen exists but record saving goes to history, not level-up. It displays a fixed example. Difficulty-to-score rules and level thresholds are undecided; no real calculation exists.

## 2. Current implementation and ownership boundaries

Key source locations: [app/_layout.tsx](./app/_layout.tsx) mounts the mock provider; [src/types/models.ts](./src/types/models.ts) has minimal UI model types; [src/context/mockSessionLogic.ts](./src/context/mockSessionLogic.ts) creates/cancels local examples; [src/data/](./src/data/) contains separate seed dogs, availability, bookings and records. Their shapes are UI fixtures, not a shared domain model. In particular, dog IDs are a three-value TypeScript union in availability data, photos are bundled React Native image sources, and schedules are display strings without a year or time zone.

**Backend:** define domain ownership, durable storage, business validation, identity/authorization, actual SMS and code validation, transactional booking decisions, walk data, reporting and approved real-time interfaces. **Mobile frontend:** call agreed APIs, map server fields into screens, upload device data when authorized, handle permission/network/loading/error states, and stop showing fixture data as real. **Shelter frontend:** call the same backend for registration, review, monitoring and evaluations. **Product/operations:** decide policies and safety/legal language. Jointly agree the API contract and test end-to-end.

The frontend must not choose outcomes by editing UI state alone. The server must make authoritative decisions for permissions, availability, booking state, code verification and scoring. Conversely, an API alone does not populate existing UI: both clients need explicit integration work.

## 3. Screen-by-screen inventory and data needs

All current values below describe **mock UI**, not server guarantees. “Needed” describes candidate data/operations, subject to agreement.

### A. Welcome, login and signup

| Screen / route | Current UI and behavior | Backend/integration needed |
|---|---|---|
| Welcome `/1-1` | Waits about 5 seconds and replaces with login. | Decide session restoration and where an already authenticated user goes. |
| Login `/1-2` | Nonempty ID and password navigate to home; there is no verification or failure message for invalid credentials. | Login/session issuance, error handling, secure device token storage, refresh/expiry, revocation and logout. Decide whether ID, email or both are supported. |
| Privacy `/1-4`, `/1-5`; policy info `/policy-info` | Initial checkboxes are preselected; details are placeholder text. The later terms/privacy links also open placeholders. No legally valid consent is recorded. | Publish approved versioned documents; collect explicit consent according to legal/product requirements, including document/version, purpose and server timestamp. Define withdrawal and required vs optional consent. Replace placeholder wording before release. |
| Register `/1-3` | Nickname requires a local duplicate check against a small static list; ID must be 4–20 ASCII letters/digits; password is 5–128 characters with upper/lowercase, digit and special character, and confirmation must match. Only nickname is put into mock profile. This is a **nickname**, not account-ID, duplicate check. | Agree production account/nickname rules and uniqueness, server-side checks and final atomic creation. Handle check-to-submit races, signup failures, account recovery and secure password hashing on the server. Never store or log plaintext passwords. |
| Pledge `/1-6`, waiting `/2-1` | Pledge button proceeds; waiting automatically advances after about 1.5 seconds. Neither is stored or a backend review. | Decide whether a versioned pledge acknowledgment or review/approval is required and how it is recorded; do not infer approval from the timer. |

### B. Volunteer information and onboarding

| Screen / route | Current UI and behavior | Backend/integration needed |
|---|---|---|
| Basic information `/2-2` | Name is required; birth date formats digits as `YYYY.MM.DD`, checks a real calendar date and rejects future dates. Phone request accepts 10 or 11 digits; mock confirmation requires a request and test code `123456`. Changing the phone invalidates the mock request/confirmation. Only name and phone enter memory; **birth date is discarded**. No SMS or real verification. | Agree date-only representation (for example ISO `YYYY-MM-DD`), minimum age policy, phone normalization and verification lifecycle. Backend must verify real one-time codes, expiration, retries, rate limits and ownership; never trust a client `verified` flag. The test code must not be a production credential. |
| Experience `/2-3`, `/2-4` | Asks whether the user has cared for a dog; details include breed, dog size, frequency, perceived difficulty and multiple difficult situations. Selections are screen-local and are not carried forward or saved. `/2-3` says inexperienced users go straight home, but Next currently always opens `/2-4`, which starts with its own independent defaults. | Decide first-time-user flow, required/optional experience details, controlled values and what a shelter is authorized to see. Frontend must preserve answers and submit them; backend must store and validate the agreed fields. |
| Routine and consent `/2-5` | Free-text city/district, multiple time slots, walk-duration choice, comfortable size and two required checkboxes. Only nonempty city/district and both checkboxes are validated. A mock notice appears; none of these values or consents is persisted. Defaults and weight labels are UI examples, not policy. | Define structured region IDs, available time categories, duration/size vocabulary, recommendation rules, actual consent versions and completion state. Avoid promising that recommendations exist until implemented. |
| Location `/2-6` | Requests foreground permission when entered and navigates to home after the request returns, whether granted or denied. Errors are logged; actual live walk tracking is not enabled. | Decide location-dependent capabilities and graceful denial path. OS permission is not itself a complete product/legal consent for collection, live sharing or retention. |

### C. Home, discovery and application

| Screen / route | Current UI and behavior | Backend/integration needed |
|---|---|---|
| Home `/3` | Uses local profile, booking and records; selects the first confirmed example, otherwise the first entry. Start walk requires a local confirmed entry. The displayed calendar date and artwork are static. | Authenticated home summary, actual upcoming booking selection/order, recent walks and empty/error/loading states. Define what qualifies as startable and handle expiry/status changes. |
| Available walks `/7-1`, `/7-2` | `/7-1` is a 1.5-second loading mock. List uses bundled dogs and example dates, shelter/region, size, maximum duration, numerical “difficulty” and available time labels. Size filter works locally and can default from mock preferences; region/nearest location are static, not geospatial, and duration/region filtering are not connected. “More” shows a notice. | Paginated/filterable available slots; dog and shelter IDs, name, displayable image URL, size, breed/age where approved, region, safety notes, difficulty and slot IDs/times/duration. Define image availability and fallback, filtering, sorting/distance, availability freshness and empty/error states. |
| Dog detail `/7-3` | Displays selected mock dog and one of its local schedule entries. Kongi has fixed notes; other dogs show a generic notice. Shelter detail is a region and an instruction to ask for the address. | Fetch selected dog/shelter and current slots by stable IDs; include accurate care notes and any access-controlled address/contact. Recheck a selected slot before application. Do not use array index as a server slot identifier. |
| Review `/7-4` and completion `/7-5` | Shows chosen dog/schedule and mock nickname; one local pending application is added on submit. Completion says application was only saved in the app. A local `useRef` prevents repeated taps on that mounted screen, but provides no server idempotency. | Submit authenticated volunteer + slot ID; server checks eligibility and availability and returns authoritative booking ID/status. Show pending only after success, and handle conflict, retry, duplicate request and network uncertainty. |

### D. My bookings and cancellation

| Screen / route | Current UI and behavior | Backend/integration needed |
|---|---|---|
| List `/8-1`, empty `/8-2` | Shows local statuses `pending`, `confirmed`, `rejected`, `cancelled`; filters all/pending/confirmed/past. “Past” currently means only rejected or cancelled, not completed or date-based. Selecting a card stores a local selected ID. | List/detail by stable booking ID, server status and transition times; define past/completed categorization, pagination, status freshness and notifications. Handle missing/removed dogs without crashing. |
| Detail `/8-3`–`/8-5` | Shows selected local record, dog and shelter. Confirmed permits code entry and cancellation; rejected shows a fixed example reason. Displayed booking number is a placeholder. | Supply actual status, permitted actions, schedule, booking reference, authorized shelter address/phone and rejection reason if policy permits. Fetch by ID and handle stale state, expired/missing/forbidden records. |
| Cancellation `/8-7`, `/8-8` | Confirmed detail goes to confirmation, then local cancellation and completion. Reason is selected on screen but not saved or sent; pending cancellation is not offered. `/8-6` currently renders the cancelled state and is not the normal entry path. | Decide who may cancel which state, cutoff/reasons and capacity release. Apply transitions atomically; notify shelter/volunteer and return the actual resulting state. Do not show successful cancellation after a failed or uncertain request. |

### E. Visit, walk and safety

| Screen / route | Current UI and behavior | Backend/integration needed |
|---|---|---|
| Shelter code `/4-1`–`/4-3` | Six-digit input compares against local test code `428619`; any other value uses a generic incorrect/expired message. The displayed dog/shelter/schedule are fixed, not the selected booking. A correct example proceeds to departure checklist; no actual code expiry, booking association, or validation exists. | Decide issuer, scope (shelter/booking/visit), validity window, single-use/replay behavior, revocation, attempts/rate limits and audit. Validate against authenticated volunteer and relevant confirmed booking on the server. Return enough status for a safe UI without exposing secrets or enabling enumeration. Confirm when validation versus walk-start is recorded. |
| Departure checklist `/4-4` | Requires all four local checks: leash/harness, waste bags, water/bowl, wipes. Safety guidance shown. Starts a mock walk after a warning and clears marker labels. No checklist is transmitted. | Agree checklist content/version, whether self-attestation is recorded, and start requirements. The checklist is **before** walking; it is not the post-walk handover. |
| Active/pause `/5-1`, `/5-2`, markers `/5-4` | Static 24:15, 1.8 km and 4.5 km/h; pause/resume changes UI only. Four selectable labels are sniffing, defecation, another dog and photo spot. Labels remain in local memory, without position/time/photo; map markers shown on the mock map are static illustrations. End opens handover. | Define walk start/pause/resume/end events, timestamps, state recovery and whether pauses count in duration; capture GPS only with permission and agreed policy. Define route/marker event format, sample quality, offline queue, deduplication and authoritative distance/speed calculation. The client must implement collection; backend must persist and expose it. |
| GPS lost `/5-3` | A separate example screen exists but is not automatically opened on signal loss. Reconnect gives an unsupported notice; ending leads to post-walk handover. | Define signal-loss detection, stale/accuracy thresholds, pause/continue behavior, retries, app background/kill recovery and how missing segments affect metrics. Avoid fabricating coordinates or a successful reconnection. |
| Reports `/5-5`, `/5-5-other`, `/5-6`, `/5-7` | Choices are escape, injury, waste-bag shortage, ingestion and other. Other requires nonblank text, but that text is not retained or sent. Both result screen variants state that submission failed; contact button says the phone number is not connected. No call or location transmission occurs. | Define severity, recipient, actual message and optional location/evidence, submission acknowledgment, report ID/status, offline failure and safe fallback contact. Do not imply that a report was delivered or that a call was placed unless confirmed. Real urgent situations need an agreed operational escalation process outside this mock UI. |
| Post-walk handover `/6-1` | After ending, user checks return of dog to staff, return of leash/harness/equipment, and communication of dog condition/special notes. All three are needed to proceed; “return to walk” is available. The checks live only in component state. | Decide whether volunteer self-attestation, separate shelter confirmation, timestamps and exceptions are required. No checkbox currently proves shelter acceptance; never infer verified handover from a walk record. |
| Save record `/6-2` | Fixed sample map/stats; optional multiline memo. Map download is not connected. Saves a **local example** with trimmed memo and marker labels, then opens history. Memo explicitly is not sent to shelter. | Decide whether end and save are separate commands, authoritative walk identity/statistics, memo visibility and revisions. Persist only measured/validated values, preserve failed drafts, prevent duplicate saves and return the definitive result. Map-image export is separate from route storage. |
| Level-up `/6-3` | Present but not opened after record save; shows fixed level 4. My page independently shows fixed level 3. | Agree difficulty scale, eligible completed walks, point formula, levels and authoritative calculation/version. Only show level-up when backend reports an actual transition; define whether/how it may be shown again after reconnect. |

### F. History, profile and settings

| Screen / route | Current UI and behavior | Backend/integration needed |
|---|---|---|
| History `/9-1`, detail `/9-2` | List sums local record count/meters and opens the selected local record. Detail derives average speed from stored seconds/meters, displays memo/marker labels and an example handover label. Seed records and all values are examples. | Owned completed-walk history, stable IDs, start/end timestamps, duration seconds, distance meters, optional route/markers/memo/handover state and paging. Define metric rounding, deletion, corrections and permissions. Do not treat the mock label as evidence of actual handover. |
| My page `/10-1` | Displays local nickname, fixed level 3, local total count, distance and unique dog count. Links to records, bookings, settings, profile and preferences. Logout resets local examples. | Authenticated profile, real server aggregates and level; define count semantics and session revocation. No actual account logout currently occurs. |
| Edit profile `/10-2` | Nickname required; name and phone can be edited in memory. “Change/reverify phone” only says unsupported; save does not verify phone or store on server. | Authorized profile update, nickname uniqueness, verified phone-change flow, validation and conflict/error responses. Avoid treating a raw edited phone as verified. |
| Preferences `/10-3`, settings `/settings` | Duration and size are saved locally; region is fixed to an example and tapping it shows unsupported. Size becomes the initial list filter; duration/region do not filter. Settings only links to profile/preferences. | Store and retrieve agreed preferences; define region selection and filtering/recommendation behavior. Reconcile these settings with the separate onboarding form, which currently does not populate them. |

## 4. Shared domain data: proposal, not contract

Server IDs should be opaque and stable; neither bundled image `require()` values nor array indexes or localized display strings should be API identifiers. Candidate objects and cross-client needs:

| Entity | Candidate fields / relationships | Used by |
|---|---|---|
| Volunteer | `id`, nickname, verified contact reference, birth date or privacy-preserving age eligibility, onboarding status, authorized experience/preferences | App identity/profile; shelter receives only approved applicant subset. |
| Shelter / staff | `id`, name, region/address, authorized contact, verification status, staff roles | Web ownership; app discovery and confirmed visit guidance. Decide when exact address/contact is revealed. |
| Dog / media | `id`, `shelterId`, name, breed, age or birth information, size, difficulty, notes, image URL(s), active status | Shelter creates; app list/detail renders. Image upload/storage/access and cache/expiry need agreement. |
| Availability | `id`, `dogId`, date/start/end with time zone, maximum walk minutes, active/capacity state | Shelter publishes; app chooses stable slot ID. Shelter UI currently uses a same-day interval; app uses yearless display strings. |
| Booking | `id`, `volunteerId`, `shelterId`, `dogId`, `slotId`, status, decision/cancellation metadata, timestamps/version | Both clients. Dog and slot references and snapshots need a retention/edit policy. |
| Walk / handover | `id`, `bookingId`, lifecycle status, start/end, pauses, distance, route references, handover status/attestation | App generates approved events; shelter views only authorized operational state. A completed walk and verified handover are distinct. |
| Marker / report / evaluation | Marker type and optional coordinates/time; report type, walk ID, message, status, timestamp; shelter evaluation linked to walk | Define who submits/views each, precision, sensitivity, deletion, moderation and acknowledgement. |
| Consent / level | Versioned document acceptance and withdrawal; score/level and calculation version if approved | Server audit and eligibility; frontend displays the authoritative result, not a local guess. |

### Illustrative payload shapes

These are **examples only**: names, types, permissions, URLs, response status codes and requiredness are not settled. Times shown are examples, not active bookings. No example secret is a real credential.

```json
{
  "dog": { "id": "dog_example", "name": "Example", "imageUrl": "https://example.invalid/dog.jpg", "size": "small", "difficulty": 3.5 },
  "shelter": { "id": "shelter_example", "name": "Example shelter", "region": "Example region" },
  "slot": { "id": "slot_example", "startsAt": "2027-01-15T10:00:00+09:00", "endsAt": "2027-01-15T11:00:00+09:00", "maxWalkMinutes": 30 }
}
```

```json
{
  "booking": { "id": "booking_example", "slotId": "slot_example", "status": "pending", "updatedAt": "2027-01-01T00:00:00Z" }
}
```

For illustration, the app would render `dog.name` and `{ uri: dog.imageUrl }` into React Native text/image components after receiving and validating the agreed response; the shelter web separately uploads/registers the dog through the backend. A URL may be absent, inaccessible or expired: define fallback and refresh behavior. The snippets do **not** assert actual implemented APIs, accepted enum values or a production difficulty scale.

## 5. Proposed operation groups and key decisions

No endpoints have been agreed. Suggested capability groups, not prescribed HTTP routes:

1. **Identity and onboarding:** nickname availability; signup; login/session refresh/logout; phone verification request/confirm; onboarding profile and experience; published legal documents and versioned consent. Make final signup and uniqueness checks authoritative; rate-limit SMS/login and protect account enumeration.
2. **Discovery:** list/filter/sort available dogs/slots; dog/shelter detail and authorized images; refresh availability before applying. Specify paging, time zone and how shelter edits/pauses affect existing slots and reservations.
3. **Bookings:** create, list, detail, cancel; shelter list/detail and approve/reject. Client retries must be idempotent and transitions/concurrency checked server-side. Prevent two approvals or a cancellation/approval race from overbooking. Decide whether pending applications hold capacity and how rejection reasons are shared.
4. **Visits and walks:** issue/verify a shelter code for the correct booking and volunteer; start/pause/resume/end or submit events; sync location and markers; retrieve current status and history. Decide server vs device clock, reconnection, background collection and cutoff when permission is revoked. Do not assume verification alone starts a walk.
5. **Handover, records and level:** separate post-walk attestation/verification from end/save if needed; save/edit allowed memo; retrieve history and aggregates; return an actual level change only after agreed eligibility and scoring. Decide whether the shelter sees volunteer memo and what it can evaluate.
6. **Safety and communication:** create report, identify recipient and delivery/acknowledgment, report status, authorized shelter contact, shelter-originated volunteer report/evaluation, optional push notifications. For live monitoring specify subscription/polling, timestamps, stale/offline states, connection interruption and overtime rules.

### Candidate request/response checklist

The table gives the backend team concrete discussion points. Every operation, field and error is a **proposal**, not an existing API or a required endpoint name. The authenticated principal should normally come from the server-validated session, not a client-supplied volunteer or shelter ID.

| Operation | Candidate request | Candidate successful response | Important conditions / failures |
|---|---|---|---|
| Check nickname | Candidate nickname | Availability and validation outcome | Concurrent signup can still claim it; recheck atomically at registration. Define rate limits and normalization. |
| Verify phone | Request: phone; confirm: verification transaction ID and code | Expiration/resend guidance; on confirm, server-issued verification proof or verified state | Expired, wrong, exhausted, changed phone, SMS failure; never trust a local checkbox. Define proof lifetime and rate limits. |
| Create account / session | Account ID, password, nickname, verification proof and agreed consent data; login credentials separately | Account/session or safe failure; onboarding progress | Duplicate nickname/account, bad proof, invalid/changed document version, throttling. Decide whether signup completes before or after onboarding. |
| Save onboarding/profile | Name, date-only birth date, verified phone reference, experience and preference values as agreed | Authoritative profile, onboarding state and permitted fields | Partial submission/restart, age eligibility, invalid or changed verified phone, invalid consent. Avoid exposing DOB or contact unnecessarily. |
| List availability | Optional region, size, duration, date, location and cursor when supported | Dogs/shelters with image references and stable slots; next cursor if any | Permission-denied location, no matches, missing image, stale/paused slots. Define whether “nearby” uses server or device computation. |
| Dog and slot detail | Dog/slot ID | Current dog, shelter information allowed at this stage, notes, active slots | Removed/paused dog, unavailable/changed slot, inaccessible photo. Revalidate at application time. |
| Apply | Slot ID and an idempotency key or equivalent | Server booking ID and authoritative pending/other permitted outcome | Slot full/closed, already applied, ineligible user, network timeout with unknown result. Specify idempotency scope and lookup/retry behavior. |
| List/detail bookings | Optional filter/cursor; booking ID for detail | Owned bookings, status, timestamps, display data and permitted actions | Unknown or forbidden ID, deleted dog, stale status; distinguish empty list from error. |
| Shelter decision | Booking ID, decision and optional reason/version | Authoritative booking status/version | Wrong shelter, already decided/cancelled, conflicting or capacity-limited decision. Use atomic transition and notify as agreed. |
| Cancel booking | Booking ID, optional reason and idempotency/version if agreed | Actual updated booking status | Not cancellable, already changed, cutoff passed, request outcome unknown; release capacity only per agreed rule. |
| Verify visit code | Booking ID and entered code | Validated visit/authorization reference or safe rejection | Wrong/expired/used/revoked code, wrong user/booking, attempt limit. Avoid returning or logging the code. Decide whether verification creates a walk. |
| Walk events / location | Walk/booking ID, event ID, event type and observed timestamp; optional approved GPS samples/markers | Server walk state, accepted event IDs and last acknowledged point/version | Duplicate/out-of-order events, poor accuracy, revoked permission, offline queue, conflicting end/start. Agree batching and clock authority. |
| End, handover and save | Walk ID, end event; separately agreed self-attestation/confirmation, optional memo and idempotency key | Final walk/record status, real metrics and handover status; level transition only if applicable | Failed/unknown save, incomplete handover, duplicate submission, missing route. Do not equate self-attestation with shelter confirmation. |
| Report | Walk ID, type, optional message/location/evidence according to policy | Report ID, server receipt time and actual delivery/processing state | Offline/timeout, unsupported type, attachment failure, forbidden recipient; receipt is not necessarily staff acknowledgment. |
| History / evaluation | Owned walk ID or cursor; evaluation only from authorized shelter staff | Records, permitted details/aggregates; evaluation result and visibility | Missing/forbidden record, partial route, inaccessible memo/evaluation. Define edits, pagination and retention. |

### Proposed failure semantics to agree

- **Authentication/authorization:** expired or revoked session, wrong role, different shelter/user, access to a removed resource.
- **Validation:** invalid calendar date, unverified/changed phone, invalid consent version, unsupported enum, file type/size, malformed times and missing required data.
- **Conflict:** slot closed/paused/filled, duplicate application, already processed decision, changed reservation, already consumed/expired code, invalid walk transition and duplicate record save.
- **Unavailable/uncertain:** network lost after request, timeout with unknown result, server/storage/SMS failure, unavailable/stale GPS and missing image. Distinguish an empty result from an error and from not-yet-loaded data. Define machine-readable error codes, user-safe messages, retryability and correlation IDs; don't display sensitive internal details.

## 6. Cross-client consistency and mismatch checklist

- **Photos:** shelter form reads a local image only; it does not upload it. App currently renders bundled images. Implement upload, durable access and server-provided URL, then map URL to mobile image and handle no image/error.
- **Identity:** shelter demo applicant name/age/experience is a fixed example. App collects birth date and experience on separate screens but does not save them. Agree collection, consent, server calculation of age and field-level shelter access before integration.
- **Schedule:** web stores date + start/end + maximum minutes; app has fixed strings, no year/time zone, and selects by index. Introduce stable server slot IDs and consistent temporal types; decide overlap, capacity, time-zone and rescheduling semantics.
- **Approval:** web locally changes `pending` to `confirmed`/`rejected`; app locally creates a pending entry. Neither sees the other. Shared backend transition and retrieval/notification are required.
- **Start:** app locally compares a shared hard-coded six-digit value, with static dog/shelter display. Web does not issue codes. Define the real code lifecycle and bind it to the correct booking/visit.
- **Reports:** app sends nothing; shelter's incoming report is a seed; shelter outgoing report is also local. Model two directions and authorized recipients separately; do not misrepresent draft or failed requests as delivered.
- **Walk / handover:** web live screen explicitly says unavailable; app uses sample figures. Post-walk volunteer checklist is not shelter verification and is absent from the web state model. Decide whether the shelter must confirm.
- **History and evaluation:** app's walk memo and marker labels are local; shelter example history/evaluation is unrelated. Decide sharing scope, ownership and display of evaluations before connecting.

## 7. Security, privacy and operational requirements

These are integration requirements to evaluate with the team, not a claim of legal compliance:

- Use authenticated, encrypted transport; scope every read/write to the correct volunteer or shelter staff and role. Check permissions on the server, not just hidden buttons. Protect tokens using appropriate platform secure storage and ensure logout/revocation has defined behavior.
- Collect the minimum personal data. Birth date is not interchangeable with a displayed age; define age eligibility calculation, disclosure, consent and time-zone policy. Shelter access to volunteer phone, age, experience, reports, evaluations and precise location must be purpose-limited.
- Version and retain evidence of actual consent/pledge only as approved; support legal document updates and withdrawal according to policy. The present prechecked mock boxes are not real consent.
- Use server-side OTP expiration, limited attempts, rate limiting, replay prevention and abuse monitoring. Do not log passwords, codes, tokens, full phone numbers or precise location unnecessarily.
- Location requires an explicit product/legal decision beyond OS foreground permission. Specify when collection starts/stops, background behavior, accuracy/precision, viewer access, retention/deletion, consent withdrawal, incident access and missing/stale indicators. Privacy review is required before enabling live location.
- Validate uploaded files by content and limits, store safely, define image ownership/access, expired links and deletion. Secure reports/evidence; define retention, access/audit and moderation.
- Decide accessible user-facing Korean error/empty/loading states, retries and support/escalation. Server must record authoritative timestamps; observability should avoid leaking sensitive data.

## 8. Suggested implementation order and acceptance checks

This order is a recommendation, not an agreed milestone plan:

1. **Contract and decisions:** agree shared IDs, field definitions, screen access, status transitions, duration/region/difficulty, consent and error format. Replace fixture-only types with agreed DTOs/adapters in each client.
2. **Identity and catalog:** implement signup/login/verified contact and authorized shelter dog/photo/slot publication; app fetches and renders real data. Handle image missing, empty list, pagination, invalid/expired sessions.
3. **Booking lifecycle:** submit from app, show it in the correct shelter, approve/reject, refresh the app, and cancel with concurrency protection and reliable feedback. Test duplicate taps/retries, closed slots and conflicting decisions.
4. **Visit and walk:** implement scoped expiring code and confirmed-booking checks; implement actual recording with permission, state recovery and honest missing-data states. Implement post-walk handover according to the agreed policy.
5. **History, safety and monitoring:** persist real walks/memos/markers, reports and any agreed evaluations; connect authorized live monitoring, notifications and overtime only after policies and technical collection exist. Add level-up only after scoring is agreed.
6. **Release hardening:** replace sample content and test codes, publish legal documents, secure credentials/permissions, cover network interruption and app restart, validate on real Android/iOS devices and confirm shelter-side access boundaries.

**End-to-end acceptance scenarios:**

1. Shelter uploads a dog photo and creates a dated slot; the app displays the same dog, photo, region, duration and slot after refresh, without bundled fallback being mistaken for the upload.
2. Volunteer applies once; only the correct shelter sees the application and authorized applicant fields. Approval/rejection appears for the correct volunteer; concurrent approvals and retries do not duplicate or exceed capacity.
3. A confirmed booking can use only its authorized, unexpired code under the agreed policy; wrong, expired, reused and another booking's code never start a walk.
4. On permission denial, signal loss, offline operation, app restart or delayed updates, the app and shelter view show truthful status; no example route or zero count is presented as real. Reconciliation follows the agreed policy.
5. Ending, post-walk return, handover attestation and record saving follow distinct agreed steps. A failed save can be retried without duplication; an unchecked or unverified handover is never shown as shelter-confirmed.
6. A report is shown as delivered only after server acknowledgment; offline/failed submission and unavailable contact are explicit. Only permitted users see reports, route, contact, memo and evaluation.
7. Real history totals and level changes match authoritative records and scoring, including edits/duplicates and time-zone boundaries; no level-up is triggered for a non-eligible walk.

## 9. Open decisions for the team

- Authentication/account recovery, real phone provider, consent documents, legal retention and minimum age.
- Which onboarding fields are mandatory, how no-experience flow behaves, and what applicant information a shelter may view.
- Dog difficulty scale and notes, region vocabulary, image storage/access, and recommendation/filter criteria.
- Schedule time zone, capacity, overlap, date-based “past” definition, booking cancellation/approval/rejection rules and notifications.
- Code issuer, association, expiration, reuse and when a verified visit becomes an active walk.
- Foreground/background location, privacy consent, accuracy, offline reconciliation, overtime threshold, alerts and recipient responsibilities.
- Who attests to or confirms return of dog/equipment after a walk, exception handling, and whether the web displays handover status.
- Memo and evaluation visibility, report recipients/escalation, retention/deletion, difficulty-based scores and level-up thresholds.

The team-owned [navigation-flow.md](./navigation-flow.md) documents earlier navigation decisions and unresolved onboarding questions; this handoff does not modify it. Check current code and product decisions again as implementation evolves.
