"use client";

import {
  Activity,
  Baby,
  CalendarDays,
  CalendarHeart,
  ChevronRight,
  Clock,
  HeartPulse,
  type LucideIcon,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type CSSProperties, useMemo } from "react";
import { BackButton } from "@/components/BackButton";
import { BrandLoader } from "@/components/BrandLoader";
import { PhoneShell } from "@/components/PhoneShell";
import { ScoreGauge } from "@/components/ScoreGauge";
import { CENTRES, DOCTORS } from "@/lib/data/centres";
import {
  buildInsights,
  HIGH_SCORE_SUMMARY_THRESHOLD,
  LOW_SCORE_SUMMARY_THRESHOLD,
  type InsightTopic,
} from "@/lib/insights";
import { TOTAL_QUESTIONS } from "@/lib/questions";
import { BAND_COPY } from "@/lib/score";
import { useAppStore } from "@/lib/store";
import type { Band } from "@/lib/types";
import { useFlowGuard } from "@/lib/useFlowGuard";

const HERO_TONES: Record<Band, { card: string; heading: string; chip: string; body: string }> = {
  low: {
    card: "border-sky-200 bg-sky-50/70",
    heading: "text-info",
    chip: "bg-sky-100 text-info",
    body: "text-ink/80",
  },
  moderate: {
    card: "border-brand-line bg-brand-soft/60",
    heading: "text-brand",
    chip: "bg-white text-brand",
    body: "text-ink/80",
  },
  high: {
    card: "border-brand-line bg-brand-soft/70",
    heading: "text-brand-dark",
    chip: "bg-white text-brand-dark",
    body: "text-ink/80",
  },
};

/** Score below 70: calm blue personalised summary. */
const BLUE_SUMMARY_TONE = {
  card: "border-sky-line bg-sky-50/90 shadow-[0_8px_24px_-14px_rgb(11_116_184/0.25)]",
  heading: "text-info",
  chip: "bg-info text-white",
  body: "text-ink/85",
};

/** Score above 80: full pink personalised summary (matches reassuring moderate copy). */
const PINK_SUMMARY_TONE = {
  card: "border-brand-line bg-brand-soft shadow-[0_8px_24px_-14px_rgb(217_80_111/0.4)]",
  heading: "text-brand-dark",
  chip: "bg-brand text-white",
  body: "text-ink/85",
};

function summaryTone(score: number, band: Band) {
  if (score > HIGH_SCORE_SUMMARY_THRESHOLD) return PINK_SUMMARY_TONE;
  if (score < LOW_SCORE_SUMMARY_THRESHOLD) return BLUE_SUMMARY_TONE;
  return HERO_TONES[band];
}

const TOPIC_ICONS: Record<InsightTopic, LucideIcon> = {
  duration: Clock,
  age: CalendarHeart,
  periods: Activity,
  conditions: HeartPulse,
  pregnancy: Baby,
  treatment: Stethoscope,
  semen: Users,
};

const CITIES = new Set(CENTRES.map((c) => c.city)).size;

const TRUST = [
  { icon: Stethoscope, label: `${DOCTORS.length} fertility specialists` },
  { icon: MapPin, label: `Centres in ${CITIES} cities` },
  { icon: ShieldCheck, label: "Private & confidential" },
];

const rise = (i: number) => ({ "--i": i }) as CSSProperties;

