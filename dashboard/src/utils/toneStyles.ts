/**
 * The one place a non-brand colour is chosen.
 *
 * A "tone" is a semantic colour family, not a hue. Components ask for
 * `toneClass("success", "bg")`, never for `bg-emerald-50`. That way a
 * rebrand is a change to `index.css` and this file, not to 36 components.
 *
 * Every tone exposes the same five parts:
 *   bg     – the tinted surface
 *   border – the outline sitting on that surface
 *   text   – an icon or label that must stay readable on `bg`
 *   solid  – a filled mark (dot, bar) with no text on it
 *   icon   – a saturated text colour for a glyph sitting on plain white
 */
export type Tone = "success" | "warning" | "danger" | "info" | "rose" | "violet" | "neutral";

export type TonePart = "bg" | "border" | "text" | "solid" | "icon";

export const toneStyles: Record<Tone, Record<TonePart, string>> = {
  success: {
    bg: "bg-success-bg",
    border: "border-success-border",
    text: "text-success-text",
    solid: "bg-success-strong",
    icon: "text-success-strong",
  },
  warning: {
    bg: "bg-warning-bg",
    border: "border-warning-border",
    text: "text-warning-text",
    solid: "bg-warning-muted",
    icon: "text-warning",
  },
  danger: {
    bg: "bg-danger-bg",
    border: "border-danger-border",
    text: "text-danger-text",
    solid: "bg-danger",
    icon: "text-danger",
  },
  info: {
    bg: "bg-info-bg",
    border: "border-info-border",
    text: "text-info-text",
    solid: "bg-info-muted",
    icon: "text-info",
  },
  rose: {
    bg: "bg-rose-bg",
    border: "border-rose-border",
    text: "text-rose-text",
    solid: "bg-rose-strong",
    icon: "text-rose-strong",
  },
  violet: {
    bg: "bg-violet-bg",
    border: "border-violet-border",
    text: "text-violet-text",
    solid: "bg-admin",
    icon: "text-admin",
  },
  neutral: {
    bg: "bg-surface-sunken",
    border: "border-border",
    text: "text-text-muted",
    solid: "bg-text-subtle",
    icon: "text-text-muted",
  },
};

/** `toneClass("success", "bg")` -> `"bg-success-bg"` */
export function toneClass(tone: Tone, part: TonePart = "bg"): string {
  return toneStyles[tone][part];
}

/** `toneClasses("info")` -> `"bg-info-bg border-info-border text-info-text"` */
export function toneClasses(tone: Tone): string {
  const t = toneStyles[tone];
  return `${t.bg} ${t.border} ${t.text}`;
}
