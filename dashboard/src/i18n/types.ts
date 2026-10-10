export const LOCALES = ["en", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * Phase 1 ships the structure and the keys only: no component reads the
 * dictionary and `document.dir` is never touched, so the dashboard keeps
 * rendering exactly as it does today. Migration + RTL are Phase 2/3 — see
 * docs/ARCHITECTURE-PRODUCT.md §13.
 *
 * Recommended default once the UI is migrated: "ar" (Arabic-first product).
 */
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
