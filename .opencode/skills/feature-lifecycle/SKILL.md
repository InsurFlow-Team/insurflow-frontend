---
name: feature-lifecycle
description: Masar claims-management end-to-end feature cycle. Use when implementing or planning any feature (claims, users, adjuster assignment/capacity, settings), when integrating with the backend, when writing a backend request for محمد (backend owner), or when asked to "implement", "add", "build", "fix" a feature. Enforces: agree-first, live contract verification, backend handoff with acceptance criteria, green-bar completion (vitest + build + lint), and RBAC skill updates.
---

# Feature Lifecycle (Masar MVP)

The single operating procedure for delivering a feature in this project. Read `reference/workflow.md` for the step-by-step and `reference/rules.md` for the non-negotiables.

## The 6 gates (do not skip, do not reorder)

1. **Agree → Code** — before any implementation of a design decision, ask ONE question with a recommendation (`/grill-me` style). No code before agreement.
2. **Verify contract LIVE** — never assume the backend: probe each endpoint with ADMIN and CLAIMS_OFFICER tokens, classify `401/400/403/404`, read the real error body, and produce an evidence table.
3. **Handoff to محمد** — if the backend is missing or blocks the design (e.g., admin rejected on `POST /claims`), write a ready-to-send message with endpoints, payloads, and a "معيار تم" acceptance list. **STOP. Do not build the frontend until the backend reports "تم".** Persist the full spec in `.opencode/handoffs/backend-handoffs.md` (index + ready-to-paste Arabic per feature).
4. **Implement** — frontend-only after confirmation, following existing conventions (service + hook + page/modal + types; optimistic updates; `getApiErrorMessage`).
5. **Green bar** — run `npx vitest run` (all green; current baseline 78), then `npm run build` (`tsc -b && vite build`), then `npm run lint`. Fix every failure; never claim completion without running all three.
6. **Update knowledge** — if permissions changed, update the `masar-rbac` skill matrix; record new rulings there, not only in chat.

## Project facts (keep consistent)
- Frontend lives under `dashboard/`; backend is a separate system owned by محمد (Render: `https://insurflow-backend.onrender.com/api/v1`).
- Test runner: vitest (no `npm test` script) — use `npx vitest run`. Component tests carry `// @vitest-environment jsdom`.
- Service layer uses a shared `apiClient` (axios) in `src/api/client.ts`; error codes surfaced via `getApiErrorMessage`.
- Never delete files "because they look dead" without the user's explicit confirmation (multiple files are intentionally kept pending backend support).