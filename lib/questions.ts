export type OptionIcon =
  | "sprout"
  | "calendar"
  | "calendar-range"
  | "calendar-clock"
  | "hourglass"
  | "calendar-check"
  | "calendar-x"
  | "help"
  | "stethoscope"
  | "activity"
  | "ribbon"
  | "microscope"
  | "shield"
  | "circle-dashed"
  | "baby"
  | "heart-hand"
  | "lock"
  | "pill"
  | "syringe"
  | "flask"
  | "check"
  | "alert"
  | "clock";

export interface QuestionOption {
  id: string;
  label: string;
  icon?: OptionIcon;
  /** Short text shown in place of an icon, e.g. an age range. */
  badge?: string;
  weight: number;
  /** Selecting this option clears every other option in a multi-select question. */
  exclusive?: boolean;
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  multi?: boolean;
  /** Upper bound on the summed weight of a multi-select answer. */
  maxWeight?: number;
  options: QuestionOption[];
}

export const QUESTIONS: Question[] = [
  {
    id: "duration",
    title: "How long have you been trying to conceive?",
    subtitle: "Count from when you stopped using contraception.",
    options: [
      { id: "planning", label: "Planning to start soon", icon: "sprout", weight: 0 },
      { id: "lt6m", label: "Less than 6 months", icon: "calendar", weight: 1 },
      { id: "6to12m", label: "6 to 12 months", icon: "calendar-range", weight: 2 },
      { id: "1to2y", label: "1 to 2 years", icon: "calendar-clock", weight: 3 },
      { id: "gt2y", label: "More than 2 years", icon: "hourglass", weight: 4 },
    ],
  },
  {
    id: "age",
    title: "What is your age?",
    subtitle: "If you're filling this in for your wife or partner, choose her age.",
    options: [
      { id: "lt30", label: "Under 30", badge: "<30", weight: 0 },
      { id: "30to34", label: "30 to 34", badge: "30–34", weight: 1 },
      { id: "35to39", label: "35 to 39", badge: "35–39", weight: 3 },
      { id: "40plus", label: "40 or above", badge: "40+", weight: 4 },
    ],
  },
  {
    id: "periods",
    title: "How regular are your periods?",
    subtitle: "A regular cycle usually comes every 21 to 35 days.",
    options: [
      { id: "regular", label: "Regular", icon: "calendar-check", weight: 0 },
      { id: "irregular", label: "Irregular or often missed", icon: "calendar-x", weight: 3 },
      { id: "unsure", label: "Not sure", icon: "help", weight: 1 },
    ],
  },
  {
    id: "conditions",
    title: "Has a doctor told you that you have any of these?",
    subtitle: "Select all that apply.",
    multi: true,
    maxWeight: 4,
    options: [
      { id: "pcos", label: "PCOD or PCOS", icon: "stethoscope", weight: 2 },
      { id: "thyroid", label: "Thyroid condition", icon: "activity", weight: 1 },
      { id: "endometriosis", label: "Endometriosis", icon: "ribbon", weight: 3 },
      { id: "fibroids", label: "Fibroids", icon: "microscope", weight: 2 },
      { id: "none", label: "None of these", icon: "shield", weight: 0, exclusive: true },
    ],
  },
  {
    id: "pregnancy",
    title: "Have you been pregnant before?",
    options: [
      { id: "no", label: "No", icon: "circle-dashed", weight: 1 },
      { id: "yes", label: "Yes", icon: "baby", weight: 0 },
      { id: "miscarriage", label: "Yes, but it ended in a miscarriage", icon: "heart-hand", weight: 2 },
      { id: "prefer-not", label: "Prefer not to say", icon: "lock", weight: 1 },
    ],
  },
  {
    id: "treatment",
    title: "Have you had any fertility treatment so far?",
    subtitle: "Select the most recent treatment.",
    options: [
      { id: "none", label: "No treatments yet", icon: "circle-dashed", weight: 0 },
      { id: "ovulation", label: "Medicines to help ovulation", icon: "pill", weight: 2 },
      { id: "iui", label: "IUI", icon: "syringe", weight: 3 },
      { id: "ivf", label: "IVF", icon: "flask", weight: 4 },
    ],
  },
  {
    id: "semen",
    title: "Has your husband or partner had a semen analysis?",
    subtitle: "It's a simple test, and male factors play a part in many fertility cases.",
    options: [
      { id: "normal", label: "Yes, it was normal", icon: "check", weight: 0 },
      { id: "concern", label: "Yes, there was concern", icon: "alert", weight: 3 },
      { id: "not-yet", label: "Not yet", icon: "clock", weight: 2 },
      { id: "unsure", label: "Not sure", icon: "help", weight: 1 },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

export function isAnswered(question: Question, selected: string[] | undefined): boolean {
  if (!selected || selected.length === 0) return false;
  return selected.every((id) => question.options.some((o) => o.id === id));
}

/** Returns the 1-based step of the first unanswered question, or null when all are answered. */
export function firstUnansweredStep(answers: Record<string, string[]>): number | null {
  const index = QUESTIONS.findIndex((q) => !isAnswered(q, answers[q.id]));
  return index === -1 ? null : index + 1;
}
