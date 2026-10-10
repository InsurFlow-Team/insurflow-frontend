# SAWN — Product Architecture Report (Phase 1)

**Date:** 2026-10-03 · **Scope:** frontend only (`dashboard/`) · **Status:** report + non-destructive architecture layer

**Evidence base**

- Code audit of `dashboard/src` (routes, pages, types, services, guards).
- Live backend probe (2026-10-03, `CO-001` / org `DEMO-INS`), read-only: `POST /auth/login`, `GET /claims`, `GET /claims/:id`, `GET /claims?status=<invalid>` (validation error returned the authoritative status enum), `GET /notifications`, `GET /notifications/unread-count`.
- Transition evidence taken from real claim timelines (no invented states).
- Verified permission history recorded in `.opencode/skills/masar-rbac/SKILL.md`.

**Rules honoured in this phase:** no visual redesign, no backend/API/permission changes, no auth changes, no route removal, no fake SLA or workflow data, no feature deletion. Where the proposed product workflow conflicts with the backend, the mismatch is documented (§6–§8, §14) and the current implementation is kept intact.

---

## 1. Current architecture

```
dashboard/src/
├── App.tsx                 route table + RoleGuard nesting
├── api/                    axios service layer (apiClient + getApiErrorMessage)
│   ├── claims.read|create|assign|decision|review|report|transform
│   ├── users.service, policy.service, auth.service, notifications,
│   │   publicTracking, adjusterHistory
│   └── client.ts           token header, error normalisation, mock adapter
├── routes/                 ProtectedRoute, RoleGuard
├── layouts/                DashboardLayout (sidebar+header shell), Sidebar, Header
│   └── sidebar/navigation.tsx   nav config + per-item roles
├── pages/                  route components (Dashboard, ClaimsList, ClaimDetails,
│   │                       AdjustersDirectory/Details, MapPage, Users, Settings,
│   │                       Profile, Login, LandingPage, TrackClaim, Unauthorized)
│   └── map/                map child components
├── components/             feature groups: claims/, claim-details/ (+sections/),
│                           dashboard/, adjusters/, notifications/, ui/, landing/
├── hooks/                  useDashboardStats, useMapData, useFieldAdjusters,
│                           useClaimIntake, useNotifications, …
├── contexts/               AuthContext, ToastContext
├── utils/                  statusStyles, attention, claimActions, claims, map, geo …
├── types/                  core, claims, user, policy, notifications, publicTracking
└── styles/landing.css      landing-only styles
```

Character of the current code:

- **Single backend, single org.** Everything derives from `GET /claims` (org-scoped). There is **no** `/claims/stats` endpoint — dashboard numbers are computed client-side (`src/hooks/useDashboardStats.ts:6`).
- **No dedicated assignment resource.** Assignment lives *inside* the claim (`claim.assignment`, `claim.assignedTo`) plus timeline events. There is no `GET /assignments`.
- **Status is the workflow.** Claim status is the only machine-readable workflow signal the web app has.
- **Original gap (since addressed):** lifecycle meaning, role rules, action eligibility and SLA display were spread across `utils/`, page components and inline role checks. `src/domain/` now centralizes the lifecycle/action metadata without re-homing the existing API or page layers; not all page checks have been migrated.

## 2. Current roles

`Role = "ADMIN" | "CLAIMS_OFFICER" | "FIELD_ADJUSTER"` (`src/types/core.ts:3`).

| Role | Web dashboard access | Verified capability (frontend intent = backend reality) |
|---|---|---|
| `ADMIN` | yes | Everything read; create claim; assign adjuster; **final decision** (`POST /claims/:id/decision`, `UNDER_REVIEW → APPROVED/REJECTED`); users + settings (`PATCH /users/:id/status`, `reset-password`); export report |
| `CLAIMS_OFFICER` | yes | Everything read; create claim; assign adjuster; **Start Review** (`POST /claims/:id/review/start`); export report. **Cannot** approve/reject (ADMIN only) |
| `FIELD_ADJUSTER` | **blocked** | `Login.tsx:49` and `AuthContext.tsx:53` refuse the role; adjuster actions (`accept-assignment`, `decline-assignment`, `inspection/start`, `inspection/submit`) are adjuster-only on the backend and are **not called anywhere in the web app** |

