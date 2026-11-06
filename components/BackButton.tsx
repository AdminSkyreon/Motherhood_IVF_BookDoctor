"use client";

import Link from "next/link";
import { ArrowLeft, ChevronLeft } from "lucide-react";

export function BackButton({
  href,
  label = "Go back",
  variant = "chevron",
  onNavigate,
}: {
  href: string;
  label?: string;
  variant?: "chevron" | "arrow";
  onNavigate?: () => void;
}) {
  const Icon = variant === "arrow" ? ArrowLeft : ChevronLeft;
  return (
    <Link
      href={href}
      onClick={() => onNavigate?.()}
      aria-label={label}
      className="press inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-white text-navy shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <Icon className="h-5 w-5" strokeWidth={2.2} />
    </Link>
  );
}
