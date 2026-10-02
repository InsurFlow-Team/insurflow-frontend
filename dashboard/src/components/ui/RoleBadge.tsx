import { FileText, MapPin, Shield } from "lucide-react";
import type { Role } from "../../types";

interface RoleConfig {
  label: string;
  icon: typeof Shield;
  classes: string;
}

const roleConfig: Record<Role, RoleConfig> = {
  ADMIN: {
    label: "Admin",
    icon: Shield,
    classes: "bg-admin-bg text-admin border-admin/20",
  },
  CLAIMS_OFFICER: {
    label: "Claims Officer",
    icon: FileText,
    classes: "bg-claims-bg text-claims border-claims/20",
  },
  FIELD_ADJUSTER: {
    label: "Field Adjuster",
    icon: MapPin,
    classes: "bg-field-bg text-field border-field/20",
  },
};

interface RoleBadgeProps {
  role: Role;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.classes}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}