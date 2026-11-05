"use client";

import Link from "next/link";
import { HeartSpinner } from "@/components/HeartSpinner";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "pink" | "maroon" | "solid";

const fills: Record<Tone, string> = {
  pink: "bg-cta",
  maroon: "bg-cta-maroon",
  solid: "bg-[#d1506f]",
};

const base =
  "press inline-flex w-full items-center justify-center gap-2 rounded-full px-6 text-[1.0625rem] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed";

function primaryClasses(tone: Tone) {
  return `${base} ${fills[tone]} h-14 text-white shadow-cta hover:brightness-105 active:brightness-95 disabled:opacity-55 disabled:shadow-none`;
}

const secondaryClasses = `${base} h-14 border border-line bg-white text-brand shadow-sm hover:bg-brand-soft/40 disabled:opacity-55`;

const outlineClasses = `${base} h-14 border-[1.5px] border-navy bg-white text-navy hover:bg-slate-50 disabled:opacity-55`;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  tone?: Tone;
  children: ReactNode;
}

export function PrimaryButton({ loading, tone = "pink", children, className = "", disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`${primaryClasses(tone)} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <HeartSpinner /> : null}
      {children}
    </button>
  );
}

export function SecondaryButton({ loading, children, className = "", disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`${secondaryClasses} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <HeartSpinner /> : null}
      {children}
    </button>
  );
}

export function OutlineButton({ loading, children, className = "", disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`${outlineClasses} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <HeartSpinner /> : null}
      {children}
    </button>
  );
}

export function PrimaryLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`${primaryClasses("pink")} ${className}`}>
      {children}
    </Link>
  );
}
