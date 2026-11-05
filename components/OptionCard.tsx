"use client";

import { Check } from "lucide-react";
import { OptionIcon } from "@/components/OptionIcon";
import type { OptionIcon as OptionIconName } from "@/lib/questions";

export function OptionCard({
  label,
  icon,
  badge,
  selected,
  multi,
  onSelect,
}: {
  label: string;
  icon?: OptionIconName;
  badge?: string;
  selected: boolean;
  multi?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
      className={`press flex min-h-[4.25rem] w-full items-center gap-3.5 rounded-2xl border bg-white py-3 pl-3 pr-5 text-left text-[1rem] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        selected
          ? "border-[1.5px] border-brand font-semibold text-brand shadow-[0_8px_20px_-12px_rgb(217_80_111/0.6)]"
          : "border-line font-medium text-ink shadow-sm hover:border-brand-line"
      }`}
    >
      <span
        aria-hidden
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
          selected ? "bg-brand-soft text-brand" : "bg-slate-50 text-navy"
        }`}
      >
        {badge ? (
          <span className="text-[0.8125rem] font-bold tracking-tight">{badge}</span>
        ) : icon ? (
          <OptionIcon name={icon} className="h-6 w-6" />
        ) : null}
      </span>
      <span className="flex-1">{label}</span>
      <span
        aria-hidden
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${
          selected ? "bg-brand text-white" : "border-[1.5px] border-slate-300 bg-white"
        }`}
      >
        {selected ? <Check className="animate-select-pop h-3.5 w-3.5" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}
