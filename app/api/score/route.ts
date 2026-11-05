import { QUESTIONS, isAnswered } from "@/lib/questions";
import { computeScore } from "@/lib/score";
import { jsonError, readJson } from "@/lib/server/http";
import type { Answers } from "@/lib/types";

export async function POST(request: Request) {
  const body = await readJson<{ answers: Answers }>(request);
  const raw = body?.answers;
  if (!raw || typeof raw !== "object") return jsonError(400, "Missing answers.");

  const answers: Answers = {};
  for (const question of QUESTIONS) {
    const selected = raw[question.id];
    const list = Array.isArray(selected) ? selected.filter((v): v is string => typeof v === "string") : [];
    if (!isAnswered(question, list)) return jsonError(400, `Please answer: ${question.title}`);
    answers[question.id] = list;
  }

  return Response.json(computeScore(answers));
}
