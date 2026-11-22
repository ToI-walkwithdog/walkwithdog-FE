# Shelter mobile web: screen and backend handoff

This document describes the **implemented demo**, not an agreed API contract. The Korean translation is [SCREEN_HANDOFF_KO.md](./SCREEN_HANDOFF_KO.md). The web UI is a separate mobile-oriented React/Vite project, not the volunteer Expo app. Its monochrome screens are not Figma designs.

## Shared behavior and scope

- Start with `npm run dev` in `shelter-web`; `npm run build` type-checks and builds it. Navigation uses URL fragments; direct links and browser back/forward work in the preview.
- The initial shelter, dog, schedule, booking, report and walk are examples. The provider keeps edits in browser memory, shared between screens in the same tab. Refreshing or closing the tab resets them; exiting the dashboard does **not** reset them. Settings offers an explicitly confirmed reset.
- No request is sent to a server. Nothing is synchronized with the volunteer app. Do not enter real credentials, personal information or sensitive photographs.
- The shared header has a fixed destination labeled Back and a Home link, not a browser-history back button. Invalid fragments or unknown record IDs show an error and a route back. Browser back/forward uses fragment history.
- Buttons labeled “목업” change examples only. Server authentication, authorization, persistence, uploads, approval, notifications, codes, live monitoring, reports and evaluations are **not implemented**. Success messages describe local preview state only.

## Screen inventory

### 1. Login (`#login`, also the empty fragment)

**Purpose and flow:** The starting page has account ID and password inputs, a login button, a dashboard preview button and a link to shelter verification. The login form requires both inputs via the browser. Submitting only explains that login and verification are unavailable; it sends no credentials. The preview button opens `#dashboard` without authentication.

**Backend handoff:** Decide account provisioning, authentication method, credential recovery, session expiration, logout and failed-login handling. The preview link and unauthenticated direct routes must not be treated as access controls in production.

### 2. Shelter verification (`#verification`)

**Purpose and flow:** Explains that verification method, required documents and approval criteria are undecided. Back goes to login; Home or preview opens the dashboard. There is no application form, upload or submission.

**Backend handoff:** Define application fields, document requirements, submission/review states, reapplication, administrator review, access while pending, rejection reasons and secure document handling. No actual verification state is modeled yet.

### 3. Dashboard (`#dashboard`)

**Purpose and flow:** Shows the example shelter name and region, preview notice, pending-booking count, an unavailable live-walk count (`—`), unread incoming-report count, pending booking cards and navigation to all management screens. Pending cards lead to their booking detail. An empty pending list has a message. The exit button returns to login but does not clear preview state.

**Backend handoff:** Supply shelter-scoped counts and paginated/recent actionable requests, with loading, empty and error states. Live count must come from reliable live-walk state, not inferred from a missing response. Define data freshness and notification behavior.

### 4. Dogs (`#dogs`, `#dogs/new`, `#dogs/edit/{id}`)

**Purpose and flow:** List example dogs with photo or placeholder, breed, age, size, difficulty and active/paused state. Add and edit open the same form; the list also toggles a dog's local status. Missing IDs show an error.

**Form:** Name (required, maximum 30 characters), breed (required, 40), age in whole years (required, integer at least 0), size (small/medium/large), difficulty (required, number at least 0, step 0.1), notes (optional, 500) and optional photo. Whitespace-only required text is rejected. Difficulty scale and meaning are **not decided**. A selected image must have an `image/*` MIME type and be at most 5 MiB. It is read as a data URL into memory and previewed; remove clears it. File reading errors are reported and save is disabled while reading. Save returns to the list; cancel discards form edits.

**Backend handoff:** Provide shelter ownership, create/update, status and image upload/storage. Server-side validation and actual file-content checks are required; browser MIME/size checks are only convenience checks. Decide required fields, age representation, allowed difficulty scale, media limits, deletion/retention, and how pausing affects existing schedules and reservations. Region and shelter name come from the shelter, not duplicate dog inputs.

### 5. Schedules (`#schedules`, `#schedules/new`)

**Purpose and flow:** Lists each dog's date, same-day start/end time, maximum duration in minutes and locally active/paused state. It notes when the dog is paused. Add requires an active example dog; if none exists, the page links to dog management.

**Form:** Dog, date, start, end and positive integer maximum minutes are required. End must be after start, maximum duration cannot exceed the interval, and active intervals for the same dog and date may not overlap. Resuming a paused interval is also rejected if it conflicts with an active one. This preview does not prohibit past dates or check whether a booking already exists when pausing. Save returns to the list; cancel discards input.

