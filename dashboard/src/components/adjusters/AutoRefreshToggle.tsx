import { Pause, Play } from "lucide-react";
import Button from "../ui/Button";
import { useTranslation } from "../../i18n/context";

interface AutoRefreshToggleProps {
  pollingPaused: boolean;
  onToggle: () => void;
}

export default function AutoRefreshToggle({
  pollingPaused,
  onToggle,
}: AutoRefreshToggleProps) {
  const { t } = useTranslation();

  return (
    <Button
      variant="secondary"
      size="sm"
      icon={pollingPaused ? <Play size={15} /> : <Pause size={15} />}
      onClick={onToggle}
    >
      {pollingPaused
        ? t("adjusters.resumeRefresh")
        : t("adjusters.pauseRefresh")}
    </Button>
  );
}