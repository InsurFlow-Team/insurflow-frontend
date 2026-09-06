import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { login } from "../api/auth.service";
import { getApiErrorMessage } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const { saveSession, logout } = useAuth();

  const [organizationCode, setOrganizationCode] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!organizationCode.trim() || !employeeCode.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
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
        setError("Field Adjusters must use the mobile application.");
        return;
      }

      saveSession(accessToken, user);
      navigate(user.role === "ADMIN" ? "/users" : "/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-8 sm:p-10 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-white" />
          </div>

          <div>
            <strong className="block text-base font-bold text-text leading-tight">
              InsurFlow
            </strong>

            <small className="text-text-muted text-xs">
              Claims Management
            </small>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-text mb-1">Welcome back</h1>

        <p className="text-text-muted text-sm mb-8">
          Sign in to your dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="organizationCode"
              className="block text-sm font-medium text-text mb-1.5"
            >
              Organization Code
            </label>

            <input
              id="organizationCode"
              type="text"
              value={organizationCode}
              onChange={(event) => setOrganizationCode(event.target.value)}
              placeholder="DEMO-INS"
              autoComplete="organization"
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="employeeCode"
              className="block text-sm font-medium text-text mb-1.5"
            >
              Employee Code
            </label>

            <input
              id="employeeCode"
              type="text"
              value={employeeCode}
              onChange={(event) => setEmployeeCode(event.target.value)}
              placeholder="CO-001"
              autoComplete="username"
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text mb-1.5"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-60"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger"
            >
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 bg-primary-dark hover:bg-primary text-white font-semibold py-2.5 rounded-lg transition-colors mt-2 text-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading && <Loader2 size={17} className="animate-spin" />}
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
