import type { Doctor } from "@/lib/types";

export function shortenSpecialty(specialty: string): string {
  return specialty.replace(/^(Senior )?Consultant - /, "");
}

/** Care-focus bullets for the profile sheet (no duplicate of credentials / experience). */
export function doctorCareAreas(doctor: Doctor): string[] {
  const items: string[] = [];
  const lower = doctor.specialty.toLowerCase();
  if (lower.includes("ivf") || lower.includes("reproductive")) {
    items.push("IVF, IUI, and fertility counselling");
    items.push("Ovulation induction and cycle monitoring");
  }
  if (lower.includes("gynaecology") || lower.includes("obstetrics")) {
    items.push("Women's health and high-risk pregnancy care");
  }
  if (lower.includes("senior")) {
    items.push("Complex and repeat IVF cases");
  }
  if (items.length === 0) {
    items.push(`${shortenSpecialty(doctor.specialty)} consultations`);
  }
  return items.slice(0, 4);
}
