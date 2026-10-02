import { useParams } from "react-router-dom";
import { RefreshCw, AlertCircle, Shield, Lock, Lightbulb } from "lucide-react";
import { usePublicTracking } from "../hooks/usePublicTracking";
import ClaimStatusBadge from "../components/public/ClaimStatusBadge";
import PublicTimeline from "../components/public/PublicTimeline";
import TrackingInfoCard from "../components/public/TrackingInfoCard";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";

export default function TrackClaim() {
  const { token } = useParams<{ token: string }>();
  const { claim, loading, error, lastUpdated, refresh } = usePublicTracking(
    token || "",
  );

  if (loading && !claim) {
    return (
      <div className="min-h-screen bg-surface">
        <LoadingState message="جارٍ تحميل معلومات المطالبة..." />
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-surface">
        <ErrorView error={error} onRetry={() => void refresh()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface" dir="rtl">
      {/* Header */}
      <div className="border-b border-border bg-surface-primary">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
                <Shield size={16} />
                <span>تتبع المطالبة</span>
              </div>
              <h1 className="text-2xl font-bold text-text">
                {claim.claimNumber}
              </h1>
            </div>
            <Button
              variant="secondary"
              icon={<RefreshCw size={15} />}
              onClick={() => void refresh()}
              disabled={loading}
            >
              تحديث
            </Button>
          </div>

          {/* Status Badge */}
          <div className="mt-4">
            <ClaimStatusBadge
              status={claim.status}
              description={claim.statusDescription}
              size="lg"
            />
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <p className="mt-3 text-xs text-text-muted">
              آخر تحديث: {lastUpdated.toLocaleTimeString("ar-SA")}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Timeline - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-surface-primary p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-text">
                سير المعاملة
              </h2>
              <PublicTimeline events={claim.timeline} />
            </div>
          </div>

          {/* Info Card - Takes 1 column */}
          <div className="lg:col-span-1">
            <TrackingInfoCard claim={claim} />
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 rounded-lg border border-border bg-surface-secondary p-4">
          <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
            <Lock size={16} className="text-text-muted" />
            <p>هذا الرابط خاص بك فقط. لا تشاركه مع أي شخص آخر.</p>
          </div>
          <p className="mt-1 text-center text-xs text-text-muted">
            يتم تحديث المعلومات تلقائياً كل 45 ثانية
          </p>
        </div>
      </div>
    </div>
  );
}

interface ErrorViewProps {
  error: string;
  onRetry: () => void;
}

function ErrorView({ error, onRetry }: ErrorViewProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger-bg">
          <AlertCircle size={32} className="text-danger" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-text">
          غير قادر على تحميل المطالبة
        </h1>

        <p className="mb-6 text-text-muted" dir="rtl">
          {error}
        </p>

        <Button onClick={onRetry} icon={<RefreshCw size={15} />}>
          إعادة المحاولة
        </Button>

        <div className="mt-8 rounded-lg border border-border bg-surface-secondary p-4">
          <div className="flex items-start gap-2 text-sm text-text-muted" dir="rtl">
            <Lightbulb size={18} className="mt-0.5 shrink-0 text-warning" />
            <p>
              <strong>نصيحة:</strong> تأكد من أنك تستخدم الرابط الكامل المُرسل إليك من
              شركة التأمين.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
