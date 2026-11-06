"use client";

import { ChevronRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { BackButton } from "@/components/BackButton";
import { PrimaryButton } from "@/components/Buttons";
import { OptionCard } from "@/components/OptionCard";
import { PhoneShell } from "@/components/PhoneShell";
import { ConfidentialPill } from "@/components/Pills";
import { ProgressHeader } from "@/components/ProgressHeader";
import { QUESTIONS, TOTAL_QUESTIONS, firstUnansweredStep, isAnswered, type Question } from "@/lib/questions";
import { useAppStore } from "@/lib/store";

const AUTO_ADVANCE_MS = 480;
const EMPTY: string[] = [];

function toggle(question: Question, selected: string[], optionId: string): string[] {
  const option = question.options.find((o) => o.id === optionId);
  if (!option) return selected;
  if (selected.includes(optionId)) return selected.filter((id) => id !== optionId);
  if (option.exclusive) return [optionId];
  const exclusiveIds = question.options.filter((o) => o.exclusive).map((o) => o.id);
  return [...selected.filter((id) => !exclusiveIds.includes(id)), optionId];
}

export function QuestionStep({ step }: { step: number }) {
  const question = QUESTIONS[step - 1];
  const router = useRouter();
  const hydrated = useAppStore((s) => s.hydrated);
  const answers = useAppStore((s) => s.answers);
  const selected = useAppStore((s) => s.answers[question.id] ?? EMPTY);
  const setAnswer = useAppStore((s) => s.setAnswer);
  const setCheckNavDirection = useAppStore((s) => s.setCheckNavDirection);
  const checkNavDirection = useAppStore((s) => s.checkNavDirection);
  const swapClass =
    checkNavDirection === "back" ? "animate-question-swap-back" : "animate-question-swap-forward";
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goNext = () => {
    setCheckNavDirection("forward");
    router.push(nextHref);
  };

  const nextHref = step < TOTAL_QUESTIONS ? `/check/${step + 1}` : "/results/verify";
  const backHref = step > 1 ? `/check/${step - 1}` : "/";

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const pending = firstUnansweredStep(answers);
    if (pending !== null && pending < step) router.replace(`/check/${pending}`);
  }, [hydrated, answers, step, router]);

  useEffect(() => {
    router.prefetch(nextHref);
  }, [router, nextHref]);

  const choose = (optionId: string) => {
    if (question.multi) {
      setAnswer(question.id, toggle(question, selected, optionId));
      return;
    }
    setAnswer(question.id, [optionId]);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(goNext, AUTO_ADVANCE_MS);
  };

  const canContinue = isAnswered(question, selected);

  return (
    <PhoneShell
      footer={
        question.multi ? (
          <PrimaryButton disabled={!canContinue} onClick={goNext} className="h-12 short:h-11">
            Continue
            <ChevronRight className="h-5 w-5" aria-hidden />
          </PrimaryButton>
        ) : undefined
      }
    >
      <div className="flex items-center justify-between">
        <BackButton href={backHref} onNavigate={() => setCheckNavDirection("back")} />
        {step === 1 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/90 px-3 py-1.5 text-[0.8125rem] text-muted">
            <Clock className="h-4 w-4" aria-hidden />
            Takes 2 mins
          </span>
        ) : null}
      </div>

      <div className="mt-5">
        <ProgressHeader step={step} total={TOTAL_QUESTIONS} />
      </div>

      <div key={step} className={`question-swap-region ${swapClass}`}>
        <h1 id={`q-${question.id}`} className="mt-8 text-[1.625rem] font-bold leading-[1.25] text-ink short:mt-5 tall:mt-10">
          {question.title}
        </h1>
        {question.subtitle ? <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{question.subtitle}</p> : null}

        <div
          role={question.multi ? "group" : "radiogroup"}
          aria-labelledby={`q-${question.id}`}
          className="mt-6 space-y-3 short:mt-4 short:space-y-2 tall:mt-8"
        >
          {question.options.map((option) => (
            <OptionCard
              key={option.id}
              label={option.label}
              icon={option.icon}
              badge={option.badge}
              multi={question.multi}
              selected={selected.includes(option.id)}
              onSelect={() => choose(option.id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-7">
        <ConfidentialPill />
      </div>
    </PhoneShell>
  );
}
