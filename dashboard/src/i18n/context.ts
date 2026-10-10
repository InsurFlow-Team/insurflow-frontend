import { createContext, useContext } from "react";

import {
  DEFAULT_LOCALE,
  translate,
  type Locale,
  type MessageKey,
  type TranslateVars,
} from "./index";
import { pluralSuffix } from "./plurals";

/**
 * Bases whose plural forms (`<base>.one|two|few|many|other`) exist in both
 * dictionaries. `tp` resolves `<base>.<pluralSuffix(n)>` and interpolates
 * `{n}` (and `{days}`, kept for the sla.* templates).
 */
export type PluralBaseKey =
  | "sla.remaining"
  | "sla.overdue"
  | "overview.recent.ageDays"
  | "capacity.spare"
  | "capacity.adjusters"
  | "capacity.over"
  | "capacity.claimN"
  | "capacity.slotN";

export interface I18nContextValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
  /** Plain key lookup. */
  t: (key: MessageKey, vars?: TranslateVars) => string;
  /**
   * Pluralised lookup: `tp("sla.remaining", 2)` resolves `sla.remaining.two`
   * (Arabic) / `sla.remaining.other` (English) and passes `{ days: 2, n: 2 }`
   * for interpolation.
   */
  tp: (baseKey: PluralBaseKey, n: number) => string;
}

/**
 * English/LTR fallback so any component works without a provider — critical
 * for incremental migration: legacy tests and screens keep rendering while
 * new screens opt into the provider at the app root.
 */
const fallbackValue: I18nContextValue = {
  locale: DEFAULT_LOCALE,
  dir: "ltr",
  setLocale: () => {},
  t: (key, vars) => translate(DEFAULT_LOCALE, key, vars),
  tp: (baseKey, n) =>
    translate(
      DEFAULT_LOCALE,
      `${baseKey}.${pluralSuffix(DEFAULT_LOCALE, n)}` as MessageKey,
      { days: n, n },
    ),
};

const I18nContext = createContext<I18nContextValue>(fallbackValue);

export const i18nContext = I18nContext;

/** Safe outside a provider (English fallback). */
export function useTranslation(): I18nContextValue {
  return useContext(I18nContext);
}
