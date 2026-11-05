import { Lock, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export function ConfidentialPill() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-line bg-slate-50/90 px-4 py-3.5 text-[0.8125rem] text-muted">
      <Lock className="h-4 w-4 text-info" strokeWidth={2.2} aria-hidden />
      100% confidential clinical guidance
    </div>
  );
}

export function EncryptedNotice() {
  return (
    <div className="space-y-3 text-center">
      <div className="flex items-center gap-3 rounded-full border border-line bg-slate-50/90 px-5 py-3 text-left text-[0.8125rem] leading-snug text-muted">
        <ShieldCheck className="h-5 w-5 shrink-0 text-success" aria-hidden />
        Your health data is 256-bit encrypted &amp; strictly confidential.
      </div>
      <p className="text-[0.8125rem] text-muted">No spam calls · Only verified medical specialists</p>
    </div>
  );
}

type BadgeTone = "warning" | "success" | "neutral";

const badgeTones: Record<BadgeTone, string> = {
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  neutral: "border-line bg-slate-50 text-muted",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}
