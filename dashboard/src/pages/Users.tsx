import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Ban,
  CheckCircle,
  ChevronRight,
  FileText,
  Lock,
  MapPin,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  UserPlus,
  Users as UsersIcon,
  type LucideIcon,
} from "lucide-react";
import type { Role, User, UserStatus } from "../types";
import { useForm } from "../hooks/useForm";
import {
  validateEmployeeCode,
  validateName,
  validatePassword,
  validateRole,
  validateStatus,
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
import Modal from "../components/ui/Modal";
import FormField from "../components/ui/FormField";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import StatCard from "../components/ui/StatCard";
import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../contexts/AuthContext";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

interface EditUserFormProps {
  user: User;
  onCancel: () => void;
  onSave: (patch: {
    name: string;
    employeeCode: string;
    role: Role;
    status: UserStatus;
  }) => void;
}

function EditUserForm({ user, onCancel, onSave }: EditUserFormProps) {
  const [name, setName] = useState(user.name);
  const [employeeCode, setEmployeeCode] = useState(user.employeeCode);
  const [role, setRole] = useState<Role>(user.role);
  const [status, setStatus] = useState<UserStatus>(getUserStatus(user));

  const nameError = validateName(name);
  const codeError = validateEmployeeCode(employeeCode);
  const isValid = !nameError && !codeError;

  return (
    <div className="space-y-4">
      <FormField label="Name" required error={nameError || undefined}>
        <Input
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ahmed Ali"
        />
      </FormField>

      <FormField label="Employee Code" required error={codeError || undefined}>
        <Input
          name="employeeCode"
          value={employeeCode}
          onChange={(event) => setEmployeeCode(event.target.value)}
          placeholder="FA-001"
        />
      </FormField>

      <FormField label="Role" required>
        <Select
          name="role"
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
          options={ROLE_OPTIONS}
        />
      </FormField>

      <FormField label="Status" required>
        <Select
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value as UserStatus)}
          options={STATUS_OPTIONS}
        />
      </FormField>

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={() => onSave({ name, employeeCode, role, status })}
          disabled={!isValid}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default function Users() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const {
    users,
    loading,
    error,
    addUser,
    addUserLoading,
    addUserError,
    addUserSuccess,
    updateUserLocal,
  } = useUsers();

  const { values, errors, handleChange, isValid, reset } = useForm<{
    name: string;
    employeeCode: string;
    password: string;
    role: Role | "";
    status: UserStatus | "";
  }>(
    {
      name: "",
      employeeCode: "",
      password: "",
      role: "",
      status: "",
    },
    {
      name: validateName,
      employeeCode: validateEmployeeCode,
      password: validatePassword,
      role: validateRole,
      status: validateStatus,
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
        role: values.role as Role,
        status: values.status as UserStatus,
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

  // TEMPORARY frontend-only actions. The backend has no
  // activate/deactivate/edit endpoints yet — status toggles mutate local state
  // only. Replace with PATCH /users/:id calls when the API supports them.
  function handleToggleStatus(user: User) {
    updateUserLocal(user.id, {
      status: getUserStatus(user) === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    });
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

            {isActive ? (
              <button
                type="button"
                onClick={() => handleToggleStatus(user)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger-bg transition-colors"
              >
                <Ban size={14} />
                Deactivate
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleStatus(user)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <CheckCircle size={14} />
                Activate
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
      <Modal isOpen={isModalOpen} onClose={handleClose} title="Create User">
        <div className="space-y-4">
          <FormField label="Name" required error={errors.name}>
            <Input
              name="name"
              value={values.name}
              onChange={handleChange}
              placeholder="Ahmed Ali"
            />
          </FormField>

          <FormField label="Employee Code" required error={errors.employeeCode}>
            <Input
              name="employeeCode"
              value={values.employeeCode}
              onChange={handleChange}
              placeholder="FA-001"
            />
          </FormField>

          <FormField label="Password" required error={errors.password}>
            <Input
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </FormField>

          <FormField label="Role" required error={errors.role}>
            <Select
              name="role"
              value={values.role}
              onChange={handleChange}
              placeholder="Select Role"
              options={ROLE_OPTIONS}
            />
          </FormField>

          <FormField label="Status" required error={errors.status}>
            <Select
              name="status"
              value={values.status}
              onChange={handleChange}
              placeholder="Select Status"
              options={STATUS_OPTIONS}
            />
          </FormField>

          {addUserError && (
            <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2.5 text-sm text-danger">
              <AlertCircle size={16} />
              <span>{addUserError}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!isValid || addUserLoading}
            >
              {addUserLoading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </div>
      </Modal>

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
    </div>
  );
}