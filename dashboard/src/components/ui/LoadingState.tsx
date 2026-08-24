import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
      <Loader2 size={32} className="animate-spin text-primary" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
