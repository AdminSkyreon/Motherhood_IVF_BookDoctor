import { QUESTIONS, type Question } from "@/lib/questions";
import type { Answers, Band, ScoreResult } from "@/lib/types";

// Placeholder weights and thresholds; to be tuned by the clinical team.
const LOW_MAX = 33;
const MODERATE_MAX = 66;

function questionMax(question: Question): number {
  if (question.multi) {
    const sum = question.options.reduce((acc, o) => acc + o.weight, 0);
    return Math.min(sum, question.maxWeight ?? sum);
  }
  return Math.max(...question.options.map((o) => o.weight));
}

function questionWeight(question: Question, selected: string[]): number {
  const sum = question.options
    .filter((o) => selected.includes(o.id))
    .reduce((acc, o) => acc + o.weight, 0);
  return Math.min(sum, questionMax(question));
}

export function bandFor(score: number): Band {
  if (score <= LOW_MAX) return "low";
  if (score <= MODERATE_MAX) return "moderate";
  return "high";
}

export function computeScore(answers: Answers): ScoreResult {
  let total = 0;
  let max = 0;
  for (const question of QUESTIONS) {
    total += questionWeight(question, answers[question.id] ?? []);
    max += questionMax(question);
  }
  const score = max === 0 ? 0 : Math.round((total / max) * 100);
  return { score, band: bandFor(score) };
}

export const BAND_COPY: Record<Band, { label: string; heading: string; body: string }> = {
  low: {
    label: "Low",
    heading: "You're on a healthy track.",
    body: "Your answers don't show major concerns right now. If you've been trying for a while or simply want peace of mind, a specialist can guide your next steps.",
  },
  moderate: {
    label: "Moderate",
    heading: "Don't lose hope. You can still get there.",
    body: "Your answers show a few things that should get a specialist's attention. Many couples get the same score and still have a baby with the right care.",
  },
  high: {
    label: "High",
    heading: "You're not alone. Help is close.",
    body: "Your answers suggest now is a good time to see a fertility specialist. Early, expert care gives you the best chance, and many couples in your position go on to have a baby.",
  },
};
