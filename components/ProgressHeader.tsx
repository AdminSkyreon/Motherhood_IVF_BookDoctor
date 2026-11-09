import type { ReactNode } from "react";

export function ProgressHeader({
  step,
  total,
  leading,
  meta,
}: {
  step: number;
  total: number;
  /** Sits on the same line as the progress bar, vertically centered with it. */
  leading?: ReactNode;
  meta?: ReactNode;
}) {
  const percent = Math.round((step / total) * 100);
  return (
    <div className="space-y-2.5">
      {meta ? <div className="flex justify-end">{meta}</div> : null}
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-brand">
          Question {step} of {total}
        </p>
        <p className="shrink-0 text-[0.75rem] text-muted">{percent}% completed</p>
      </div>
      <div className="flex items-center gap-3">
        {leading}
        <div
          className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200/80"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Check progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-300 to-brand transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
