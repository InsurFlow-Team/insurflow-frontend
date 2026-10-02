import type { ReactNode } from "react";

interface DetailSectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export default function DetailSection({
  title,
  action,
  children,
}: DetailSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        {action}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}