Route enforcement: `App.tsx:36` `RoleGuard ["ADMIN","CLAIMS_OFFICER"]` for `/dashboard`, `/claims`, `/claims/:claimId`, `/adjusters`, `/adjusters/:adjusterId`, `/map`, `/profile`; `App.tsx:56` `RoleGuard ["ADMIN"]` for `/settings`, `/settings/users`.

**Consequence for the product spec:** the "Field Adjuster" navigation column (Overview / My Assignments / Map / My Reports) has **no surface to render on today** — the role is deliberately excluded from this web app and is served by the mobile app.

## 3. Current routes

| Route | Component | Guard | Notes |
|---|---|---|---|
| `/` | LandingPage | public | marketing page |
| `/login` | Login | public | `FIELD_ADJUSTER` → refused |
| `/dashboard` | Dashboard | ADMIN+CO | Overview |
| `/claims` | ClaimsList | ADMIN+CO | accepts `?status=<STATUS>` deep link |
| `/claims/:claimId` | ClaimDetails | ADMIN+CO | central operational page |
| `/adjusters` | AdjustersDirectory | ADMIN+CO | roster + capacity |
| `/adjusters/:adjusterId` | AdjusterDetails | ADMIN+CO | work history |
| `/map` | MapPage (lazy) | ADMIN+CO | `?claim=<id>` deep link (consumed once) |
| `/profile` | Profile | ADMIN+CO | password change |
| `/settings` | Settings | ADMIN | shell |
| `/settings/users` | Users | ADMIN | user management |
| `/users` | → redirect `/settings/users` | ADMIN | |
| `/unauthorized` | Unauthorized | any signed-in | Access Denied |
| `*` | → redirect `/login` | — | |

**Not routed:** `src/pages/TrackClaim.tsx` (public claim tracking) has **no route** in `App.tsx` and is unreachable (backend `GET /public/claims/track/:token` exists). `PHASE-4-PUBLIC-TRACKING.md` describes the feature; the page is dormant — **not deleted**, documented in §14.

**Not present (spec asks for them):** `/assignments`, `/reports` — no pages, no endpoints.

## 4. Current claim states

Backend enum — authoritative, from a live `GET /claims?status=BOGUS` validation error on 2026-10-03:

```
NEW, PENDING_ACCEPTANCE, ASSIGNED, IN_PROGRESS, SUBMITTED,
UNDER_REVIEW, CORRECTION_REQUIRED, APPROVED, REJECTED, CLOSED
```

Frontend `ClaimStatus` (`src/types/core.ts:7`) is an **exact match** — no drift.

Observed distribution (16 live claims, 2026-10-03): NEW 8 · PENDING_ACCEPTANCE 2 · IN_PROGRESS 2 · SUBMITTED 2 · APPROVED 1 · REJECTED 1.

**Verified transitions** (read from real timelines):

| Timeline action | Transition |
|---|---|
| Claim Created | `→ NEW` |
| Assignment Pending Acceptance | `NEW → PENDING_ACCEPTANCE` |
| Assignment Accepted | `PENDING_ACCEPTANCE → ASSIGNED` |
| Assignment Declined | `PENDING_ACCEPTANCE → NEW` |
| Inspection Started | `ASSIGNED → IN_PROGRESS` |
| Inspection Submitted | `IN_PROGRESS → SUBMITTED` |
| Review Started | `SUBMITTED → UNDER_REVIEW` |
| Claim Approved / Rejected | `UNDER_REVIEW → APPROVED` / `→ REJECTED` |

Not observed live but backend-valid: `CORRECTION_REQUIRED` (exists in enum + notification type; no web writer), `CLOSED` (enum + `closedBy/closedAt/closingNotes` fields; **no web writer and no close endpoint observed**).

