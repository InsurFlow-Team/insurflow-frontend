/**
 * SLA display structure.
 *
 * Only ONE rule is live: claim staleness (3 days since creation), which is
 * exactly the rule the dashboard has always used — now sourced from here so
 * there is a single place to read it from (utils/attention.ts).
 *
 * The four product SLA rules are declared as PENDING shape only:
 *   - `enabled: false`, `durationDays: null`
 *   - no deadline exists in the backend (no acceptance/inspection/decision
 *     SLA endpoint, no per-claim deadline field)
 *   - nothing in the UI may read them to render a breach — that would be
 *     fake SLA behaviour, which this phase explicitly forbids.
 *
 * When the backend ships SLA config, the pending rules become configured
 * rules (source: "backend") and the display layer gains a real input.
 *
 * See docs/ARCHITECTURE-PRODUCT.md §8.
 */

export type SlaRuleKey =
  | "claimStale"
  | "adjusterAcceptance"
  | "inspectionCompletion"
  | "reportSubmission"
  | "decision";

interface SlaRuleBase {
  readonly key: SlaRuleKey;
  /** i18n key — see src/i18n. */
  readonly labelKey: string;
  /** Human description of what the rule measures (English, developer-facing). */
  readonly measures: string;
}

export interface ConfiguredSlaRule extends SlaRuleBase {
  readonly source: "frontend-display";
  readonly enabled: true;
  readonly durationDays: number;
}

export interface PendingSlaRule extends SlaRuleBase {
  readonly source: "backend-pending";
  readonly enabled: false;
  readonly durationDays: null;
}

export type SlaRule = ConfiguredSlaRule | PendingSlaRule;

export interface SlaRuleMap {
  readonly claimStale: ConfiguredSlaRule;
  readonly adjusterAcceptance: PendingSlaRule;
  readonly inspectionCompletion: PendingSlaRule;
  readonly reportSubmission: PendingSlaRule;
  readonly decision: PendingSlaRule;
}

export const SLA_RULES: SlaRuleMap = {
  claimStale: {
    key: "claimStale",
    labelKey: "sla.claimStale",
    measures: "Whole days since the claim was created",
    source: "frontend-display",
    enabled: true,
    durationDays: 3,
  },
  adjusterAcceptance: {
    key: "adjusterAcceptance",
    labelKey: "sla.adjusterAcceptance",
    measures: "Time from assignment offer to adjuster acceptance",
    source: "backend-pending",
    enabled: false,
    durationDays: null,
  },
  inspectionCompletion: {
    key: "inspectionCompletion",
    labelKey: "sla.inspectionCompletion",
    measures: "Time from acceptance to inspection submission",
    source: "backend-pending",
    enabled: false,
    durationDays: null,
  },
  reportSubmission: {
    key: "reportSubmission",
    labelKey: "sla.reportSubmission",
    measures: "Time from inspection submission to report submission",
    source: "backend-pending",
    enabled: false,
    durationDays: null,
  },
  decision: {
    key: "decision",
    labelKey: "sla.decision",
    measures: "Time from review start to final decision",
    source: "backend-pending",
    enabled: false,
    durationDays: null,
  },
};

export const SLA_RULE_KEYS = Object.keys(SLA_RULES) as SlaRuleKey[];

export function slaRule(key: SlaRuleKey): SlaRule {
  return SLA_RULES[key];
}

export function isSlaConfigured(key: SlaRuleKey): boolean {
  return SLA_RULES[key].enabled;
}

export type SlaState = "ok" | "breached" | "unknown";

/**
 * Display-only evaluation.
 *
 * - rule not enabled → "unknown" (never claim a breach we cannot measure)
 * - rule enabled     → "ok" until the measured age reaches the threshold
 */
export function slaStateFor(key: SlaRuleKey, ageDays: number): SlaState {
  const rule = SLA_RULES[key];
  if (!rule.enabled) return "unknown";
  if (!Number.isFinite(ageDays)) return "unknown";
  return ageDays >= rule.durationDays ? "breached" : "ok";
}

/** Days to wait before the staleness badge fires. Single live SLA input. */
export function claimStaleThresholdDays(): number {
  return SLA_RULES.claimStale.durationDays;
}
