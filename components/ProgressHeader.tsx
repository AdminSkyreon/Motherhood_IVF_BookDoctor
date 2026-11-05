export function ProgressHeader({ step, total }: { step: number; total: number }) {
  const percent = Math.round((step / total) * 100);
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-brand">
          Question {step} of {total}
        </p>
        <p className="text-[0.75rem] text-muted">{percent}% completed</p>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80"
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
  );
}
