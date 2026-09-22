import { Pause, Play } from "lucide-react";
import Button from "../ui/Button";

interface AutoRefreshToggleProps {
  pollingPaused: boolean;
  onToggle: () => void;
}

export default function AutoRefreshToggle({
  pollingPaused,
  onToggle,
}: AutoRefreshToggleProps) {
  return (
    <Button
      variant="secondary"
      size="sm"
      icon={pollingPaused ? <Play size={15} /> : <Pause size={15} />}
      onClick={onToggle}
    >
      {pollingPaused ? "Resume Auto-Refresh" : "Pause Auto-Refresh"}
    </Button>
  );
}