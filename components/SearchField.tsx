"use client";

import { Search, X } from "lucide-react";
import { useId, type InputHTMLAttributes } from "react";

export function SearchField({
  label,
  value,
  onChange,
  className = "",
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-info focus-within:ring-2 focus-within:ring-info/15">
        <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent text-[0.9375rem] text-ink outline-none placeholder:text-slate-400"
          {...rest}
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="press flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-slate-100"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