**Backend handoff:** Validate conflicts transactionally on the server and define time zone, past-date policy, overnight slots, capacity, recurrence, edits/deletion, and whether pausing affects existing requests or confirmed reservations. Clarify whether duration is fixed or a maximum, and expose available times to the volunteer app.

### 6. Bookings (`#bookings`, `#bookings/{id}`)

**Purpose and flow:** List example bookings, dog, applicant name, age, walking experience, schedule, maximum duration and status. Detail opens from a list or dashboard card. A pending example can be locally approved or rejected; other states have no action. The local pending count updates. Unknown IDs show an error; an empty list is explained.

**Backend handoff:** Fetch shelter-scoped applications and authorized applicant fields; approve/reject with an atomic state transition and handle already-processed, cancelled or conflicting requests. Define reason requirements, cancellation rules, capacity and notifications. Approval currently does not issue a shelter code, notify the volunteer, reserve capacity or validate schedule availability. Coordinate code issuance, expiry and validation with the volunteer app before release.

### 7. Live walks (`#live`)

**Purpose and flow:** Displays an explicit unavailable state for current walks, location, GPS connection and overtime. It does not show fabricated locations, live activity or warnings.

**Backend handoff:** Define walk lifecycle and shelter-scoped live subscriptions/polling, timestamps, stale/offline states, location accuracy, explicit consent and retention. Decide the overtime threshold, alert recipients, deduplication and recovery behavior. Do not interpret absence of data as zero active walks.

### 8. Reports (`#reports`, `#reports/new`)

**Purpose and flow:** Lists example incoming volunteer reports and locally drafted outgoing reports with title, person, dog and message. Incoming unread examples can be marked reviewed locally; the dashboard unread count changes. The form creates an outgoing example with all four fields required: person (50 characters), dog (30), title (80) and message (1,000). Whitespace-only values are rejected. Save returns to the list; cancel discards edits. No report is sent or acknowledged by a server.

**Backend handoff:** Use server-side identities and links to the relevant walk rather than free-text names. Define report types, timestamps, evidence, status transitions, who may view or receive reports, triage, notifications, retention and dispute handling. Treat report content as sensitive and authorize access per shelter and role.

### 9. Walk history and evaluation (`#history`, `#history/{id}`)

**Purpose and flow:** Lists completed example walks and shows dog, volunteer, date, duration, distance, walk memo and shelter evaluation. The detail form saves a nonempty evaluation of up to 500 characters into the local example and shows an explicit no-server message. Missing records and empty lists are explained.

**Handover:** The volunteer app's handover happens **after** the walk: return of the dog and equipment is checked there. This web preview does not have a handover status or a confirmation form; the detail page explicitly says it cannot verify handover. Do not infer completion of handover from a completed walk.

**Backend handoff:** Define completed-walk data and units, immutable record ownership, pagination, correction rules and what the shelter may see. Define evaluation timing, edits, visibility to the volunteer, retention and moderation. Decide whether and how the volunteer's post-walk handover result is recorded and shared with the shelter.

### 10. Shelter settings (`#settings`)

**Purpose and flow:** Edit example name (required, 80 characters), region (required, 100) and optional phone (30); whitespace-only required fields are rejected. Local save is acknowledged as a mock. The verification link opens its informational page. Reset asks for browser confirmation, restores all initial examples and goes to the dashboard. Canceling confirmation leaves data unchanged.

**Backend handoff:** Store shelter identity and address/region with authorized updates and audit history. Define phone format, verification state, staff roles and account lifecycle. Reset is a demo-only action and must not become a production data-deletion endpoint.

## Proposed integration boundaries — not a finalized contract

Use stable server IDs and shelter ownership for shelters, staff, dogs, photos, schedules, applications, walks, handover results, reports and evaluations. Candidate operations are: authenticated session; shelter profile and verification; dog CRUD/status and media upload; availability management; application list/detail/decision; live walk feed; history/detail; report list/create/review; and evaluation create/update. Exact URLs, HTTP methods, payloads, response envelopes and error codes require backend agreement.

For each mutation, validate on the server, return the authoritative updated version, prevent duplicate submissions and handle expired sessions, permission failures, validation conflicts, network errors and retry behavior. Real-time signals must identify observation time and distinguish missing/stale from zero. Use secure transport, minimal collection, role- and shelter-scoped authorization, audit logs, retention/deletion policies and explicit location consent. Avoid exposing volunteer age, experience, reports or live location beyond approved purposes.

**Open product decisions:** shelter verification; difficulty scale and difficulty-based scoring/level thresholds; slot duration, overlap and cancellation rules; code lifecycle; live location consent and overtime threshold; post-walk handover responsibilities; evaluation visibility; report handling; and data access/retention. None is fixed by the demo.
