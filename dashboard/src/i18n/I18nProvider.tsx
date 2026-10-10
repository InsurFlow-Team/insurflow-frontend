import { useEffect, useMemo, useState, type ReactNode } from "react";

import { isLocale, translate, type Locale, type MessageKey } from "./index";
import { i18nContext, type I18nContextValue } from "./context";
import { pluralSuffix } from "./plurals";

const STORAGE_KEY = "sawn.locale";

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLocale(stored)) return stored;
    } catch {
      // Storage unavailable (private mode) — fall through to the default.
    }
    return "en";
  });

  const dir: "rtl" | "ltr" = locale === "ar" ? "rtl" : "ltr";

  // The single place `document.dir` is ever written. Components must never
  // set direction themselves; they rely on logical properties (ms/me/ps/pe,
  // text-start/text-end) instead of hard-coded left/right.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Persisting is best-effort; the session still works without it.
    }
  }, [locale, dir]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir,
      setLocale: setLocaleState,
      t: (key, vars) => translate(locale, key, vars),
      tp: (baseKey, n) =>
        translate(
          locale,
          `${baseKey}.${pluralSuffix(locale, n)}` as MessageKey,
          { days: n, n },
        ),
    }),
    [locale, dir],
  );

  return <i18nContext.Provider value={value}>{children}</i18nContext.Provider>;
}
