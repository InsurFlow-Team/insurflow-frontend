import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { login } from "../api/auth.service";
import { getApiErrorMessage } from "../api/client";
import FormField from "../components/ui/FormField";
import InlineError from "../components/ui/InlineError";
import SuccessBanner from "../components/ui/SuccessBanner";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";
import { useTranslation } from "../i18n/context";

const INPUT_CLASS =
  "w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-60";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveSession, logout } = useAuth();
  const { dir, t } = useTranslation();

  const successMessage = (
    location.state as { message?: string } | null
  )?.message;

  const [organizationCode, setOrganizationCode] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!organizationCode.trim() || !employeeCode.trim() || !password.trim()) {
      setError(t("login.requiredFields"));
      return;
    }

    setIsLoading(true);

    try {
      const { accessToken, user } = await login({
        organizationCode: organizationCode.trim().toUpperCase(),
        employeeCode: employeeCode.trim().toUpperCase(),
        password,
      });

      if (user.role === "FIELD_ADJUSTER") {
        logout();
        setError(t("login.adjusterMobileOnly"));
        return;
      }

      saveSession(accessToken, user);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8" dir={dir}>
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-8 sm:p-10 w-full max-w-sm">
        <div className="flex items-start justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/logo.jpeg" alt="صَوْن" className="w-full h-full object-cover" />
            </div>

            <div>
              <strong className="block text-base font-bold text-text leading-tight">
                صَوْن | SAWN
              </strong>

              <small className="text-text-muted text-xs">
                {t("login.productSubtitle")}
              </small>
            </div>
          </div>

          <LanguageSwitcher />
        </div>

        <h1 className="text-2xl font-bold text-text mb-1">
          {t("login.welcome")}
        </h1>

        <p className="text-text-muted text-sm mb-8">
          {t("login.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {successMessage && <SuccessBanner message={successMessage} />}

          <FormField
            label={t("login.organizationCode")}
            htmlFor="organizationCode"
            required
          >
            <input
              id="organizationCode"
              type="text"
              value={organizationCode}
              onChange={(event) => setOrganizationCode(event.target.value)}
              placeholder="DEMO-INS"
              autoComplete="organization"
              dir="ltr"
              aria-required="true"
              disabled={isLoading}
              className={INPUT_CLASS}
            />
          </FormField>

          <FormField
            label={t("login.employeeCode")}
            htmlFor="employeeCode"
            required
          >
            <input
              id="employeeCode"
              type="text"
              value={employeeCode}
              onChange={(event) => setEmployeeCode(event.target.value)}
              placeholder="CO-001"
              autoComplete="username"
              dir="ltr"
              aria-required="true"
              disabled={isLoading}
              className={INPUT_CLASS}
            />
          </FormField>

          <FormField label={t("login.password")} htmlFor="password" required>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                dir="ltr"
                aria-required="true"
                disabled={isLoading}
                className={`${INPUT_CLASS} pe-11`}
              />
              <button
                type="button"
                aria-label={
                  showPassword ? t("login.hidePassword") : t("login.showPassword")
                }
                title={
                  showPassword ? t("login.hidePassword") : t("login.showPassword")
                }
                onClick={() => setShowPassword((visible) => !visible)}
                disabled={isLoading}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>

          {error && <InlineError message={error} />}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 bg-primary-dark hover:bg-primary text-white font-semibold py-2.5 rounded-lg transition-colors mt-2 text-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading && <Loader2 size={17} className="animate-spin" />}
            {isLoading ? t("login.signingIn") : t("login.signIn")}
          </button>
        </form>
      </div>
    </div>
  );
}