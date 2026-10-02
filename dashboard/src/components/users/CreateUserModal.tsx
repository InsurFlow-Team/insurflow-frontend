import type { ChangeEvent } from "react";
import { AlertCircle } from "lucide-react";
import Modal from "../ui/Modal";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { CREATE_ROLE_OPTIONS } from "../../utils/user";
import type { Role } from "../../types";

export type CreateUserFormValues = {
  name: string;
  employeeCode: string;
  password: string;
  role: Role | "";
};

interface CreateUserModalProps {
  isOpen: boolean;
  values: CreateUserFormValues;
  errors: Partial<Record<keyof CreateUserFormValues, string>>;
  isValid: boolean;
  loading: boolean;
  error?: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function CreateUserModal({
  isOpen,
  values,
  errors,
  isValid,
  loading,
  error,
  onChange,
  onCancel,
  onSubmit,
}: CreateUserModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Create User">
      <div className="space-y-4">
        <FormField label="Name" required error={errors.name}>
          <Input
            name="name"
            value={values.name}
            onChange={onChange}
            placeholder="Ahmed Ali"
          />
        </FormField>

        <FormField label="Employee Code" required error={errors.employeeCode}>
          <Input
            name="employeeCode"
            value={values.employeeCode}
            onChange={onChange}
            placeholder="FA-001"
          />
        </FormField>

        <FormField label="Password" required error={errors.password}>
          <Input
            name="password"
            type="password"
            value={values.password}
            onChange={onChange}
            placeholder="••••••••"
          />
        </FormField>

        <FormField label="Role" required error={errors.role}>
          <Select
            name="role"
            value={values.role}
            onChange={onChange}
            placeholder="Select Role"
            options={CREATE_ROLE_OPTIONS}
          />
        </FormField>

        <p className="text-xs text-text-muted">
          New users start with Active status.
        </p>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2.5 text-sm text-danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={onSubmit}
            disabled={!isValid || loading}
          >
            {loading ? "Creating..." : "Create User"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}