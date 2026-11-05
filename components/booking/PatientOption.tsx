"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function PatientOption({
  selected,
  onSelect,
  title,
  detail,
  icon,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  detail: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`press flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
        selected ? "border-brand bg-brand-soft/40" : "border-line bg-white hover:border-brand/40"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[0.9375rem] font-bold text-navy">
          {icon}
          <span className="truncate">{title}</span>
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-[0.75rem] text-muted">{detail}</span>
      </span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-brand bg-brand text-white" : "border-slate-300"
        }`}
        aria-hidden
      >
        {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}
