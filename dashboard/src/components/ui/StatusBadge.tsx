import { statusClasses, statusStyle } from "../../utils/statusStyles";

interface StatusBadgeProps {
  /** A `ClaimStatus`, `UserStatus`, `InspectionTaskStatus` or `Availability`. */
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyle(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusClasses(status)}`}
    >
      {style.dot && (
        <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />
      )}
      {style.label}
    </span>
  );
}
