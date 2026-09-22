import { AlertCircle } from "lucide-react";

interface InlineErrorProps {
  message: string;
}

export default function InlineError({ message }: InlineErrorProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-danger/20 bg-red-50 px-3 py-2.5 text-sm text-danger"
    >
      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}