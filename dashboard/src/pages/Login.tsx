import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "../hooks/useForm";
import { validateEmployeeCode, validatePassword } from "../utils/validation";
import FormField from "../components/ui/FormField";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Login() {
  const navigate = useNavigate();

  const { values, errors, handleChange, isValid } = useForm<{
    employeeCode: string;
    password: string;
  }>(
    {
      employeeCode: "",
      password: "",
    },
    {
      employeeCode: validateEmployeeCode,
      password: validatePassword,
    },
  );

  const handleSubmit = () => {
    if (!isValid) return;

    navigate("/dashboard");
  };

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
          <FormField label="Employee Code" required error={errors.employeeCode}>
            <Input
              name="employeeCode"
              type="text"
              value={values.employeeCode}
              onChange={handleChange}
              placeholder="CO-001"
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

          <Button
            type="button"
            className="w-full mt-2"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
