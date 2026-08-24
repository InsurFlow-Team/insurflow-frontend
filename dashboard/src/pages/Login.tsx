import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-10 w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <strong className="block text-base font-bold text-text leading-tight">
              InsurFlow
            </strong>
            <small className="text-text-muted text-xs">Claims Management</small>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-text mb-1">Welcome back</h1>
        <p className="text-text-muted text-sm mb-8">
          Sign in to your dashboard.
        </p>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Employee Code
            </label>
            <input
              type="text"
              placeholder="CO-001"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <Link
            to="/dashboard"
            className="block w-full text-center bg-primary-dark hover:bg-primary text-white font-semibold py-2.5 rounded-lg transition-colors mt-2 text-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