Presentation metadata lives in `utils/statusStyles.ts` (label+tone, single source for badges and stat cards) and `utils/claims.ts getStatusDescription()` (Arabic "what/why" copy per status).

## 5. Current assignment states

There is **no assignment entity or status field** on the backend. Assignment state is *inferred* from claim status + `claim.assignment` (present when `assignedTo` is set) + `claim.lastDecline`:

| Inferred state | Source signal |
|---|---|
| Not assigned | `status === "NEW"` and no `assignedTo` |
| Waiting for adjuster acceptance | `status === "PENDING_ACCEPTANCE"` |
| Declined (needs re-dispatch) | `status === "NEW"` **and** `claim.lastDecline` set (UI badge "Re-dispatch Needed", `claimsColumns.tsx:57`) |
| Accepted | `status === "ASSIGNED"` |
| Inspection in progress | `status === "IN_PROGRESS"` |
| Report submitted (work done) | `status === "SUBMITTED"` → onward to review/decision |
| Completed | `APPROVED` / `REJECTED` / `CLOSED` |

Capacity/availability signals come from `GET /users/adjusters`: `availability`, `activeTasksCount`, `capacityLimit` (live value 3), `distanceKm` when `?claimId=` is passed.

**Gap:** `PENDING_ACCEPTANCE` has no acceptance deadline anywhere — "assignment overdue" cannot be computed today (§8).

## 6. Proposed claim lifecycle → current backend mapping

The proposed canonical lifecycle, mapped to what the backend actually implements. **No backend status was renamed.** Proposed stages with no backend support are marked `— (not in backend)` and are *not* implemented.

| Proposed stage | Backend status | Notes |
|---|---|---|
| NEW | `— (not in backend)` | Backend creation is immediate: `POST /claims` → `NEW` |
| UNDER REVIEW (intake) | `— (not in backend)` | No pre-assignment review step exists |
| **READY FOR ASSIGNMENT** | `NEW` | Backend `NEW` *is* "ready for assignment" |
| **ASSIGNED** (awaiting acceptance) | `PENDING_ACCEPTANCE` | Naming collision hazard — see below |
| **ACCEPTED** | `ASSIGNED` | ⚠ backend `ASSIGNED` means *accepted*, not *pending* |
| INSPECTION IN PROGRESS | `IN_PROGRESS` | |
| REPORT SUBMITTED | `SUBMITTED` | |
| UNDER DECISION | `UNDER_REVIEW` | Reached only via `POST /claims/:id/review/start` |
| APPROVED / REJECTED | `APPROVED` / `REJECTED` | ADMIN decision only |
| CLOSED | `CLOSED` | Enum exists; no writer observed |
| ON HOLD | `— (not in backend)` | exception state — **not implemented** |
| CANCELLED | `— (not in backend)` | exception state — **not implemented** |
| *(correction loop)* | `CORRECTION_REQUIRED` | Backend reality missing from the proposed list; keeps its own stage |

⚠ **The single most dangerous naming trap:** proposed `ASSIGNED` = backend `PENDING_ACCEPTANCE`, proposed `ACCEPTED` = backend `ASSIGNED`. Any UI that reads "Assigned" from the raw enum will tell the officer the opposite of the truth. This is exactly what `domain/claimLifecycle.ts` now mediates: **one** mapping `ClaimStatus → stage`, exhaustive over all 10 statuses, so no component has to remember the swap.

## 7. Proposed assignment lifecycle → current implementation

| Proposed assignment state | Realised? | Backend signal |
|---|---|---|
| Assignment Created | yes | `POST /claims/:id/assign` → `PENDING_ACCEPTANCE` |
| Waiting for Adjuster Acceptance | yes | `status === "PENDING_ACCEPTANCE"` |
| Accepted | yes | `status === "ASSIGNED"` |
| Inspection Scheduled / In Progress | partially | `status === "IN_PROGRESS"` (no separate "scheduled" state) |
| Completed | yes | `SUBMITTED` and beyond |
| → Declined (exception) | yes | `PENDING_ACCEPTANCE → NEW`, surfaced via `claim.lastDecline` |
| → Acceptance SLA exceeded → OVERDUE → reminder/escalation/reassignment | **no** | No acceptance timestamp deadline, no reminder/escalation endpoint. Frontend can only see `assignment.assignedAt`. **Blocked on backend SLA config** (§8, §14) |

