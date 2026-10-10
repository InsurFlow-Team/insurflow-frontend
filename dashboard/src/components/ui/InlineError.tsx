/**
 * InlineError — bare validation message line.
 *
 * Prefer using the `error` prop on `<FormField>` where possible.
 * Use this directly only when a standalone error message is needed
 * outside a form field wrapper (e.g. a form-level error summary).
 */
interface InlineErrorProps {
  message: string;
  id?: string;
}

export default function InlineError({ message, id }: InlineErrorProps) {
  return (
    <p
      id={id}
      role="alert"
      className="flex items-center gap-1 text-xs text-danger-text leading-snug"
    >
      <span aria-hidden="true">↳</span>
      {message}
    </p>
  );
}
