import { CheckCircle2 } from "lucide-react";

interface SuccessBannerProps {
  message: string;
}

export default function SuccessBanner({ message }: SuccessBannerProps) {
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success"
    >
      <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}