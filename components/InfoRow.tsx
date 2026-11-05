import type { ReactNode } from "react";

export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-[0.875rem] text-muted">{label}</dt>
      <dd className="text-right text-[0.875rem] font-semibold text-navy">{children}</dd>
    </div>
  );
}
