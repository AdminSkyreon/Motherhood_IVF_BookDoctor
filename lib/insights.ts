import type { Answers, Band } from "@/lib/types";

export type InsightTopic = "duration" | "age" | "periods" | "conditions" | "pregnancy" | "treatment" | "semen";

export interface Finding {
  topic: InsightTopic;
  tone: "attention" | "positive";
  title: string;
  text: string;
  /** Higher shows first. */
  priority: number;
}

export interface NextStep {
  id: string;
  title: string;
  text: string;
}

export interface Insights {
  headline: string;
  subhead: string;
  findings: Finding[];
  nextSteps: NextStep[];
  complexCase: boolean;
}

const MAX_FINDINGS = 4;
const MAX_STEPS = 5;

const HEADLINES: Record<Band, { headline: string; subhead: string }> = {
  low: {
    headline: "Good news. Your answers look reassuring.",
    subhead:
      "A check-up with a specialist now gives you peace of mind and a head start, so you can plan your family on your own timeline.",
  },
  moderate: {
    headline: "Don't worry, this is common and very treatable.",
    subhead:
      "Many couples with a score like yours go on to have a baby once the cause is found, often with simple treatment. One relaxed conversation with a specialist is all it takes to get a clear plan.",
  },
  high: {
    headline: "Don't worry, with the right care this can be worked on.",
    subhead:
      "Your score simply means it's a good time to get expert support. Many couples in your position have a baby with the right treatment, and starting early keeps the most options open for you.",
  },
};

const CONDITION_NAMES: Record<string, string> = {
  pcos: "PCOS",
  thyroid: "thyroid issues",
  endometriosis: "endometriosis",
  fibroids: "fibroids",
};

