import type { LucideIcon } from "lucide-react";

interface FormSectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
}

export default function FormSectionHeader({
  icon: Icon,
  title,
  subtitle,
}: FormSectionHeaderProps) {
  return (
    <div className="pb-2 border-b border-border">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className="text-primary" />}
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {!subtitle && <span className="ml-auto text-xs text-danger">* Required</span>}
      </div>
      {subtitle && (
        <p className="text-xs text-text-muted mt-1">{subtitle}</p>
      )}
    </div>
  );
}