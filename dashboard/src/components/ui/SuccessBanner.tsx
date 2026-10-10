import AlertCard from "./AlertCard";

interface SuccessBannerProps {
  message: string;
  onDismiss?: () => void;
}

/**
 * SuccessBanner — thin wrapper around AlertCard(success) for backward
 * compatibility. Prefer using AlertCard directly in new code.
 */
export default function SuccessBanner({ message, onDismiss }: SuccessBannerProps) {
  return (
    <AlertCard variant="success" compact onDismiss={onDismiss}>
      {message}
    </AlertCard>
  );
}
