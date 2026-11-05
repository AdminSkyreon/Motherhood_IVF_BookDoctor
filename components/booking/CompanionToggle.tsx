"use client";

import { UserRound, Users } from "lucide-react";
import { tapFeedback } from "@/lib/haptics";
import type { Companion } from "@/lib/types";

const OPTIONS: { id: Companion; label: string; short: string; icon: typeof Users }[] = [
  { id: "partner", label: "Partner with patient", short: "With partner", icon: Users },
  { id: "alone", label: "Coming alone", short: "Coming alone", icon: UserRound },
];

export function companionLabel(companion: Companion): string {
  return OPTIONS.find((o) => o.id === companion)?.label ?? "";
}

export function CompanionToggle({
  value,
  onChange,
}: {
  value: Companion | null;
  onChange: (value: Companion) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Who is coming">
      {OPTIONS.map(({ id, label, short, icon: Icon }) => {
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => {
              tapFeedback();
              onChange(id);
            }}
            className={`press flex h-10 items-center justify-center gap-1.5 rounded-xl short:h-9 tall:h-12 border px-2 text-[0.8125rem] font-semibold ${
              active ? "animate-select-pop border-navy bg-navy/5 text-navy" : "border-line bg-white text-muted"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{short}</span>
          </button>
        );
      })}
    </div>
  );
}
