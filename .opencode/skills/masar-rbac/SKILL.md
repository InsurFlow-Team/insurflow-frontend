---
name: masar-rbac
description: Masar claims-management role/permissions reference. Use when changing routes, RoleGuard, Sidebar items, or any capability across ADMIN / CLAIMS_OFFICER / FIELD_ADJUSTER; when asked who can create/assign/view/edit claims or users; or before editing any RBAC-related code. Consult before assuming a role's permissions.
---

# Role & Permission Matrix (Masar MVP)

Source of truth for agreed role decisions. Update this file whenever a new ruling is agreed — decisions must not live only in chat history.

## Roles
- `ADMIN`
- `CLAIMS_OFFICER`
- `FIELD_ADJUSTER` — blocked from the dashboard entirely (at login)

## Matrix (frontend intent)

| Capability | ADMIN | CLAIMS_OFFICER | FIELD_ADJUSTER |
|---|---|---|---|
| View Overview / Claims Queue / claim details | yes | yes | no access |
| Create claim (`POST /claims`) | yes (intent) | yes | no |
| Assign field adjuster (`POST /claims/:id/assign`) | yes (intent) | yes | no |
| View Settings + User Management | yes | no | no |
| Manage users (add / edit / status (deactivate/activate) / reset) | yes | no | no |
| View own Profile (`/profile`) | yes | yes | no access |
| View Field Adjusters Directory (`/adjusters`) + Profile (`/adjusters/:adjusterId`) | yes | yes | no access |
| View **Map Dispatch (`/map`)** + Assign from a claim pin | yes | yes | no access |
| Change own password (Profile page) | yes | yes | n/a |
| Edit own basic data (name/contact) | pending backend | pending backend | n/a |
| Deactivate / Activate own account | never | n/a | n/a |
| Reset own password | yes | yes | n/a |

## Frontend enforcement points
- `dashboard/src/App.tsx:28` — RoleGuard `["ADMIN","CLAIMS_OFFICER"]` for `/dashboard`, `/claims`, `/claims/:claimId`, `/adjusters`, `/adjusters/:adjusterId`, `/map`, `/profile`.
- `dashboard/src/App.tsx:38` — RoleGuard `["ADMIN"]` for `/settings` + `/settings/users`; `App.tsx:44` `/users` redirects to `/settings/users`. The password card lives on **Profile** (all dashboard roles), NOT in Settings.
- `dashboard/src/App.tsx` — `/unauthorized` route inside ProtectedRoute/DashboardLayout (any authenticated user), renders the Access Denied page.
- `dashboard/src/routes/RoleGuard.tsx` — a role not in the allowed list → `Navigate to "/unauthorized"` (visible Access Denied page, no silent redirect).
- `dashboard/src/layouts/Sidebar.tsx:33,39` — Overview/Claims Queue → ADMIN+CO; `Sidebar.tsx` "Field Adjusters" → ADMIN+CO; `Sidebar.tsx` "Map Dispatch" (`/map`) → ADMIN+CO; `Sidebar.tsx:51` Profile → ADMIN+CO; `Sidebar.tsx:59,61` — Settings/User Management → ADMIN only.
- `dashboard/src/pages/Login.tsx` — FIELD_ADJUSTER blocked (see `AuthContext.tsx`); every allowed role lands on `/dashboard` after login.
- `dashboard/src/pages/Users.tsx:311` — self-row protection: deactivate/activate hidden on own row (`currentUser?.id`); Reset allowed on own row. No Delete action exists (decision 2026-09-19).
- `dashboard/src/pages/ClaimsList.tsx:76` — per-row Assign action available to `ADMIN` + `CLAIMS_OFFICER` (assign only from `NEW` status).
- `dashboard/src/pages/ClaimDetails.tsx` — Assign Field Adjuster button (same `ADMIN`+`CLAIMS_OFFICER` gate) offered only while the claim is `NEW`; after success the detail reloads (status becomes `PENDING_ACCEPTANCE`).
- Capacity override UI (2026-09-19): `AssignClaimModal` + `AddClaimModal` show a "Capacity Override" ConfirmDialog when the backend answers `409 ADJUSTER_UNAVAILABLE`; confirming resends the same assignment with `overrideCapacity: true`. Declining keeps the claim unassigned (and lists it as created-but-unassigned from Create+Assign).
- Map Dispatch (`/map`, 2026-09-20): `MapPage` (ADMIN+CO) renders claims/adjusters that have real coordinates only (null-safe — records without GPS are never invented; empty data → "No location data yet" banner, no fabricated pins). Claim pins color by status; adjuster pins by backend availability/status — never by a hardcoded capacity. Assign from a claim pin reuses the exact same `AssignClaimModal` + override flow; only `NEW` claim pins show Assign; after success the map refetches from `GET /claims`. Leaflet (react-leaflet 5) is lazy-loaded with the `/map` chunk. `distanceKm`/nearest panel deferred until backend provides coordinates ordering.

