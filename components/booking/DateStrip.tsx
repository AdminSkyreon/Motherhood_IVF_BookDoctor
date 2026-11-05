"use client";

import { useEffect, useRef } from "react";
import { formatDayParts } from "@/lib/format";
import { tapFeedback } from "@/lib/haptics";
import type { SlotDay } from "@/lib/types";

export function DateStrip({
  days,
  activeDate,
  onPick,
}: {
  days: SlotDay[];
  activeDate: string | null;
  onPick: (date: string) => void;
}) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!strip || !active) return;
    const left = active.offsetLeft - strip.offsetLeft;
    if (left < strip.scrollLeft || left + active.offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: Math.max(0, left - strip.clientWidth / 2 + active.offsetWidth / 2), behavior: "smooth" });
    }
  }, [activeDate]);

  return (
    <div
      ref={stripRef}
      className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="listbox"
      aria-label="Available dates"
    >
      {days.map((day) => {
        const { weekday, day: dayNum, month, long } = formatDayParts(day.date);
        const open = day.slots.filter((s) => s.available).length;
        const disabled = day.closed || open === 0;
        const active = day.date === activeDate;
        return (
          <button
            key={day.date}
            type="button"
            role="option"
            aria-selected={active}
            aria-label={`${long}${day.closed ? ", closed" : open === 0 ? ", fully booked" : `, ${open} slots`}`}
            disabled={disabled}
            onClick={() => {
              tapFeedback();
              onPick(day.date);
            }}
            className={`press flex h-[3.625rem] w-[3.25rem] short:h-[3.25rem] tall:h-16 tall:w-14 shrink-0 snap-start flex-col items-center justify-center rounded-2xl border ${
              active
                ? "animate-select-pop border-navy bg-navy text-white shadow-card"
                : disabled
                  ? "border-line bg-slate-50 text-slate-400"
                  : "border-line bg-white text-ink hover:border-navy/40"
            }`}
          >
            <span className={`text-[0.6875rem] font-medium leading-none ${active ? "text-white/80" : ""}`}>{weekday}</span>
            <span className="mt-1 text-[1.125rem] font-bold leading-none">{dayNum}</span>
            <span className={`mt-1 text-[0.625rem] leading-none ${active ? "text-white/80" : disabled ? "" : "text-muted"}`}>
              {day.closed ? "Closed" : open === 0 ? "Full" : month}
            </span>
          </button>
        );
      })}
    </div>
  );
}
