import { useState } from "react";
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

const columns: Column<User>[] = [
  { key: "name", header: "Name" },
  { key: "employeeCode", header: "Employee Code" },
  { key: "role", header: "Role" },
  {
    key: "status",
    header: "Status",
    render: (user) => <StatusBadge status={user.status} />,
  },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    handleClose();
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
              disabled={!isValid}
            >
              Create User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
