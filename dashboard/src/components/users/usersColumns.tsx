import { Pencil, Ban, CheckCircle } from "lucide-react";
import type { Column } from "../ui/DataTable";
import RoleBadge from "../ui/RoleBadge";
import StatusBadge from "../ui/StatusBadge";
import {
  avatarClasses,
  getUserStatus,
  temporaryUserEmail,
  userInitials,
} from "../../utils/user";
import type { User } from "../../types";

interface UserColumnsHandlers {
  onEdit?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
}

export function buildUserColumns({
  onEdit,
  onToggleStatus,
}: UserColumnsHandlers): Column<User>[] {
  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      render: (user) => (
        <div className="flex items-center gap-3">
          <span
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarClasses(user.name)}`}
          >
            {userInitials(user.name)}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-text truncate">{user.name}</p>
            <p className="text-xs text-text-muted truncate">
              {temporaryUserEmail(user)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "employeeCode",
      header: "Employee Code",
      render: (user) => (
        <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {user.employeeCode}
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => <RoleBadge role={user.role} />,
    },
    {
      key: "organization",
      header: "Organization",
      render: (user) => (
        <span className="text-sm text-text line-clamp-2">
          {user.organizationName}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => <StatusBadge status={getUserStatus(user)} />,
    },
  ];

  if (onEdit && onToggleStatus) {
    columns.push({
      key: "actions",
      header: "Actions",
      render: (user) => {
        const isActive = getUserStatus(user) === "ACTIVE";

        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(user)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-text transition-colors"
            >
              <Pencil size={14} />
              Edit
            </button>

            {isActive ? (
              <button
                type="button"
                onClick={() => onToggleStatus(user)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger-bg transition-colors"
              >
                <Ban size={14} />
                Deactivate
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleStatus(user)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <CheckCircle size={14} />
                Activate
              </button>
            )}
          </div>
        );
      },
    });
  }

  return columns;
}