"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isValidLead } from "@/lib/lead";
import { firstUnansweredStep } from "@/lib/questions";
import { useAppStore } from "@/lib/store";

type Requirement = "answers" | "result" | "bookAuth" | "session" | "book" | "doctor" | "slot";

function bookingRedirect(
  requirement: Exclude<Requirement, "answers" | "result" | "bookAuth">,
  state: {
    result: unknown;
    token: string | null;
    bookingPatient: unknown;
    doctorId: string | null;
    slot: unknown;
  },
): string | null {
  if (!state.result) return "/results/verify";
  if (!state.token) return "/book/verify";
  if (requirement !== "session" && !state.bookingPatient) return "/book/patient";
  if ((requirement === "doctor" || requirement === "slot") && !state.doctorId) return "/book";
  if (requirement === "slot" && !state.slot) return "/book";
  return null;
}

/**
 * Sends the user back to the earliest step they haven't completed.
 * Returns true once the store is hydrated and the requirement is met.
 */
export function useFlowGuard(requirement: Requirement): boolean {
  const router = useRouter();
  const hydrated = useAppStore((s) => s.hydrated);
  const answers = useAppStore((s) => s.answers);
  const result = useAppStore((s) => s.result);
  const token = useAppStore((s) => s.sessionToken);
  const lead = useAppStore((s) => s.lead);
  const bookingPatient = useAppStore((s) => s.bookingPatient);
  const doctorId = useAppStore((s) => s.selectedDoctorId);
  const slot = useAppStore((s) => s.selectedSlot);

  const pendingStep = firstUnansweredStep(answers);
  let redirect: string | null = null;
  if (pendingStep !== null) redirect = `/check/${pendingStep}`;
  else if (requirement === "result") {
    if (!result) redirect = "/results/verify";
  } else if (requirement === "bookAuth") {
    if (!result) redirect = "/results/verify";
    else if (!isValidLead(lead)) redirect = "/results/verify";
  } else if (requirement === "session") {
    redirect = bookingRedirect("session", { result, token, bookingPatient, doctorId, slot });
  } else if (requirement === "book") {
    redirect = bookingRedirect("book", { result, token, bookingPatient, doctorId, slot });
  } else if (requirement === "doctor" || requirement === "slot") {
    redirect = bookingRedirect(requirement, { result, token, bookingPatient, doctorId, slot });
  }

  useEffect(() => {
    if (hydrated && redirect) router.replace(redirect);
  }, [hydrated, redirect, router]);

  return hydrated && !redirect;
}