## Backend reality (verified live — do NOT assume otherwise)
- `PATCH /users/:id/status` — admin-only; CLAIMS_OFFICER → 403 (proven).
- `POST /claims` and `POST /claims/:id/assign` — CLAIMS_OFFICER passes (400-validation proves authz). ADMIN blocked with 403 was confirmed live earlier; محمد (backend owner) has since allowed ADMIN to create+assign (per user confirm) — re-verify live with current admin credentials before trusting UI-only.
- Assignment round-trip (verified live 2026-09-19): `POST /claims/:id/assign` → `200` `PENDING_ACCEPTANCE` ("Assignment pending acceptance") with timeline event. `accept-assignment` / `decline-assignment` / `inspection/start` / `inspection/submit` exist and are adjuster-only (CO → 403). `review/start` validates `SUBMITTED` only (409 otherwise). Declined-claim resulting status + reason validation NOT yet verified (needs a demo adjuster credential); `PENDING_ACCEPTANCE` proves NOT counted in `activeTasksCount`.
- Capacity override (verified live 2026-09-19 on FA-009, 4 tasks > capacity 3): assign → `409` with `errors[].code = "ADJUSTER_UNAVAILABLE"` (live message text: "Adjuster is currently unavailable"). Resending the same payload with `overrideCapacity: true` → `200` `PENDING_ACCEPTANCE`, and the timeline records `[CAPACITY OVERRIDE] Assigned while adjuster had 4 active tasks (max: 3)`. Reassigning a claim that is already `PENDING_ACCEPTANCE` → `409 INVALID_STATUS_TRANSITION` ("Claim is not in NEW state") — assignment is only ever offered from `NEW`. **Contract confirmed by backend owner (2026-09-20)**: `ADJUSTER_UNAVAILABLE` means capacity ONLY (→ override dialog); `ADJUSTER_NOT_FOUND` means the adjuster identity is gone and NO override is ever offered (inline error + stale adjuster disappears on reload). Decline is `PENDING_ACCEPTANCE → NEW` and the **Web has no Accept/Decline UI**. Frontend keys the override strictly on `ADJUSTER_UNAVAILABLE` (`getApiErrorCode` reads `errors[0].code`).
- Assign dropdown ACTIVE-only (2026-09-20): both `AssignClaimModal` and `AddClaimModal` slice `adjusters.filter(a => a.status === "ACTIVE")` — the backend refuses to assign INACTIVE (→ `404 ADJUSTER_NOT_FOUND`), so deactivated users are never offered. Live `/users/adjusters` (CO token, 2026-09-20) = 6 rows: **ACTIVE → FA-001 Ahmed Adjuster 2/3, FA-002 Second Adjuster 1/3, FA-003 hammod 2/3**; **INACTIVE → FA-004 hammod 1/3, FA-005 newUser 0/3, FA-009 Ruba 4/3**. NOTE: two users are literally both named "hammod" (FA-003 ACTIVE vs FA-004 INACTIVE). Assign labels now render `name (code) — Available/Busy · x/3` so the duplicate is distinguishable. OPEN: if the admin Users page shows FA-004 as ACTIVE while `/users/adjusters` says INACTIVE, that is a backend endpoint disagreement → report to محمد (GET /users is admin-only; CO → 403, so the decision must be live-reverified with an admin token).
- `GET /users/adjusters` — returns `availability` + `activeTasksCount` + **`capacityLimit: 3` lived** (verified every adjuster; 4 tasks → UNAVAILABLE). No simulation seed in the frontend anymore. `location` (GPS) currently `null`; the frontend maps `location`/`distanceKm` onto `FieldAdjuster` and `incidentCoordinates` onto `ClaimSummary` as optional GeoPoints (`utils/geo.ts` → `normalizeGeoPoint`), but all live records are still empty. All live claims have empty `incidentCoordinates`.
- **Claim intake gate (2026-09-21, user ruling)**: claim creation is now a two-step flow. "Add Claim" (ClaimsList) opens `PolicyVerificationModal` first — Policy Number input + "تحقق من الوثيقة" (loading/error states); only after a successful check does the user see "متابعة تسجيل الحادث", which opens the existing `AddClaimModal`. A failed verification NEVER opens the intake form and never calls `POST /claims`. The verification call goes through the single seam `verifyPolicy(policyNumber)` in `src/api/policy.service.ts`, whose implementation is a clearly-marked development mock (600ms; any number verifies except `00000000` → axios-shaped 404) pending محمد's backend contract — no endpoint/fields were invented. Contract-handoff: `backend-handoffs.md` §6.
- Create claim coordinates (contract confirmed 2026-09-20, **MANDATORY since same day — user ruling**): `POST /claims` accepts **top-level `latitude` and `longitude`** (NOT nested in `incidentCoordinates`). The dashboard **no longer offers "Create Claim" without a valid pair**. The officer picks the INCIDENT LOCATION on a Leaflet map (`PreciseLocationSection`: click-to-place, draggable marker, hidden lat/lng form inputs) — **no `navigator.geolocation`, no "Use My Current Location" button, no geocoding/address search**. `validateCoordinate` rejects empty values ("This field is required"). `toCreateClaimRequest` converts the pair to plain numbers (`latitude: 24.7136` style). Server-side enforcement is a **requested hardening to محمد (§5 handoff — not blocking)**: POST /claims still accepts requests without coordinates today. After creation the backend echoes `incidentCoordinates`; `createClaim` normalizes the response so the map marker renders straight from that echo. Frontend still never computes `distanceKm` — it renders the backend value/order only when present.
- Live probes use `DEMO-INS` org: `CO-001`/`Password123!` works; `AD-001`/`FT-001` current passwords unknown (login 401).
- `POST /users` (Create User): `ADMIN` rejected → 400 `"role" must be one of [CLAIMS_OFFICER, FIELD_ADJUSTER]` (confirmed live 2026-09-13). Create User form intentionally hides ADMIN.
- Duplicate `employeeCode` on `POST /users` → `409` `EMPLOYEE_CODE_TAKEN` "An employee with this code already exists in your organization".
- Hard delete user — **NOT implemented** (verified live 2026-09-19: `DELETE /users/:id`, `POST /users/:id/delete` and `GET /users/:id` all → `404`. `PATCH /users/:id/status` + `reset-password` exist, admin-only (CO → 403)). Decision: no delete in the product — deactivate (soft) only; claimed user references (`assignedTo`/`performedBy`) must never dangle.
- Notifications — backend `404` (2026-09-19): `/notifications/unread-count` endpoint not found; no frontend work until the contract ships.

## Rules of engagement
- Never assume a permission: verify live with both ADMIN and CLAIMS_OFFICER tokens (PowerShell probe pattern — login, then call endpoint; classify 401/400/403/404; read response body).
- UI capability must not exceed what the backend actually allows. When the backend blocks a role (e.g., admin create), either (1) agree a fix with the backend owner, or (2) align the UI.
- Every route/guard change must update this table.