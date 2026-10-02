import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/ui/Button";

export default function Unauthorized() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-accent-light flex items-center justify-center">
          <Lock size={24} className="text-accent" />
        </div>

        <h1 className="text-lg font-semibold text-text mt-4">
          Access Denied
        </h1>

        <p className="text-sm text-text-muted mt-2">
          You do not have permission to view this page. If you believe this is
          a mistake, contact your organization administrator.
        </p>

        {user && (
          <p className="text-xs text-text-muted mt-4">
            Signed in as{" "}
            <span className="font-medium text-text">
              {user.name} ({user.employeeCode})
            </span>{" "}
            · {user.role.replace(/_/g, " ")}
          </p>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={handleGoBack}>Go to your page</Button>
          <Button variant="secondary" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}