export default function ResultsPage() {
  const ready = useFlowGuard("result");
  const result = useAppStore((s) => s.result);
  const answers = useAppStore((s) => s.answers);
  const lead = useAppStore((s) => s.lead);
  const insights = useMemo(
    () => (result ? buildInsights(answers, result.band, result.score) : null),
    [answers, result],
  );

  if (!ready || !result || !insights) {
    return (
      <PhoneShell lineArt="feature">
        <BrandLoader className="flex-1" caption="Preparing your results…" />
      </PhoneShell>
    );
  }

  const copy = BAND_COPY[result.band];
  const tone = summaryTone(result.score, result.band);
  const firstName = lead.name.trim().split(/\s+/)[0];

  return (
    <PhoneShell
      lineArt="feature"
      footer={
        <Link
          href="/book/patient"
          className="press shine shine-interactive cta-hover bg-cta inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-4 text-[1rem] font-semibold text-white shadow-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand short:h-11"
        >
          <CalendarDays className="h-5 w-5 shrink-0" aria-hidden />
          Book your consultation
          <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
        </Link>
      }
    >
      <BackButton href={`/check/${TOTAL_QUESTIONS}`} label="Review your answers" />

      <section
        className="mt-5 rounded-[1.25rem] border border-sky-line bg-white px-5 pb-5 pt-4 shadow-card"
        aria-labelledby="score-title"
      >
        <h1 id="score-title" className="text-[1.0625rem] font-semibold text-[#2d3748]">
          {firstName ? `${firstName}, here's your fertility score` : "Your fertility score"}
        </h1>
        <div className="mt-2">
          <ScoreGauge score={result.score} answered={TOTAL_QUESTIONS} />
        </div>
        <p className="sr-only">
          Your score is {result.score} out of 100, which is in the {copy.label.toLowerCase()} range.
        </p>
      </section>

      <section className={`animate-rise mt-5 rounded-[1.25rem] border px-5 py-5 ${tone.card}`} style={rise(1)}>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.75rem] font-semibold ${tone.chip}`}
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Your personalised summary
        </span>
        <h2 className={`mt-3 text-[1.25rem] font-bold leading-snug ${tone.heading}`}>{insights.headline}</h2>
        <p className={`mt-2 text-[0.9375rem] leading-relaxed ${tone.body}`}>{insights.subhead}</p>
      </section>

      {insights.findings.length > 0 && (
        <section className="mt-7 short:mt-5" aria-labelledby="findings-title">
          <h2 id="findings-title" className="text-[1.0625rem] font-bold text-navy">
            What your answers tell us
          </h2>
          <ul className="mt-3 space-y-2.5">
            {insights.findings.map((finding, i) => {
              const Icon = TOPIC_ICONS[finding.topic];
              const positive = finding.tone === "positive";
              return (
                <li
                  key={finding.topic}
                  className="animate-rise flex gap-3 rounded-2xl border border-line bg-white px-4 py-3.5"
                  style={rise(2 + i)}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      positive ? "bg-emerald-50 text-success" : "bg-brand-soft text-brand"
                    }`}
                  >
                    <Icon className="h-[1.375rem] w-[1.375rem]" strokeWidth={1.8} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.9375rem] font-semibold text-ink">{finding.title}</p>
                    <p className="mt-0.5 text-[0.875rem] leading-relaxed text-muted">{finding.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-7 short:mt-5" aria-labelledby="steps-title">
        <h2 id="steps-title" className="text-[1.0625rem] font-bold text-navy">
          Your recommended next steps
        </h2>
        <p className="mt-1 text-[0.8125rem] text-muted">Based on your answers, a specialist may suggest:</p>
        <ol className="mt-3 rounded-2xl border border-sky-line bg-white px-4 py-1">
          {insights.nextSteps.map((step, i) => (
            <li key={step.id} className="flex gap-3 border-b border-line/70 py-3.5 last:border-b-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-[0.8125rem] font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[0.9375rem] font-semibold text-ink">{step.title}</p>
                <p className="mt-0.5 text-[0.875rem] leading-relaxed text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <ul className="mt-7 grid short:mt-5 grid-cols-3 gap-2" aria-label="Why Motherhood">
        {TRUST.map(({ icon: Icon, label }) => (
          <li key={label} className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-50 px-2 py-3 text-center">
            <Icon className="h-6 w-6 text-navy" strokeWidth={1.8} aria-hidden />
            <span className="text-[0.75rem] font-medium leading-tight text-ink/80">{label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-1.5 text-center">
        <p className="text-[0.875rem] font-bold text-ink/80">Take a deep breath. You&apos;re not alone in this.</p>
        <p className="text-[0.8125rem] leading-relaxed text-muted">
          This check gives guidance based on clinical guidelines. It is not a diagnosis; only tests and a consultation
          can assess fertility.
        </p>
      </div>

    </PhoneShell>
  );
}