`domain/assignmentLifecycle.ts` encodes the realised half only; the SLA branch is documented as pending, not simulated.

## 8. SLA model

**Today:** exactly one hard-coded rule — `STALE_AFTER_DAYS = 3` in `src/utils/attention.ts:72`, applied to *claim age since creation* (used by Needs-Attention "Overdue" and the Recent Claims Age column). No other SLA exists; no backend SLA config endpoint exists.

**Proposed model (frontend-ready, display-only until the backend ships config):**

| SLA rule | Applied to | Status today |
|---|---|---|
| Adjuster acceptance SLA | `PENDING_ACCEPTANCE` since `assignment.assignedAt` | **not configurable, not computed** — needs backend deadline |
| Inspection completion SLA | `ASSIGNED`/`IN_PROGRESS` since transition | **not computed** — needs backend transition timestamps exposed per claim (timeline has them, but no authoritative deadline) |
| Report submission SLA | `IN_PROGRESS` → `SUBMITTED` | **not computed** |
| Decision SLA | `UNDER_REVIEW` since `review/start` | **not computed** |
| Claim staleness (existing) | claim age since `createdAt` | **live**, 3 days, frontend display rule |

`domain/sla.ts` now provides one typed structure (`SLA_RULES`) where each rule carries `source: "frontend-display" | "backend-pending"` and `enabled`. Only the existing staleness rule is `enabled`; the rest ship as **shape, not behaviour** — nothing in the UI reads them to render a breach, so no fake SLA is shown. When the backend exposes deadlines, the values become config and the display code gains a real input.

**No arbitrary durations are invented** for the four pending rules.

## 9. Role-based navigation

**Approved target IA** vs **what can be rendered today** (routes must exist to be linked):

| Role | Target item | Live? | Route today |
|---|---|---|---|
| Claims Officer | Overview | ✅ | `/dashboard` |
| | Claims | ✅ | `/claims` |
| | Assignments | ❌ | no page, no `GET /assignments` |
| | Field Adjusters | ✅ | `/adjusters` |
| | Map | ✅ | `/map` |
| | Reports | ❌ | no page, no reporting endpoint |
| Field Adjuster | Overview / My Assignments / Map / My Reports | ❌ | role blocked from the web app entirely (§2) |
| Admin | Overview, Claims, Field Adjusters, Map | ✅ | as above |
| | Users | ✅ | `/settings/users` |
| | Settings | ✅ | `/settings` |
| | Reports | ❌ | no page |

**Current sidebar** (`src/layouts/sidebar/navigation.tsx`): Overview, Claims Queue, Field Adjusters, Map Dispatch, Profile → `["ADMIN","CLAIMS_OFFICER"]`; Settings + User Management → `["ADMIN"]`. Labels use the EN/AR dictionaries; the product name remains Arabic (`صَوْن | SAWN`).

**Rule applied:** no nav entry points at an unavailable route. Field Adjuster-specific web destinations, Assignments and Reports remain absent because their web surfaces are not available.

## 10. Overview information hierarchy

**Current** (`pages/Dashboard.tsx`): page header + Refresh → `OverviewMetrics` (six operational, clickable metrics) → `NeedsAttentionSection` (prioritized action rows) → `TeamCapacityCard` → `RecentClaimsTable` (8 rows).

Attention groups (`utils/attention.ts`), each already carrying "who is blocking": Needs Assignment (`NEW`, waiting on *you*) · Awaiting Adjuster Acceptance (`PENDING_ACCEPTANCE`, *adjuster*) · Ready for Review (`SUBMITTED`, *you*) · Awaiting Correction (`CORRECTION_REQUIRED`, *adjuster*) · Awaiting Decision (`UNDER_REVIEW`, *admin*). Empty groups are dropped; oldest claim age drives the Overdue badge.

