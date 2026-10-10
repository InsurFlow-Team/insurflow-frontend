# i18n Coverage — bilingual (EN/AR) vs legacy

Status of the incremental i18n migration (Gate-1 decision: new/redesigned
components are fully bilingual; legacy screens migrate when they are touched).

Verification after the latest claim-detail localization: full suite (448
passed), production build passed, and ESLint passed for all changed product
files. Full-repository ESLint still reports one existing `no-explicit-any`
error in `src/hooks/usePublicTracking.ts:43` plus five warnings.

## How it works (do not regress)

- `src/i18n/I18nProvider.tsx` is mounted in `App.tsx` and is **the only writer**
  of `document.dir` / `document.lang`. Storage key: `sawn.locale`.
- `useTranslation()` (from `src/i18n/context.ts`) returns
  `{ locale, dir, setLocale, t, tp }`. Without a provider every component falls
  back to **English/LTR** — that is what keeps legacy tests green.
- `t(key, vars)` interpolates `{var}` placeholders. `tp(base, n)` resolves
  `base.one|two|few|many|other` (CLDR: Arabic one/two/few/many/other, English
  one/other) and interpolates `{n}` and `{days}`. `PluralBaseKey` in
  `src/i18n/context.ts` lists every plural base — extend it when you add one.
- EN↔AR key parity is enforced by `src/i18n/index.test.ts` and by the
  `Record<MessageKey, string>` typing of `messages.ar.ts` (a missing key is a
  compile error).
- Styling: Tailwind v4 logical utilities (`start/end`, `ps/pe`, `ms/me`,
  `text-start`, `border-s/e`) and `rtl:` variants (e.g. `rtl:rotate-180` for
  chevrons). Never `left/right`-position new UI.
- Test pattern for AR coverage: `localStorage.setItem("sawn.locale", "ar")` +
  `<I18nProvider>` + `afterEach` resetting `dir="ltr"`, `lang="en"`,
  `localStorage.clear()` (see `Dashboard.test.tsx`, `MapPage.test.tsx`).

## Fully bilingual (EN + AR + RTL)

| Surface | Components | AR test coverage |
| --- | --- | --- |
| App shell | `Sidebar`, `NavItem`, `SidebarUserCard`, `Header`, `DashboardLayout`, `LanguageSwitcher` | — (EN parity via `Header.test`, key parity via `index.test`) |
| Overview / Dashboard | `Dashboard`, `OverviewMetrics`, `NeedsAttentionSection` + `AttentionRow*`, `RecentClaimsTable`, `TeamCapacityCard` | `Dashboard.test.tsx` (Arabic/RTL) |
| Claims page | `ClaimsList`, `ClaimsPageHeader`, `ClaimsFilters`, `claimsColumns` (row actions), `ClaimDetailHeader` export menu | `ClaimsList.test.tsx` (Arabic) |
| Claim details (redesigned) | `ClaimDetails` (loading/error/toasts/decision banner/dialogs), `ClaimStageTimeline`, `NextActionPanel`, `ClaimDetailHeader` | `ClaimDetails.test.tsx` (Arabic/RTL) |
| Claim details (information sections) | `AssignmentSection`, `AccidentSection`, `ClaimReadinessSection`, `CoverageSnapshotSection`, `EvidenceSection`, `IncidentLocationSection`, `InspectionLocationSection`, `SignatureSection`, `TrackingInfoSection` | `ClaimDetails.test.tsx` (Arabic/RTL) |
| Map / dispatch | `MapPage`, `ClaimsQueuePanel`, `SelectedClaimHeader`, `DispatchPanel`, `AdjustersList`, `AssignClaimModal` (title), `AdjusterSelectField` | `MapPage.test.tsx` (Arabic/RTL) |
| Shared UI defaults | `EmptyState`, `ErrorState`, `StatusBadge` (`label` prop), `DataTable` (empty default) | EN defaults pinned by existing tests |

Key namespaces: `claimStatus.* claimStage.* assignmentStage.* action.* nav.*
sla.* slaState.* attention.* metric.* overview.* claims.* claim.* claimInfo.*
capacity.* assign.* owner.* map.* toast.* common.* lang.*`.

## Legacy — English-only (not yet migrated)

These render English regardless of locale. They were **not** part of the
redesign scope; migrate when touched:

- **Stats strips**: `ClaimStatsGrid` + `claimsStats` config (Claims page),
  `UserStats`, `AdjustersStats`.
- **Users / Settings**: `Users`, `UserFilterBar`, `usersColumns`,
  `CreateUserModal`, `EditUserForm`, `ResetPasswordModal`, `ChangePasswordCard`.
- **Adjusters**: `AdjustersDirectory`, `AdjustersFilterBar`, `adjustersColumns`,
  `WorkHistorySection`, `ActiveTasksCell`.
- **Notifications**: `NotificationBell` (dropdown, "Clear All", "No
  notifications yet").
- **Header menus**: `UserMenu` ("Profile", "Sign Out", "Role:", "Org:") — EN
  pins in `Header.test.tsx`.
- **Claim details bodies** (remaining legacy sections under
  `components/claim-details/sections/`): `ClaimTimeline` (title, "Status:",
  "Performed by:", empty state), `CurrentStepBanner`,
  `PendingAcceptanceBanner`. `DecisionSection` action labels and
  `ClaimReadinessSection` are now translated.
- **Public tracking**: `TrackClaim`, `PublicTimeline`, `usePublicTracking`.
- **Landing**: `Landing` (see `docs/landing-page/content-ar.md` for the
  landing's own bilingual plan). `Login` is bilingual.

## Legacy — Arabic-only strings

Remaining hard-coded Arabic on legacy surfaces (migrate when those surfaces are
touched):

- `DecisionSection` (empty text), `PublicTimeline`,
- `PreciseLocationSection`, `VerifiedPolicyResult` (coverage note).

## Backend-provided strings (never translated client-side)

- Timeline event `action` / `details` labels, error `message`s from the API,
  adjuster/customer names, role codes (`CLAIMS_OFFICER` → display via
  `userRole.replace(/_/g, " ")`). The backend currently emits English; a
  translation layer would require backend contract changes (out of scope per
  the brief: no backend redesign).

## Known gaps / next steps

1. `ClaimStatsGrid` / `UserStats` / `AdjustersStats` labels (see above).
2. Remaining claim-details legacy sections: `ClaimTimeline`,
   `CurrentStepBanner`, and `PendingAcceptanceBanner` still contain English
   labels; `DecisionSection` and the public tracking/form components still
   contain Arabic-only strings.
3. `UserMenu` + `NotificationBell` dropdown strings.
4. The mobile sidebar drawer opens from the **physical left** in both locales
   (`fixed left-0 -translate-x-full`); an RTL drawer should enter from the
   right. Needs a design decision before changing (nav labels, borders, and the
   active indicator are already RTL-correct via logical properties).
5. `map.title` is reused as the sidebar/page-title label for "Map Dispatch" —
   fine today; split only if the wording diverges.
