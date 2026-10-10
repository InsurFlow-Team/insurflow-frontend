import type { Locale } from "./types";

export type PluralForm = "one" | "two" | "few" | "many" | "other";

/**
 * Arabic plural forms follow the CLDR categories: 1 → one, 2 → two,
 * 3–10 → few, everything else → many. English only needs one/other, but the
 * dictionaries carry all five forms in both languages so the key sets stay in
 * lockstep (en's extra forms are plain duplicates of other).
 */
export function pluralSuffix(locale: Locale, n: number): PluralForm {
  if (locale === "ar") {
    if (n === 1) return "one";
    if (n === 2) return "two";
    if (n >= 3 && n <= 10) return "few";
    return "many";
  }
  return n === 1 ? "one" : "other";
}
