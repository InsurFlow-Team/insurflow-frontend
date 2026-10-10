import FormField from "../FormField";
import type { ChangeEvent } from "react";
import { useTranslation } from "../../../i18n/context";

interface NotesFieldProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

export default function NotesField({
  value,
  onChange,
  disabled = false,
}: NotesFieldProps) {
  const { t } = useTranslation();

  return (
    <FormField label={t("assign.notes.label")}>
      <textarea
        name="notes"
        value={value}
        onChange={onChange}
        placeholder={t("assign.notes.placeholder")}
        rows={3}
        maxLength={300}
        disabled={disabled}
        className={`
          w-full rounded-lg border bg-background text-sm text-text
          px-4 py-2.5 placeholder:text-text-muted/50
          focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          transition duration-150 resize-none
          border-border
        `}
      />
    </FormField>
  );
}