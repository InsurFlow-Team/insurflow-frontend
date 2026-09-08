import { useState } from "react";
import { AlertCircle, CheckCircle, Search } from "lucide-react";
import type { User, Role, UserStatus } from "../types";
import { useForm } from "../hooks/useForm";
import {
  validateName,
  validateEmployeeCode,
  validatePassword,
  validateRole,
  validateStatus,
} from "../utils/validation";
import Button from "../components/ui/Button";
import { UserPlus } from "lucide-react";
import DataTable, { type Column } from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";

import Modal from "../components/ui/Modal";
import FormField from "../components/ui/FormField";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { useUsers } from "../hooks/useUsers";

const columns: Column<User>[] = [
  { key: "name", header: "Name" },
  { key: "employeeCode", header: "Employee Code" },
  { key: "role", header: "Role" },
  {
    key: "status",
    header: "Status",
    render: (user) =>
      user.status ? (
        <StatusBadge status={user.status} />
      ) : (
        <span className="text-sm text-text-muted">—</span>
      ),
  },
];

export default function Users() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    users,
    loading,
    error,
    addUser,
    addUserLoading,
    addUserError,
    addUserSuccess,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Users</h1>
          <p className="text-text-muted text-sm mt-1">Manage system users</p>
        </div>
        <Button
          icon={<UserPlus size={16} />}
          onClick={() => setIsModalOpen(true)}
        >
          Add User
        </Button>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <label className="relative block">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | "")}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="CLAIMS_OFFICER">Claims Officer</option>
            <option value="FIELD_ADJUSTER">Field Adjuster</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | "")}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {addUserSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle size={16} />
          <span>User created successfully.</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        error={error ?? undefined}
        emptyMessage="No users found."
        keyExtractor={(user) => user.id}
      />
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
              options={[
                { value: "ADMIN", label: "Admin" },
                { value: "CLAIMS_OFFICER", label: "Claims Officer" },
                { value: "FIELD_ADJUSTER", label: "Field Adjuster" },
              ]}
            />
          </FormField>

          <FormField label="Status" required error={errors.status}>
            <Select
              name="status"
              value={values.status}
              onChange={handleChange}
              placeholder="Select Status"
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
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
    </div>
  );
}
