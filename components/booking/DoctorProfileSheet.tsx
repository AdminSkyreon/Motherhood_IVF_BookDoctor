"use client";

import { BadgeCheck, Check, MapPin } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import { DoctorPhoto } from "@/components/DoctorPhoto";
import { doctorCareAreas, shortenSpecialty } from "@/lib/doctorDisplay";
import type { Doctor } from "@/lib/types";

export function DoctorProfileSheet({
  doctor,
  centreLabel,
  open,
  onClose,
}: {
  doctor: Doctor | null;
  centreLabel?: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const visible = open && doctor != null;

  return (
    <BottomSheet open={visible} onClose={onClose} title="Specialist profile">
      {doctor ? (
        <div className="-mx-5 -mt-1">
          <div className="bg-gradient-to-b from-brand-soft via-brand-soft/40 to-white px-5 pb-5 pt-2">
            <div className="flex flex-col items-center text-center">
              <span className="rounded-[1.125rem] bg-white p-1 shadow-[0_8px_28px_-8px_rgb(27_43_75/0.22)] ring-1 ring-brand-line/80">
                <DoctorPhoto doctor={doctor} size={108} className="rounded-2xl" />
              </span>
              <p className="mt-4 text-[1.3125rem] font-bold leading-tight tracking-tight text-navy">{doctor.name}</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white/90 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-success shadow-sm">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                Motherhood verified specialist
              </span>
              <p className="mt-2 max-w-[18rem] text-[0.875rem] font-medium leading-snug text-brand-dark">
                {shortenSpecialty(doctor.specialty)}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-white/90 px-3 py-1 text-[0.75rem] font-bold text-navy shadow-sm ring-1 ring-line/80">
                  {doctor.experience}
                </span>
                {centreLabel ? (
                  <span className="inline-flex max-w-[14rem] items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[0.6875rem] font-semibold text-muted ring-1 ring-line/70">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-info" aria-hidden />
                    <span className="truncate">{centreLabel}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-4 px-5 pb-1 pt-4">
            <section className="rounded-[1.125rem] border border-line bg-white p-4 shadow-card" aria-labelledby="profile-quals">
              <h3 id="profile-quals" className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted">
                <BadgeCheck className="h-4 w-4 text-info" aria-hidden />
                Qualifications
              </h3>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-navy">{doctor.credentials}</p>
            </section>

            <section className="rounded-[1.125rem] border border-line bg-white p-4 shadow-card" aria-labelledby="profile-care">
              <h3 id="profile-care" className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted">
                Areas of care
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {doctorCareAreas(doctor).map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2.5 rounded-xl bg-sky-50/70 px-3 py-2.5 text-[0.8125rem] leading-snug text-navy"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      ) : null}
    </BottomSheet>
  );
}
