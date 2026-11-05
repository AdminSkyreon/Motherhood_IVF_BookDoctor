"use client";

import { X } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (open) wasOpenRef.current = true;
  }, [open]);

  // Pages stay mounted (hidden) after navigation; close so the sheet isn't open on return.
  useLayoutEffect(
    () => () => {
      if (wasOpenRef.current) onCloseRef.current();
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  // Portaled so sticky page chrome (header, action bars) can never stack above the sheet.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="animate-fade-in absolute inset-0 bg-navy/40" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-sheet-up relative max-h-[88dvh] w-full max-w-[430px] overflow-y-auto overscroll-contain rounded-t-[1.75rem] bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(27,43,75,0.18)] outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          aria-hidden
          tabIndex={-1}
          className="mx-auto mb-4 flex h-4 w-16 items-center justify-center"
        >
          <span className="h-1.5 w-10 rounded-full bg-slate-300" aria-hidden />
        </button>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-[1.1875rem] font-bold text-navy">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
