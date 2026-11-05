"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

export function OtpInput({
  length = 4,
  value,
  onChange,
  invalid,
  autoFocus,
  resetKey = 0,
}: {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  autoFocus?: boolean;
  /** Changing this moves focus back to the first box. */
  resetKey?: number;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focused, setFocused] = useState<number | null>(null);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (resetKey > 0) refs.current[0]?.focus();
  }, [resetKey]);

  const focusAt = (index: number) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, index))];
    el?.focus();
    el?.select();
  };

  const writeFrom = (index: number, incoming: string) => {
    const clean = incoming.replace(/\D/g, "");
    if (!clean) return;
    const next = digits.slice();
    let cursor = index;
    for (const ch of clean) {
      if (cursor >= length) break;
      next[cursor] = ch;
      cursor += 1;
    }
    onChange(next.join("").slice(0, length));
    focusAt(Math.min(cursor, length - 1));
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = digits.slice();
      if (next[index]) {
        next[index] = "";
        onChange(next.join(""));
      } else if (index > 0) {
        next[index - 1] = "";
        onChange(next.join(""));
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    writeFrom(index, e.clipboardData.getData("text"));
  };

  return (
    <div
      className="mx-auto grid max-w-[19rem] gap-2.5"
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
      role="group"
      aria-label="Verification code"
    >
      {digits.map((digit, i) => {
        const isFocused = focused === i;
        return (
          <div key={i} className="relative min-w-0">
            <input
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={digit}
              onChange={(e) => writeFrom(i, e.target.value.slice(-length))}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={(e) => handlePaste(i, e)}
              onFocus={(e) => {
                setFocused(i);
                e.target.select();
              }}
              onBlur={() => setFocused((f) => (f === i ? null : f))}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              autoFocus={autoFocus && i === 0}
              maxLength={length}
              aria-label={`Digit ${i + 1}`}
              aria-invalid={invalid || undefined}
              className={`block aspect-[15/16] w-full rounded-2xl text-center text-[1.625rem] font-bold text-navy caret-brand outline-none transition ${
                isFocused
                  ? "bg-white shadow-[0_8px_24px_-10px_rgb(27_43_75/0.35)] ring-1 ring-line"
                  : "bg-[#eef3fa]"
              } ${invalid ? "ring-2 ring-brand/70" : ""}`}
            />
            {!digit && !isFocused ? (
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300"
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