**Approved priority order** (spec §Overview) mapped onto what exists:

| # | Priority | Backed by | Gap |
|---|---|---|---|
| 1 | Needs Action | attention groups + capacity card | — |
| 2 | Overdue | age > 3 days on group/row | single global threshold, not per-stage SLA |
| 3 | Waiting for Assignment | `NEW` group | — |
| 4 | Waiting for Acceptance | `PENDING_ACCEPTANCE` group | no acceptance deadline |
| 5 | Reports Ready for Review | `SUBMITTED` group | — |
| 6 | Claims Ready for Decision | `UNDER_REVIEW` group | visible to both roles (read-only queue); deciding is ADMIN-only |

The current overview leads with "Needs Action" and "Stale" metrics, then waiting-for-assignment/acceptance, reports ready and decisions, with the prioritized actionable rows immediately below. No vanity metrics are used. Metric links open their corresponding filter or the attention section; the stale metric uses the age-based rule only (§8).

## 11. Claim Details information hierarchy

**Current** (`pages/ClaimDetails.tsx` + `components/claim-details/`):

1. `ClaimDetailHeader` — number, status badge, Start Review (`SUBMITTED`), Export Report (final-decision statuses **and** accident/evidence/signature/inspection-location completeness).
2. Banners — `PendingAcceptanceBanner` (`PENDING_ACCEPTANCE`); decision result banner (ADMIN decision seen by CO); `CurrentStepBanner` (Arabic what/why for the status).
3. `ClaimInfoSections` in order: Claim Overview → Readiness → Coverage Snapshot → Tracking Info → **Assignment** (Assign Field Adjuster button while `NEW`) → Customer + Policy → Vehicle → Accident → Incident Location → Inspection Location → Evidence → Signature → **Decision / Closing** (Approve/Reject while `UNDER_REVIEW` and role ADMIN).
4. `ClaimTimeline` — every transition with actor/role/notes.

**Approved conceptual content** mapped to current reality:

| Conceptual block | Current | Status |
|---|---|---|
| Claim summary | `ClaimOverviewSection` | ✅ |
| Current status | badge + `CurrentStepBanner` | ✅ |
| SLA status | — | ❌ blocked (§8) |
| Claim timeline | `ClaimTimeline` | ✅ |
| Assigned adjuster | `AssignmentSection` | ✅ |
| Assignment status | *implicit in claim status only* | ⚠ no assignment entity (§5) |
| Inspection status | Inspection Location + Evidence + Signature sections | ✅ (derived, no explicit "inspection state" block) |
| Report status | export readiness inside `ClaimReadinessSection` | ✅ |
| Decision status | `DecisionSection` | ✅ |
| **Primary next action** | `NextActionPanel` provides a single stage-aware action/owner summary; detailed controls remain in the existing header/sections | ✅ panel added without changing the underlying permissions or workflow |

Section count is high (16 blocks) — consolidation is a visual/IA change, deferred.

## 12. Map / assignment flow

**Spec issue:** "Assign Adjuster opens a map of all unassigned claims → user loses the claim context."

**Actual current behaviour (already partly fixed):**

- Claims list row **Assign** → `navigate('/map?claim=<id>')` (`ClaimsList.tsx:119`) → `MapPage` selects **that** claim once claims load, clears the param (`MapPage.tsx:62-68`), fits bounds to its coordinates, and loads the **claim-scoped** adjuster dataset (`GET /users/adjusters?claimId=`, pins + dropdown = one fetch). The assign form is *not* auto-opened — the officer reviews nearest adjusters first.
- Claim Details **Assign Field Adjuster** → inline `AssignClaimModal` (no map at all), claim-scoped adjusters.
- Clicking an adjuster pin for a selected `NEW` claim preselects that adjuster in the modal (`MapPage.tsx:121`).
- No pin is ever invented: text-only claims render their reported-location text instead.

**Approved target flow vs current:**

