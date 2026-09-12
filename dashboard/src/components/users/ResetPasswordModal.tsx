import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import Modal from "../ui/Modal";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { validatePassword } from "../../utils/validation";
import type { User } from "../../types";

interface ResetPasswordModalProps {
  user: User | null;
  onClose: () => void;
  onSubmit: (userId: string, newPassword: string) => Promise<boolean>;
}

export default function ResetPasswordModal({
  user,
  onClose,
  onSubmit,
}: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordError = validatePassword(password);
  const matchError = confirm && confirm !== password ? "Passwords do not match" : null;
  const isValid = !passwordError && !matchError && password.length >= 8;

  function handleClose() {
    if (submitting) return;
    setPassword("");
    setConfirm("");
    setShow(false);
    onClose();
  }

  function handleSubmit() {
    if (!user || !isValid) return;

    setSubmitting(true);
    onSubmit(user.id, password).then((success) => {
      setSubmitting(false);
      if (success) {
        setPassword("");
        setConfirm("");
        setShow(false);
        onClose();
      }
    });
  }

  return (
    <Modal
      isOpen={user !== null}
      onClose={handleClose}
      title="Reset Password"
      size="sm"
    >
      <div className="space-y-4">
        {user && (
          <p className="text-sm text-text-muted">
            Set a new password for{" "}
            <span className="font-medium text-text">{user.name}</span> (
            {user.employeeCode}).
          </p>
        )}

        <FormField label="New Password" required error={passwordError || undefined}>
          <div className="relative">
            <Input
              name="password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </FormField>

        <FormField label="Confirm New Password" required error={matchError || undefined}>
          <Input
            name="confirm"
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="Re-enter the new password"
          />
        </FormField>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            icon={<KeyRound size={16} />}
            onClick={handleSubmit}
            disabled={!isValid || submitting}
          >
            {submitting ? "Saving..." : "Reset Password"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}