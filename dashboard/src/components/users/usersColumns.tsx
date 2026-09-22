import { Ban, CheckCircle, KeyRound, Pencil } from "lucide-react";
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
  onReset?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  /** Disables every row action while a status mutation is pending. */
  disabled?: boolean;
  /** Hides Deactivate/Activate for the signed-in user themself. */
  currentUserId?: string;
}

const rowActionClass =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function buildUserColumns({
  onEdit,
  onReset,
  onToggleStatus,
  disabled = false,
  currentUserId,
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

  if (onEdit && onReset && onToggleStatus) {
    columns.push({
      key: "actions",
      header: "Actions",
      render: (user) => {
        const isActive = getUserStatus(user) === "ACTIVE";
        const isSelf = user.id === currentUserId;

        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onEdit(user)}
              className={`${rowActionClass} text-text-muted hover:text-text hover:bg-background focus-visible:ring-primary/40`}
            >
              <Pencil size={14} />
              Edit
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onReset(user)}
              className={`${rowActionClass} text-text-muted hover:text-text hover:bg-background focus-visible:ring-primary/40`}
            >
              <KeyRound size={14} />
              Reset
            </button>

            {!isSelf &&
              (isActive ? (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onToggleStatus(user)}
                  className={`${rowActionClass} text-danger hover:bg-danger-bg focus-visible:ring-danger/40`}
                >
                  <Ban size={14} />
                  Deactivate
                </button>
              ) : (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onToggleStatus(user)}
                  className={`${rowActionClass} text-emerald-600 hover:bg-emerald-50 focus-visible:ring-emerald-400/40`}
                >
                  <CheckCircle size={14} />
                  Activate
                </button>
              ))}
          </div>
        );
      },
    });
  }

  return columns;
}