| Step | Target | Current |
|---|---|---|
| Claim → Assign Field Adjuster | ✅ | ✅ (details modal, or list → map deep link) |
| Select adjuster | ✅ | ✅ dropdown, ACTIVE only |
| Optional "View on Map" | ❌ | **missing** — no way to preview the selected adjuster on a map from the claim page |
| Map centred on the claim, relevant adjusters only | ✅ | ✅ (when a claim is selected) |
| Assign selected adjuster | ✅ | ✅ |
| Map never switches to a generic unassigned list | ✅ | ⚠ residual: with **no** selection the map legitimately shows all `NEW` claims + all ACTIVE adjusters (it is the shared dispatch surface). Selection context is preserved once chosen |

**Conclusion:** the context-switch bug is fixed for both entry points; the remaining work is (a) the optional "View on Map" affordance from Claim Details and (b) preventing an *empty-selection* view from being mistaken for "all claims are my context". Both are UI changes → Phase 2.

## 13. Language strategy

**Initial audit result (measured; status below updated after implementation):**

- **76** source files contain Arabic strings (incl. tests).
- **30** non-landing/non-public TSX files contain **both** Arabic and English UI strings in the same file — e.g. `DecisionSection.tsx` (English section title + `Approve/Reject` + Arabic body), `AssignmentSection.tsx` (English labels + Arabic empty state), `ClaimDetails.tsx` (English dialogs + Arabic banners), `MapPage.tsx` (English) with Arabic map pins.
- The original audit found no i18n infrastructure. A custom EN/AR provider and dictionaries have since been added under `src/i18n/`; no third-party i18n dependency is used.
- Mixed patterns: `STATUS_OPTIONS` English (`utils/claims.ts:54`) vs `ACCIDENT_TYPE_LABELS` Arabic (`utils/claims.ts:79`); `statusStyles` English labels vs `getStatusDescription` Arabic copy.
- The provider now owns `document.dir` and `document.lang`; migrated surfaces render RTL for Arabic. The legacy mobile sidebar drawer still uses physical-left positioning.
- `formatDate`/`formatDateTime` hard-code `en-US` locale (`utils/claims.ts:98`).

**Implementation status (EN ↔ AR):**

1. `I18nProvider` is mounted application-wide; `useTranslation()` supplies the locale, direction, translated labels and plurals. Locale is persisted as `sawn.locale`; English is the default.
2. The language switcher and translated navigation are live. Overview, Claims, Map/Dispatch, Claim Details core workflow, and the named claim-information sections have EN/AR dictionaries and RTL support.
3. Legacy gaps remain in stats strips, users/settings, adjusters, notifications, user menus, public tracking and several claim-detail sections. Backend-provided event descriptions and API messages are not translated client-side.
4. `formatDate`/`formatDateTime` still use `en-US`; RTL use of physical-left positioning remains on the mobile sidebar drawer.
5. Rule: new user-facing strings should use the shared dictionaries; extend the matching Arabic and English keys together.

The current default remains **English**; changing the product default to Arabic is a product decision, not part of this QA pass.

## 14. Identified gaps — frontend vs backend

