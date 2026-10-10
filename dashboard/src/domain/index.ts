/**
 * Domain layer — backend-neutral product concepts derived from real backend
 * data. Pure functions and constants only: nothing here calls the API or
 * renders UI.
 *
 * - claimLifecycle   backend ClaimStatus ⇄ product lifecycle stage (+ verified transitions)
 * - assignmentLifecycle  assignment state inferred from claim signals (there is no assignment entity)
 * - sla              SLA display structure (one live rule, four pending shape-only rules)
 * - roles            role capability checks matching verified permissions
 * - actions          claim action catalogue (web / mobile-only / not-in-backend)
 *
 * Nothing in here changes what the backend allows — it is the single place
 * the UI should ask "what does this status/role mean?".
 * See docs/ARCHITECTURE-PRODUCT.md.
 */
export * from "./claimLifecycle";
export * from "./assignmentLifecycle";
export * from "./sla";
export * from "./roles";
export * from "./actions";
