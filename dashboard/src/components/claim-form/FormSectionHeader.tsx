import type { LucideIcon } from "lucide-react";

interface FormSectionHeaderProps {
  icon: LucideIcon;
  title: string;
}

export default function FormSectionHeader({ icon: Icon, title }: FormSectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-border">
      <Icon size={18} className="text-primary" />
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      <span className="ml-auto text-xs text-danger">* Required</span>
    </div>
  );
}