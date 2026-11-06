"use client";

import { ChevronRight, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CallbackSheet } from "@/components/CallbackSheet";
import { PhoneShell } from "@/components/PhoneShell";
import { EncryptedNotice } from "@/components/Pills";
import { useAppStore } from "@/lib/store";

const STEPS = [
  "Answer questions about your cycle, health and history",
  "See your recommendation and the reasons behind it",
  "Book a specialist, or talk to a counsellor first",
];

export default function LandingPage() {
  const router = useRouter();
  const lead = useAppStore((s) => s.lead);
  const startOver = useAppStore((s) => s.startOver);
  const setCheckNavDirection = useAppStore((s) => s.setCheckNavDirection);
  const [callOpen, setCallOpen] = useState(false);

  return (
    <PhoneShell lineArt="feature">
      <div className="flex flex-1 flex-col">
        <h1 className="mt-2 text-[1.625rem] tall:mt-4 tall:text-[1.875rem] font-bold leading-[1.2] text-ink">
          Should you see a <br />
          fertility specialist?
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
          Take a 2-minute check. Answer 7 quick questions and get a clear recommendation based on clinical guidelines,
          developed with Motherhood&apos;s fertility specialists.
        </p>

        <ol className="mt-6 space-y-3 short:mt-4 short:space-y-2 tall:mt-8">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className="flex items-start gap-3 rounded-2xl border border-sky-line bg-white/90 px-5 py-4 text-[0.9375rem] short:py-3 text-ink"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[0.8125rem] font-bold text-white"
                aria-hidden
              >
                {i + 1}
              </span>
              <span className="pt-0.5 leading-snug">{label}</span>
            </li>
          ))}
        </ol>

        <div className="mt-7 space-y-3 short:mt-5 tall:mt-9">
          <button
            type="button"
            onClick={() => {
              startOver();
              setCheckNavDirection("forward");
              router.push("/check/1");
            }}
            className="press shine shine-interactive cta-hover bg-cta inline-flex h-14 w-full items-center justify-center gap-2 rounded-full text-[1.0625rem] font-semibold text-white shadow-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Begin the check
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setCallOpen(true)}
            className="press inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-line bg-white text-[1.0625rem] font-semibold text-brand transition hover:bg-brand-soft/40"
          >
            Request for call
            <Phone className="h-4 w-4 fill-brand" aria-hidden />
          </button>
        </div>

        <div className="mt-auto pt-8">
          <EncryptedNotice />
        </div>
      </div>

      <CallbackSheet
        open={callOpen}
        onClose={() => setCallOpen(false)}
        reason="general"
        defaultName={lead.name}
        defaultPhone={lead.phone}
      />
    </PhoneShell>
  );
}
