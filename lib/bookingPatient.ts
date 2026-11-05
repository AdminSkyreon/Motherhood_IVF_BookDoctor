import type { BookingPatientChoice, PatientProfile } from "@/lib/types";

export function resolveBookingPatient(choice: BookingPatientChoice, patients: PatientProfile[]) {
  if (choice.kind === "registered") {
    const registered = patients.find((p) => p.id === choice.patientId);
    return {
      registered: registered ?? null,
      name: registered?.name ?? "",
      age: registered?.age,
    };
  }
  return { registered: null, name: choice.name, age: choice.age };
}

export function isRegisteredBooking(choice: BookingPatientChoice) {
  return choice.kind === "registered";
}
