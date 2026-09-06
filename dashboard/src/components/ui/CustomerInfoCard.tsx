import { User } from "lucide-react";
import type { CustomerInfo } from "../../types";

interface InfoRowProps {
  label: string;
  value?: string | null;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm text-text">{value ?? "—"}</p>
    </div>
  );
}

interface CustomerInfoCardProps {
  customer: CustomerInfo;
}

export default function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <User size={18} className="text-primary shrink-0" />
        <h2 className="text-lg font-semibold text-text">Customer Information</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <InfoRow label="Customer Name" value={customer.name} />
        <InfoRow label="Phone Number"  value={customer.phone} />
      </div>
    </section>
  );
}
