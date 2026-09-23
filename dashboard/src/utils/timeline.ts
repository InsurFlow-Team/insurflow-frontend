const DETAIL_KEYS = [
  "notes",
  "reason",
  "details",
  "message",
  "description",
  "outcome",
  "result",
] as const;

const DETAIL_LABELS: Record<(typeof DETAIL_KEYS)[number], string> = {
  notes: "Notes",
  reason: "Reason",
  details: "Details",
  message: "Message",
  description: "Description",
  outcome: "Outcome",
  result: "Result",
};

const DECLINE_HINTS: Array<RegExp> = [
  /\bdeclin(?:e|ed|ing)?\b/i,
  /\breject(?:ed|s)?\b/i,
  /\brefus(?:e|ed|es|al)?\b/i,
  /\bnot accepted\b/i,
  /رفض|مرفوض|تم الرفض/i,
];

export interface TimelineDetail {
  label: string;
  value: string;
}

export interface TimelineEventView {
  action: string;
  isDecline: boolean;
  details: Array<TimelineDetail>;
}

function textValue(event: Record<string, unknown>, key: string): string {
  const value = event[key];
  return typeof value === "string" ? value.trim() : "";
}

function describeEvent(event: Record<string, unknown>): string {
  const descriptiveKeys = ["action", ...DETAIL_KEYS, "eventType"];
  return descriptiveKeys
    .map((key) => textValue(event, key))
    .filter((value) => value !== "")
    .join(" ");
}

export function getTimelineEventView(event: object): TimelineEventView {
  const source = event as Record<string, unknown>;
  const action = textValue(source, "action") || "Unknown action";

  const details = DETAIL_KEYS.filter((key) => textValue(source, key) !== "").map(
    (key) => ({
      label: DETAIL_LABELS[key],
      value: textValue(source, key),
    }),
  );

  const isDecline = DECLINE_HINTS.some((hint) =>
    hint.test(describeEvent(source)),
  );

  return { action, isDecline, details };
}