"use client";

import { ChevronDown } from "lucide-react";
import { useId, type InputHTMLAttributes, type ReactNode } from "react";

function IndiaFlag() {
  return (
    <svg viewBox="0 0 30 20" className="h-3.5 w-5 overflow-hidden rounded-[2px]" aria-hidden>
      <rect width="30" height="20" fill="#fff" />
      <rect width="30" height="6.67" fill="#ff9933" />
      <rect y="13.33" width="30" height="6.67" fill="#138808" />
      <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" strokeWidth="0.8" />
    </svg>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  trailing?: ReactNode;
}

export function TextField({ label, value, onChange, error, trailing, ...rest }: TextFieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[0.9375rem] font-bold text-navy">
        {label}
      </label>
      <div
        className={`flex h-[3.25rem] items-center rounded-xl border bg-white px-4 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 ${
          error ? "border-brand" : "border-line"
        }`}
      >
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-[1rem] text-ink outline-none placeholder:text-slate-400"
          {...rest}
        />
        {trailing}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[0.8125rem] text-brand-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function PhoneField({
  label = "Mobile number",
  value,
  onChange,
  error,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[0.9375rem] font-bold text-navy">
        {label}
      </label>
      <div
        className={`flex h-[3.25rem] items-stretch overflow-hidden rounded-xl border bg-white transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 ${
          error ? "border-brand" : "border-line"
        }`}
      >
        <div className="flex items-center gap-1.5 border-r border-line bg-slate-50/80 px-3.5 text-[0.9375rem] font-medium text-ink">
          <IndiaFlag />
          +91
          <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden />
        </div>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="10-digit number"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent px-4 text-[1rem] text-ink outline-none placeholder:text-slate-400"
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[0.8125rem] text-brand-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}
