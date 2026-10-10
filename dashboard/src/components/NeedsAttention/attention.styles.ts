export const ROW_TONES = {
  overdue: {
    row: "border-danger-border bg-danger-bg/50",
    icon: "bg-white text-danger-text border-danger-border",
    chip: "border-danger-border bg-white text-danger-text",
  },
  officer: {
    row: "border-info-border bg-info-bg/50",
    icon: "bg-white text-info-text border-info-border",
    chip: "border-info-border bg-white text-info-text",
  },
  adjuster: {
    row: "border-warning-border bg-warning-bg/60",
    icon: "bg-white text-warning-text border-warning-border",
    chip: "border-warning-border bg-white text-warning-text",
  },
  admin: {
    row: "border-violet-border bg-violet-bg/60",
    icon: "bg-white text-violet-text border-violet-border",
    chip: "border-violet-border bg-white text-violet-text",
  },
} as const;

export type RowToneKey = keyof typeof ROW_TONES;
