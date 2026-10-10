import { Languages } from "lucide-react";

import { useTranslation } from "../../i18n/context";

/**
 * Toggles the whole app between English and Arabic. The label always names
 * the language you would switch TO, in that language — the standard,
 * self-explanatory pattern ("العربية" / "English").
 */
export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  const label = locale === "en" ? t("lang.toArabic") : t("lang.toEnglish");
  const nextLocale = locale === "en" ? "ar" : "en";

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      aria-label={label}
      title={label}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-muted hover:text-text hover:bg-background transition-colors cursor-pointer"
    >
      <Languages size={15} aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
