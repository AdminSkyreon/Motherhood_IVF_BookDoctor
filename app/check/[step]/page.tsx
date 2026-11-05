import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BrandLoader } from "@/components/BrandLoader";
import { PhoneShell } from "@/components/PhoneShell";
import { QuestionStep } from "@/components/screens/QuestionStep";
import { QUESTIONS } from "@/lib/questions";

export function generateStaticParams() {
  return QUESTIONS.map((_, i) => ({ step: String(i + 1) }));
}

function StepFallback() {
  return (
    <PhoneShell>
      <BrandLoader className="flex-1" />
    </PhoneShell>
  );
}

async function Step({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  const index = Number(step);
  if (!Number.isInteger(index) || index < 1 || index > QUESTIONS.length) notFound();
  return <QuestionStep step={index} />;
}

export default function CheckStepPage({ params }: PageProps<"/check/[step]">) {
  return (
    <Suspense fallback={<StepFallback />}>
      <Step params={params} />
    </Suspense>
  );
}
