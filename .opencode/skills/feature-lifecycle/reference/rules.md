# Rules — hard constraints (non-negotiables)

These exist because each one was learned from a real failure in this project.

## Contract & backend
1. **Never assume an endpoint exists, its payload, or who can call it.** Live-probe it first. A missing endpoint returns `404 Endpoint Not Found` on the render backend — verify instead of trusting the frontend code.
2. **`401` ≠ wrong password only** — it can also mean the account password was changed (e.g., admin changed their own password via the Settings card). Login failures must be reported, not silently retried.
3. **Classify every probe by status + role**: `400` = authz passed but input invalid; `403` = role blocked; `404` = route/endpoint or target missing; `401` = token/password. Build an evidence table (role × status) — it is the deliverable.
4. **UI capability must never exceed what the backend actually allows.** When the backend blocks a role, choose either (1) an agreed backend fix with محمد, or (2) aligning the UI. Never patch around it with a client-side fake.
5. **No frontend implementation before backend confirmation.** A feature whose contract is unverified or blocked is written up as a محمد handoff and put on hold until "تم".

## Delivery
6. **Green bar is mandatory and explicit**: `npx vitest run` → `npm run build` → `npm run lint`. Passing tests alone do not count (TS errors in `tsc -b` and ESLint failures break the bar too). Use the exact strings above — `npm run test` does not exist in this repo.
7. **Tests live next to the code they cover** (`*.test.ts` / `*.test.tsx`); component tests annotate `// @vitest-environment jsdom`; mock API modules with `vi.mock`; extend adjacent existing test files where the pattern exists.
8. **Never claim done, or that a probe "passed", without the printed evidence.** If a response stream could not be read, say so.
9. **Never delete files as "dead code" without the user's explicit go-ahead** — several files are deliberately kept (e.g., `usersColumns.tsx`, `UserStats.tsx`, `UserFilterBar.tsx`, `api/__mocks__/users.mock.ts`) until the backend supports Edit/Delete.

## Human flow
10. **One consensus question before a design decision is implemented** (grill-me rule). If the user says "نريد نتفق" or "لا أريد التنفيذ الآن", do not implement — prepare the agreement/spec instead.
11. **Backend handoffs are complete messages**, not fragments: context, endpoints, payloads, "معيار تم", and follow the template in `workflow.md` §3.
12. **Every RBAC/route/permission change updates the `masar-rbac` skill matrix** in the same task.
13. **Report honestly what is blocked or uncommitted** (e.g., "waiting on محمد", "local changes not pushed, Vercel still old"). Do not mix intent with reality.