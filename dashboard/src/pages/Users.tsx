import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ban,
  CheckCircle,
  ChevronRight,
  FileText,
  KeyRound,
  Lock,
  MapPin,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users as UsersIcon,
  X,
  type LucideIcon,
} from "lucide-react";
import type { CreateUserRequest, Role, User, UserStatus } from "../types";
import { useForm } from "../hooks/useForm";
import {
  validateEmployeeCode,
  validateName,
  validatePassword,
  validateRole,
} from "../utils/validation";
import {
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  avatarClasses,
  getUserStatus,
  temporaryUserEmail,
  userInitials,
} from "../utils/user";
import Button from "../components/ui/Button";
import DataTable, { type Column } from "../components/ui/DataTable";
import Pagination from "../components/ui/Pagination";
import StatusBadge from "../components/ui/StatusBadge";
import RoleBadge from "../components/ui/RoleBadge";
import StatCard from "../components/ui/StatCard";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import CreateUserModal from "../components/users/CreateUserModal";
import EditUserForm from "../components/users/EditUserForm";
import ResetPasswordModal from "../components/users/ResetPasswordModal";
import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../contexts/AuthContext";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

export default function Users() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToReset, setUserToReset] = useState<User | null>(null);

  const {
    users,
    loading,
    error,
    addUser,
    addUserLoading,
    addUserError,
    addUserSuccess,
    setUserStatus,
    resetPassword,
    deleteUser,
    actionError,
    clearActionError,
    isActionPending,
    updateUserLocal,
  } = useUsers();

  const { values, errors, handleChange, isValid, reset } = useForm<{
    name: string;
    employeeCode: string;
    password: string;
    role: Role | "";
  }>(
    {
      name: "",
      employeeCode: "",
      password: "",
      role: "",
    },
    {
      name: validateName,
      employeeCode: validateEmployeeCode,
      password: validatePassword,
      role: validateRole,
    },
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        `${user.name} ${user.employeeCode}`.toLowerCase().includes(query);
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus =
        !statusFilter || getUserStatus(user) === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);

  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  const stats = useMemo(() => {
    const active = users.filter(
      (user) => getUserStatus(user) === "ACTIVE",
    ).length;

    return {
      total: users.length,
      active,
      inactive: users.length - active,
      admins: users.filter((user) => user.role === "ADMIN").length,
      claimsOfficers: users.filter((user) => user.role === "CLAIMS_OFFICER")
        .length,
      fieldAdjusters: users.filter((user) => user.role === "FIELD_ADJUSTER")
        .length,
    };
  }, [users]);

  const activePercent = stats.total
    ? Math.round((stats.active / stats.total) * 100)
    : 0;

  const statCards: Array<{
    label: string;
    value: number;
    secondary: string;
    icon: LucideIcon;
    iconClass: string;
    dot?: string;
  }> = [
    {
      label: "Total Users",
      value: stats.total,
      secondary: "registered",
      icon: UsersIcon,
      iconClass: "text-primary",
    },
    {
      label: "Active Status",
      value: stats.active,
      secondary: `${activePercent}%`,
      icon: CheckCircle,
      iconClass: "text-emerald-500",
      dot: "bg-emerald-500",
    },
    {
      label: "Inactive / Suspended",
      value: stats.inactive,
      secondary: "locked",
      icon: Lock,
      iconClass: "text-gray-400",
    },
    {
      label: "Admins",
      value: stats.admins,
      secondary: "Full System",
      icon: Shield,
      iconClass: "text-admin",
    },
    {
      label: "Claims Officers",
      value: stats.claimsOfficers,
      secondary: "Triage Desk",
      icon: FileText,
      iconClass: "text-claims",
    },
    {
      label: "Field Adjusters",
      value: stats.fieldAdjusters,
      secondary: "On-Site",
      icon: MapPin,
      iconClass: "text-field",
    },
  ];

  const handleClose = () => {
    setIsModalOpen(false);
    reset();
  };

  const handleSubmit = () => {
    addUser(
      {
        name: values.name,
        employeeCode: values.employeeCode,
        password: values.password,
        role: values.role as CreateUserRequest["role"],
      },
      handleClose,
    );
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  // Activating needs no confirmation. Deactivating is guarded by ConfirmDialog
  // (see userToDeactivate) because it locks the account out.
  async function handleActivate(user: User) {
    await setUserStatus(user.id, "ACTIVE");
  }

  async function handleDeactivateConfirm() {
    if (!userToDeactivate) return;
    const user = userToDeactivate;
    await setUserStatus(user.id, "INACTIVE");
    setUserToDeactivate(null);
  }

  async function handleDeleteConfirm() {
    if (!userToDelete) return;
    const user = userToDelete;
    await deleteUser(user.id);
    setUserToDelete(null);
  }

  function handleEditSave(patch: {
    name: string;
    employeeCode: string;
    role: Role;
    status: UserStatus;
  }) {
    if (editingUser) {
      updateUserLocal(editingUser.id, patch);
    }
    setEditingUser(null);
  }

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
    {
      key: "actions",
      header: "Actions",
      render: (user) => {
        const isActive = getUserStatus(user) === "ACTIVE";
        const isSelf = user.id === currentUser?.id;

        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setEditingUser(user)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-text transition-colors"
            >
              <Pencil size={14} />
              Edit
            </button>

            <button
              type="button"
              onClick={() => setUserToReset(user)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-text transition-colors"
            >
              <KeyRound size={14} />
              Reset
            </button>

            {!isSelf &&
              (isActive ? (
                <button
                  type="button"
                  onClick={() => setUserToDeactivate(user)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger-bg transition-colors"
                >
                  <Ban size={14} />
                  Deactivate
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActivate(user)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <CheckCircle size={14} />
                  Activate
                </button>
              ))}

            {isAdmin && !isSelf && (
              <button
                type="button"
                onClick={() => setUserToDelete(user)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger-bg transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const tableFooter = (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      onPageChange={setPage}
      onRowsPerPageChange={(rows) => {
        setRowsPerPage(rows);
        setPage(1);
      }}
    />
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-text-muted"
          >
            <span>Operations</span>
            <ChevronRight size={14} className="text-text-muted" />
            <Link to="/settings" className="hover:text-text transition-colors">
              Settings
            </Link>
            <ChevronRight size={14} className="text-text-muted" />
            <span className="font-medium text-primary">User Management</span>
          </nav>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-text">Users</h1>
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
              System Registry
            </span>
          </div>

          <p className="mt-1 text-sm text-text-muted max-w-2xl">
            Manage system users, assigned roles, organization affiliations, and
            access credentials.
          </p>
        </div>

        {isAdmin ? (
          <Button
            icon={<UserPlus size={16} />}
            onClick={() => setIsModalOpen(true)}
            className="shrink-0"
          >
            Add User
          </Button>
        ) : (
          <span className="shrink-0 text-sm text-text-muted">
            Only administrators can add users.
          </span>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-[1fr_200px_200px_auto] min-w-[320px]">
            <label className="relative block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by user name or employee code"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value as Role | "");
                setPage(1);
              }}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Roles</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as UserStatus | "");
                setPage(1);
              }}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button
              variant="secondary"
              icon={<RefreshCw size={15} />}
              onClick={handleResetFilters}
            >
              Reset Filters
            </Button>
          </div>

          <span className="text-sm text-text-muted whitespace-nowrap">
            Showing {filteredUsers.length} of {users.length} Users
          </span>
        </div>
      </div>

      {addUserSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle size={16} />
          <span>User created successfully.</span>
        </div>
      )}

      {actionError && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
          <div className="flex items-center gap-2">
            <Ban size={16} />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={clearActionError}
            className="text-danger/70 hover:text-danger transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* User table */}
      <DataTable
        columns={columns}
        data={pagedUsers}
        loading={loading}
        error={error ?? undefined}
        emptyMessage="No users found."
        keyExtractor={(user) => user.id}
        footer={tableFooter}
      />

      {/* Create User modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        values={values}
        errors={errors}
        isValid={isValid}
        loading={addUserLoading}
        error={addUserError ?? undefined}
        onChange={handleChange}
        onCancel={handleClose}
        onSubmit={handleSubmit}
      />

      {/* Edit User modal (TEMPORARY frontend-only — no backend endpoint yet) */}
      <Modal
        isOpen={editingUser !== null}
        onClose={() => setEditingUser(null)}
        title="Edit User"
      >
        {editingUser && (
          <EditUserForm
            user={editingUser}
            onCancel={() => setEditingUser(null)}
            onSave={handleEditSave}
          />
        )}
      </Modal>

      {/* Deactivate confirmation */}
      <ConfirmDialog
        isOpen={userToDeactivate !== null}
        title="Deactivate User"
        confirmLabel="Deactivate"
        loading={isActionPending}
        onCancel={() => setUserToDeactivate(null)}
        onConfirm={handleDeactivateConfirm}
      >
        {userToDeactivate && (
          <p className="text-sm text-text-muted">
            <span className="font-medium text-text">
              {userToDeactivate.name}
            </span>{" "}
            ({userToDeactivate.employeeCode}) will no longer be able to sign in.
            You can reactivate them at any time.
          </p>
        )}
      </ConfirmDialog>

      {/* Reset Password modal */}
      <ResetPasswordModal
        user={userToReset}
        onClose={() => setUserToReset(null)}
        onSubmit={resetPassword}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={userToDelete !== null}
        title="Delete User"
        confirmLabel="Delete"
        loading={isActionPending}
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
      >
        {userToDelete && (
          <p className="text-sm text-text-muted">
            <span className="font-medium text-text">
              {userToDelete.name}
            </span>{" "}
            ({userToDelete.employeeCode}) will be permanently removed from the
            system along with all access. This action cannot be undone.
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}