| # | Gap | Impact | Resolution |
|---|---|---|---|
| 1 | Proposed `ASSIGNED`/`ACCEPTED` semantics **invert** backend `PENDING_ACCEPTANCE`/`ASSIGNED` | wrong status text if raw enums are displayed | solved in Phase 1 by `domain/claimLifecycle.ts` mapping |
| 2 | Proposed intake states (`NEW`, pre-assignment `UNDER REVIEW`) do not exist in backend | claims go straight to assignment | documented; needs a backend intake step if product wants one |
| 3 | `ON HOLD` / `CANCELLED` not in backend enum | cannot be offered | not implemented |
| 4 | No `CLOSED` writer / close endpoint observed | claim never reaches `CLOSED` in practice | needs backend endpoint (future phase) |
| 5 | `CORRECTION_REQUIRED` has no web writer (mobile/adjuster path) | CO sees the state, cannot create it | documented; web read-only |
| 6 | No assignment entity → no acceptance deadline | acceptance SLA impossible | needs backend SLA config (`SLA_RULES` pending entries) |
| 7 | No per-stage SLA config endpoint | only the hard-coded 3-day staleness rule | `domain/sla.ts` is display-shaped, source-flagged |
| 8 | No `/assignments`, no `GET /assignments` | "Assignments" nav cannot exist | pending backend resource |
| 9 | No reports/statistics endpoints | "Reports" nav cannot exist; stats derived from `GET /claims` | pending backend reporting API |
| 10 | `GET /claims` accepts only `?status=` (other filters → 400) | search/date/status filtering is client-side over the whole org list | documented; needs query support for scale |
| 11 | `TrackClaim.tsx` has no route | public tracking UI unreachable | kept (no deletion); needs a route decision |
| 12 | `FIELD_ADJUSTER` excluded from web | adjuster nav column has no surface | by design (mobile app); revisit only with a new ruling |
| 13 | `utils/claimActions.ts` said ASSIGN = `CLAIMS_OFFICER` only, while real UI/guards allow `ADMIN`+`CLAIMS_OFFICER` | contradictory sources of truth | **fixed in Phase 1** (aligned to verified behaviour, `ADMIN`+`CLAIMS_OFFICER`) |
| 14 | `Notifications` `unread-count` documented as `404` (2026-09-19) | stale note | **re-verified 2026-10-03: `200 OK`** (both notification endpoints) |
| 15 | `GET /claims` rows now also carry `fieldAdjuster` | extra untyped field (harmless) | noted; no contract change needed |
| 16 | Mixed-language legacy strings remain on unmigrated surfaces | §13 | partial migration completed; remaining surfaces are tracked in `docs/I18N-COVERAGE.md` |

---

## Phase 1 changes implemented (all additive)

| File | Purpose |
|---|---|
| `src/domain/claimLifecycle.ts` | exhaustive `ClaimStatus → proposed stage` mapping, stage metadata, reverse lookups |
| `src/domain/assignmentLifecycle.ts` | claim status + assignment signals → assignment state (realised states only) |
| `src/domain/sla.ts` | `SLA_RULES` display structure with `source`/`enabled` flags; only the existing 3-day rule is enabled |
| `src/domain/roles.ts` | role capability checks matching verified behaviour (single source instead of inline `role === …`) |
| `src/domain/actions.ts` | action catalogue with required status/role and `web` vs `mobile-only` availability |
| `src/navigation/roleNavigation.ts` | approved per-role IA with `live`/`pending` flags; pending items never emitted |
| `src/i18n/` | EN/AR dictionaries, provider, locale switcher and shared translation helpers; integrated into the app shell and migrated screens |
| `src/utils/attention.ts` | `STALE_AFTER_DAYS` now reads `SLA_RULES.claimStale.days` (value unchanged: 3) |
| `src/utils/claimActions.ts` | ASSIGN gate corrected to `ADMIN`+`CLAIMS_OFFICER` (matches guards + live backend) |
| `docs/ARCHITECTURE-PRODUCT.md` | this report |

The initial architecture layer was additive and did not change the API contract, permissions or authentication. Follow-up UX/i18n work has since updated components, pages, layout and styles without changing those backend/auth boundaries.

## Remaining product QA backlog

1. Complete EN/AR migration for the legacy surfaces listed in `docs/I18N-COVERAGE.md`; localize date/number formatting and verify physical-left positioning in the mobile drawer.
2. Consider a visual hierarchy pass on the Overview so actionable work and overdue items stand out before raw status totals (§10).
3. Add a claim-contextual "View on Map" affordance for an adjuster from Claim Details; the current map-from-claims deep link preserves claim context (§12).
4. Backend asks: close/correction endpoints, assignment acceptance deadline + per-stage SLA configuration, `/assignments`, reporting endpoints, `GET /claims` query filters, and a route decision for `TrackClaim`.
5. Field Adjuster web experience is not in scope of the current web application; this role's assignment acceptance and inspection workflow remains in the mobile app (§2).
6. Evaluate the production bundle warning (main JS chunk ~798 kB minified) and further split modules if performance measurements justify it.
