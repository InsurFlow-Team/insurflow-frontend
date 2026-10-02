import { useState } from "react";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import {
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  getUserStatus,
} from "../../utils/user";
import { validateName, validateEmployeeCode } from "../../utils/validation";
import type { Role, User, UserStatus } from "../../types";

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

export default function EditUserForm({ user, onCancel, onSave }: EditUserFormProps) {
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