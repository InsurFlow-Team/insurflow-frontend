import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Button from "../ui/Button";
import AlertCard from "../ui/AlertCard";
import { changePassword } from "../../api/auth.service";
import { getApiErrorMessage } from "../../api/client";
import { validatePassword, validateRequired } from "../../utils/validation";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "../../i18n/context";

export default function ChangePasswordCard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentError = currentPassword ? null : validateRequired(currentPassword);
  const newPasswordError = validatePassword(newPassword);
  const sameAsCurrentError =
    currentPassword && newPassword && newPassword === currentPassword
      ? t("profile.password.differentError")
      : null;
  const matchError =
    confirmPassword && confirmPassword !== newPassword
      ? t("profile.password.matchError")
      : null;
  const isSubmittable =
    !currentError &&
    !newPasswordError &&
    !sameAsCurrentError &&
    !matchError &&
    newPassword.length >= 8 &&
    confirmPassword.length > 0;

  const handleSubmit = useCallback(() => {
    if (!isSubmittable) return;

    setLoading(true);
    setError(null);

    changePassword(currentPassword, newPassword)
      .then(() => {
        logout();
        navigate("/login", {
          replace: true,
          state: { message: t("profile.password.changedMessage") },
        });
      })
      .catch((passwordError) => {
        setError(getApiErrorMessage(passwordError));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isSubmittable, currentPassword, newPassword, logout, navigate, t]);

  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary shrink-0">
          <KeyRound size={20} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-text">
            {t("profile.password.title")}
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            {t("profile.password.subtitle")}
          </p>
        </div>
      </div>

      <div className="mt-4 max-w-md space-y-4">
        <FormField
          label={t("profile.password.current")}
          required
          error={currentError || undefined}
        >
          <Input
            name="currentPassword"
            type={show ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t("profile.password.currentPlaceholder")}
          />
        </FormField>

        <FormField
          label={t("profile.password.new")}
          required
          error={newPasswordError || sameAsCurrentError || undefined}
        >
          <Input
            name="newPassword"
            type={show ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t("profile.password.newPlaceholder")}
          />
        </FormField>

        <FormField
          label={t("profile.password.confirm")}
          required
          error={matchError || undefined}
        >
          <Input
            name="confirmPassword"
            type={show ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t("profile.password.confirmPlaceholder")}
          />
        </FormField>

        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
          {show ? t("profile.password.hide") : t("profile.password.show")}
        </button>

        {error && (
          <AlertCard variant="danger" compact>
            {error}
          </AlertCard>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={!isSubmittable || loading}
          >
            {t("profile.password.update")}
          </Button>
        </div>
      </div>
    </section>
  );
}