function one(answers: Answers, id: string): string | undefined {
  return answers[id]?.[0];
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function collectFindings(answers: Answers): Finding[] {
  const findings: Finding[] = [];
  const add = (f: Finding) => findings.push(f);
  const age = one(answers, "age");
  const older = age === "35to39" || age === "40plus";

  switch (one(answers, "duration")) {
    case "gt2y":
      add({
        topic: "duration",
        tone: "attention",
        title: "Trying for over 2 years",
        text: "You're not alone, and a specialist can usually find what's getting in the way.",
        priority: 9,
      });
      break;
    case "1to2y":
      add({
        topic: "duration",
        tone: "attention",
        title: "Trying for over a year",
        text: "Guidelines recommend a fertility evaluation after 12 months of trying. It's the step that brings answers.",
        priority: 8,
      });
      break;
    case "6to12m":
      if (older)
        add({
          topic: "duration",
          tone: "attention",
          title: "6+ months of trying at 35+",
          text: "After 35, specialists suggest getting checked at 6 months rather than waiting a full year.",
          priority: 7,
        });
      break;
    case "planning":
    case "lt6m":
      add({
        topic: "duration",
        tone: "positive",
        title: "You're early in your journey",
        text: "Checking in now means any small issue can be spotted long before it costs you time.",
        priority: 2,
      });
      break;
  }

  if (age === "40plus")
    add({
      topic: "age",
      tone: "attention",
      title: "Age 40 or above",
      text: "Egg count and quality change more quickly after 40, so an early check-up gives you the most choices.",
      priority: 9,
    });
  else if (age === "35to39")
    add({
      topic: "age",
      tone: "attention",
      title: "Age 35 to 39",
      text: "Egg reserve changes a little faster after 35. A simple blood test gently shows where you stand.",
      priority: 6,
    });
  else if (age === "lt30")
    add({
      topic: "age",
      tone: "positive",
      title: "Age is on your side",
      text: "Under 30, fertility is typically at its strongest, which means more options and better odds.",
      priority: 1,
    });

  const periods = one(answers, "periods");
  if (periods === "irregular")
    add({
      topic: "periods",
      tone: "attention",
      title: "Irregular periods",
      text: "Irregular cycles can mean ovulation isn't happening every month. It's one of the most treatable causes.",
      priority: 7,
    });
  else if (periods === "unsure")
    add({
      topic: "periods",
      tone: "attention",
      title: "Not sure about your cycle",
      text: "Knowing when you ovulate is the first step. A specialist can track it for you with a quick scan.",
      priority: 3,
    });

  const conditions = (answers.conditions ?? []).filter((id) => id in CONDITION_NAMES);
  if (conditions.length > 0)
    add({
      topic: "conditions",
      tone: "attention",
      title: `Diagnosed with ${joinNames(conditions.map((id) => CONDITION_NAMES[id]))}`,
      text: "These can affect ovulation or implantation, but they are well understood and manageable with the right plan.",
      priority: 6 + conditions.length,
    });

  switch (one(answers, "pregnancy")) {
    case "miscarriage":
      add({
        topic: "pregnancy",
        tone: "attention",
        title: "Past miscarriage",
        text: "A specialist can look for underlying causes and support you closely through your next pregnancy.",
        priority: 7,
      });
      break;
    case "yes":
      add({
        topic: "pregnancy",
        tone: "positive",
        title: "You've conceived before",
        text: "A previous pregnancy is an encouraging sign that the basics are working.",
        priority: 2,
      });
      break;
  }

  switch (one(answers, "treatment")) {
    case "ivf":
    case "iui":
      add({
        topic: "treatment",
        tone: "attention",
        title: `Previous ${one(answers, "treatment") === "ivf" ? "IVF" : "IUI"}`,
        text: "A fresh review of your past cycles often reveals what to change, and a new plan can make the next attempt count.",
        priority: 8,
      });
      break;
    case "ovulation":
      add({
        topic: "treatment",
        tone: "attention",
        title: "Tried ovulation medicines",
        text: "If they haven't worked yet, there are proven next steps a specialist can tailor to you.",
        priority: 5,
      });
      break;
  }

  switch (one(answers, "semen")) {
    case "concern":
      add({
        topic: "semen",
        tone: "attention",
        title: "Semen report showed a concern",
        text: "Male factors play a part in close to half of cases, and many respond well to treatment.",
        priority: 8,
      });
      break;
    case "not-yet":
    case "unsure":
      add({
        topic: "semen",
        tone: "attention",
        title: "Partner not tested yet",
        text: "Fertility is a two-person check. A simple semen test completes the picture.",
        priority: 4,
      });
      break;
  }

  return findings;
}

function collectSteps(answers: Answers, band: Band): NextStep[] {
  const steps: NextStep[] = [
    {
      id: "consult",
      title: "One-on-one consultation",
      text: "A fertility specialist reviews your history and answers every question you have.",
    },
  ];
  const age = one(answers, "age");
  const duration = one(answers, "duration");
  const conditions = answers.conditions ?? [];
  const treatment = one(answers, "treatment");

  if (treatment === "iui" || treatment === "ivf")
    steps.push({
      id: "plan-review",
      title: "Review of your previous treatment",
      text: "Your past reports are studied to plan a stronger next cycle.",
    });
  if (age === "35to39" || age === "40plus" || duration === "1to2y" || duration === "gt2y" || band !== "low")
    steps.push({
      id: "amh",
      title: "AMH test and follicle scan",
      text: "A blood test and ultrasound that show your egg reserve.",
    });
  if (one(answers, "periods") !== "regular" || conditions.includes("pcos") || conditions.includes("thyroid"))
    steps.push({
      id: "hormones",
      title: "Hormone profile",
      text: "Thyroid, prolactin and reproductive hormones, checked in one blood draw.",
    });
  if (one(answers, "semen") !== "normal")
    steps.push({
      id: "semen",
      title: "Semen analysis",
      text: "A quick, private test for your partner that completes the picture.",
    });
  if (conditions.includes("endometriosis") || conditions.includes("fibroids"))
    steps.push({
      id: "pelvic-scan",
      title: "Detailed pelvic ultrasound",
      text: "Checks the uterus and ovaries to plan the right treatment.",
    });

  return steps.slice(0, MAX_STEPS);
}

export function isComplexCase(answers: Answers, band: Band): boolean {
  const treatment = one(answers, "treatment");
  return band === "high" || treatment === "iui" || treatment === "ivf";
}

export function buildInsights(answers: Answers, band: Band): Insights {
  const all = collectFindings(answers).sort((a, b) => b.priority - a.priority);
  const attention = all.filter((f) => f.tone === "attention");
  const positive = all.filter((f) => f.tone === "positive");
  const findings = [...attention, ...positive].slice(0, MAX_FINDINGS);

  return {
    ...HEADLINES[band],
    findings,
    nextSteps: collectSteps(answers, band),
    complexCase: isComplexCase(answers, band),
  };
}
