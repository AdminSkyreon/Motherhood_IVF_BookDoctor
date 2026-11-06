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
      className={`press flex min-h-[4.25rem] w-full items-center gap-3.5 rounded-2xl border py-3 pl-3 pr-5 text-left text-[1rem] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info ${
        selected
          ? "border-sky-line bg-sky-50/70 font-semibold text-navy shadow-[0_8px_20px_-14px_rgb(11_116_184/0.35)]"
          : "border-line bg-white font-medium text-ink shadow-sm hover:border-sky-line hover:bg-sky-50/40"
      }`}
    >
      <span
        aria-hidden
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
          selected ? "bg-sky-50 text-info" : "bg-slate-50 text-navy"
        }`}
      >
        {badge ? (
          <span className="text-[0.8125rem] font-bold tracking-tight">{badge}</span>
        ) : icon ? (
          <OptionIcon name={icon} className="h-6 w-6" />
        ) : null}
      </span>
      <span className="flex-1">{label}</span>
      {multi ? (
        <span
          aria-hidden
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-[1.5px] transition ${
            selected ? "border-info bg-info text-white" : "border-slate-300 bg-white"
          }`}
        >
          {selected ? <Check className="animate-select-pop h-3.5 w-3.5" strokeWidth={3} /> : null}
        </span>
      ) : (
        <span
          aria-hidden
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${
            selected ? "bg-info text-white" : "border-[1.5px] border-slate-300 bg-white"
          }`}
        >
          {selected ? <Check className="animate-select-pop h-3.5 w-3.5" strokeWidth={3} /> : null}
        </span>
      )}
    </button>
  );
}
