"use client";

import { Check, Moon, Sun } from "lucide-react";
import { useEffect, useRef } from "react";
import { formatTime, istHour } from "@/lib/format";
import { tapFeedback } from "@/lib/haptics";
import type { SlotOption } from "@/lib/types";

export type DayPart = "morning" | "evening";

const EVENING_FROM_HOUR = 14;

export function splitByPart(slots: SlotOption[]): Record<DayPart, SlotOption[]> {
  const open = slots.filter((s) => s.available);
  return {
    morning: open.filter((s) => istHour(s.start) < EVENING_FROM_HOUR),
    evening: open.filter((s) => istHour(s.start) >= EVENING_FROM_HOUR),
  };
}

export function TimePicker({
  slots,
  part,
  onPartChange,
  activeStart,
  onPick,
}: {
  slots: SlotOption[];
  part: DayPart;
  onPartChange: (part: DayPart) => void;
  activeStart: string | null;
  onPick: (start: string) => void;
}) {
  const groups = splitByPart(slots);
  const visible = groups[part];
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rowRef.current?.scrollTo({ left: 0 });
  }, [part, slots]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Time of day">
        {(["morning", "evening"] as const).map((p) => {
          const active = p === part;
          const count = groups[p].length;
          const Icon = p === "morning" ? Sun : Moon;
          return (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={count === 0}
              onClick={() => onPartChange(p)}
              className={`press flex h-8 items-center justify-center gap-1.5 rounded-lg tall:h-10 text-[0.8125rem] font-semibold disabled:opacity-45 ${
                active ? "bg-white text-navy shadow-sm" : "text-muted"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${active ? "text-amber-500" : ""}`} aria-hidden />
              {p === "morning" ? "Morning" : "Evening"}
              <span className={`text-[0.6875rem] font-medium ${count <= 3 && count > 0 ? "text-brand" : "text-muted"}`}>
                {count === 0 ? "Full" : count <= 3 ? `${count} left` : count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={rowRef}
        className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="radiogroup"
        aria-label={`${part === "morning" ? "Morning" : "Evening"} times`}
      >
        {visible.length === 0 ? (
          <p className="flex h-10 items-center text-[0.8125rem] text-muted">
            All {part} slots are taken that day. Try the {part === "morning" ? "evening" : "morning"} or another date.
          </p>
        ) : (
          visible.map((slot) => {
            const active = slot.start === activeStart;
            return (
              <button
                key={slot.start}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  tapFeedback();
                  onPick(slot.start);
                }}
                className={`press flex h-10 shrink-0 items-center gap-1 rounded-xl short:h-9 tall:h-12 border px-3.5 text-[0.875rem] font-semibold ${
                  active
                    ? "animate-select-pop border-brand bg-brand text-white shadow-cta"
                    : "border-line bg-white text-ink hover:border-brand-line"
                }`}
              >
                {active ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : null}
                {formatTime(slot.start)}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
