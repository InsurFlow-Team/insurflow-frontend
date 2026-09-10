import { AlertCircle, CheckCircle } from "lucide-react";

interface ClaimsFeedbackProps {
  type: "success" | "error";
  message: string;
}

export default function ClaimsFeedback({ type, message }: ClaimsFeedbackProps) {
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
        type === "success"
          ? "border-success/20 bg-success/10 text-success"
          : "border-danger/20 bg-red-50 text-danger"
      }`}
    >
      {type === "success" ? (
        <CheckCircle size={16} />
      ) : (
        <AlertCircle size={16} />
      )}
      <span>{message}</span>
    </div>
  );
}