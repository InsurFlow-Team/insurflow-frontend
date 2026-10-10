import { ar } from "./messages.ar";
import { en, type MessageKey } from "./messages.en";
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "./types";

export { en, ar };
export { DEFAULT_LOCALE, isLocale, LOCALES };
export type { Locale, MessageKey };

export const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  en,
  ar,
};

export type TranslateVars = Record<string, string | number>;

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;

  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}

/**
 * Locale-aware lookup. Falls back to the default locale (then to the key
 * itself) rather than rendering an empty string — a visible key beats a
 * blank screen when a translation is missing.
 */
export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: TranslateVars,
): string {
  const messages = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
  const template = messages[key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key;
  return interpolate(template, vars);
}

export function createTranslator(locale: Locale) {
  return (key: MessageKey, vars?: TranslateVars) =>
    translate(locale, key, vars);
}

/** True when the dictionary covers the key in every locale. */
export function hasTranslation(key: MessageKey): boolean {
  return LOCALES.every((locale) => Boolean(MESSAGES[locale][key]));
}
