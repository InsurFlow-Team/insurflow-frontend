import { useState } from "react";
import { CheckCircle, Eye, EyeOff, KeyRound } from "lucide-react";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { changePassword } from "../../api/auth.service";
import { getApiErrorMessage } from "../../api/client";
import { validatePassword, validateRequired } from "../../utils/validation";

export default function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentError = currentPassword ? null : validateRequired(currentPassword);
  const newPasswordError = validatePassword(newPassword);
  const matchError =
    confirmPassword && confirmPassword !== newPassword
      ? "Passwords do not match"
      : null;
  const isSubmittable =
    !currentError &&
    !newPasswordError &&
    !matchError &&
    newPassword.length >= 8 &&
    confirmPassword.length > 0;

  function handleSubmit() {
    if (!isSubmittable) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    changePassword(currentPassword, newPassword)
      .then(() => {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        if (show) setShow(false);
      })
      .catch((passwordError) => {
        setError(getApiErrorMessage(passwordError));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary shrink-0">
          <KeyRound size={20} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-text">Password</h2>
          <p className="mt-0.5 text-sm text-text-muted">
            Change the password used to sign in to your own account.
          </p>
        </div>
      </div>

      <div className="mt-4 max-w-md space-y-4">
        <FormField label="Current Password" required error={currentError || undefined}>
          <Input
            name="currentPassword"
            type={show ? "text" : "password"}
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Your current password"
          />
        </FormField>

        <FormField label="New Password" required error={newPasswordError || undefined}>
          <Input
            name="newPassword"
            type={show ? "text" : "password"}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="At least 8 characters"
          />
        </FormField>

        <FormField label="Confirm New Password" required error={matchError || undefined}>
          <Input
            name="confirmPassword"
            type={show ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter the new password"
          />
        </FormField>

        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
          {show ? "Hide passwords" : "Show passwords"}
        </button>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2.5 text-sm text-danger">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-sm text-success">
            <CheckCircle size={16} />
            <span>Password updated successfully.</span>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button onClick={handleSubmit} disabled={!isSubmittable || loading}>
            {loading ? "Saving..." : "Update Password"}
          </Button>
        </div>
      </div>
    </section>
  );
}