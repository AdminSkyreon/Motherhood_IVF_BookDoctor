"use client";

import { BadgeCheck, ChevronRight, UserPlus, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackButton } from "@/components/BackButton";
import { PatientOption } from "@/components/booking/PatientOption";
import { PrimaryButton } from "@/components/Buttons";
import { TextField } from "@/components/Fields";
import { PhoneShell } from "@/components/PhoneShell";
import { feesFor } from "@/lib/data/centres";
import { formatRupees } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import type { BookingPatientChoice } from "@/lib/types";
import { useFlowGuard } from "@/lib/useFlowGuard";

const MIN_AGE = 18;
const MAX_AGE = 60;
const NEW_PATIENT = "new";

export default function BookPatientPage() {
  const router = useRouter();
  const ready = useFlowGuard("session");
  const lead = useAppStore((s) => s.lead);
  const patients = useAppStore((s) => s.patients);
  const setBookingPatient = useAppStore((s) => s.setBookingPatient);

  const [choice, setChoice] = useState<string | null>(null);
  const registered = choice && choice !== NEW_PATIENT ? patients.find((p) => p.id === choice) : undefined;
  const showNewForm = choice === NEW_PATIENT || patients.length === 0;

  const [nameEdit, setNameEdit] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ choice?: string; name?: string; age?: string }>({});

  const commit = () => {
    if (patients.length > 0 && !choice) {
      setFieldErrors({ choice: "Please choose who this appointment is for." });
      return;
    }

    let booking: BookingPatientChoice;
    if (registered) {
      booking = { kind: "registered", patientId: registered.id };
    } else {
      const name = (showNewForm ? nameEdit : lead.name).trim();
      const age = Number(ageInput);
      const errors = {
        name: name.length < 2 ? "Please enter the patient's name." : undefined,
        age:
          !ageInput || age < MIN_AGE || age > MAX_AGE ? `Please enter an age between ${MIN_AGE} and ${MAX_AGE}.` : undefined,
      };
      setFieldErrors(errors);
      if (errors.name || errors.age) return;
      booking = { kind: "new", name, age };
    }
    setFieldErrors({});
    setBookingPatient(booking);
    router.push("/book");
  };

  const canContinue =
    ready &&
    (patients.length === 0
      ? nameEdit.trim().length >= 2 && ageInput.length > 0
      : choice === NEW_PATIENT
        ? nameEdit.trim().length >= 2 && ageInput.length > 0
        : Boolean(registered));

  return (
    <PhoneShell
      lineArt="none"
      footer={
        <PrimaryButton onClick={commit} disabled={!canContinue} className="h-12 short:h-11">
          Continue
          <ChevronRight className="h-5 w-5" aria-hidden />
        </PrimaryButton>
      }
    >
      <div className="flex items-center gap-3">
        <BackButton href="/book/verify" label="Back" />
        <p className="text-[0.8125rem] font-semibold uppercase tracking-wide text-muted">Step 1 of 3</p>
      </div>

      <h1 className="mt-5 text-[1.5rem] font-bold leading-tight text-navy short:mt-3">Who is this appointment for?</h1>
      <p className="mt-1 text-[0.875rem] text-muted">Choose a registered patient or add someone new on your mobile number.</p>

      <section className="mt-5 rounded-[1.25rem] border border-brand-line bg-white px-4 py-4 shadow-card short:mt-3">
        {patients.length > 0 ? (
          <>
            <p className="text-[0.8125rem] text-muted">
              {patients.length === 1 ? "Registered on this number" : `${patients.length} patients registered on this number`}
            </p>
            {fieldErrors.choice ? (
              <p role="alert" className="mt-2 text-[0.8125rem] text-brand-dark">
                {fieldErrors.choice}
              </p>
            ) : null}
            <div role="radiogroup" aria-labelledby="patient-title" className="mt-3 space-y-2">
              <h2 id="patient-title" className="sr-only">
                Select patient
              </h2>
              {patients.map((p) => (
                <PatientOption
                  key={p.id}
                  selected={choice === p.id}
                  onSelect={() => {
                    setChoice(p.id);
                    setFieldErrors((e) => ({ ...e, choice: undefined }));
                  }}
                  title={p.name}
                  detail={
                    <>
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                      {p.id}
                      {p.age ? ` · ${p.age} yrs` : ""}
                    </>
                  }
                />
              ))}
              <PatientOption
                selected={choice === NEW_PATIENT}
                onSelect={() => {
                  setChoice(NEW_PATIENT);
                  setNameEdit(lead.name);
                  setAgeInput("");
                  setFieldErrors((e) => ({ ...e, choice: undefined }));
                }}
                title="Add another patient"
                detail={<>New registration · {formatRupees(feesFor(false).registration, { decimals: false })} fee</>}
                icon={<UserPlus className="h-4 w-4" aria-hidden />}
              />
            </div>
          </>
        ) : (
          <p className="flex items-center gap-2 text-[0.8125rem] text-muted">
            <UserRound className="h-4 w-4 shrink-0 text-brand" aria-hidden />
            No patients registered on this number yet.
          </p>
        )}

        {showNewForm ? (
          <div className="mt-3 space-y-3">
            {patients.length === 0 ? (
              <p className="text-[0.8125rem] text-muted">
                New patient · Is this appointment for someone else? Just change the name.
              </p>
            ) : null}
            <TextField
              label="Patient name"
              value={nameEdit}
              onChange={(v) => {
                setNameEdit(v);
                setFieldErrors((e) => ({ ...e, name: undefined }));
              }}
              error={fieldErrors.name}
              autoComplete="name"
              maxLength={60}
            />
            <TextField
              label="Patient age"
              value={ageInput}
              onChange={(v) => {
                setAgeInput(v.replace(/\D/g, "").slice(0, 2));
                setFieldErrors((e) => ({ ...e, age: undefined }));
              }}
              error={fieldErrors.age}
              inputMode="numeric"
              placeholder="e.g. 32"
              trailing={<span className="text-[0.875rem] text-muted">years</span>}
            />
          </div>
        ) : null}
      </section>
    </PhoneShell>
  );
}
