"use client";

import { Building2, Check, Sparkles } from "lucide-react";
import { DoctorPhoto } from "@/components/DoctorPhoto";
import { shortenSpecialty } from "@/lib/doctorDisplay";
import { tapFeedback } from "@/lib/haptics";
import type { Doctor } from "@/lib/types";

export function DoctorCarousel({
  doctors,
  recommendedId,
  selectedId,
  onSelect,
  onViewProfile,
  onOtherHospitals,
}: {
  doctors: Doctor[];
  recommendedId: string | null;
  selectedId: string | null;
  onSelect: (doctorId: string) => void;
  onViewProfile?: (doctor: Doctor) => void;
  onOtherHospitals: () => void;
}) {
  const single = doctors.length === 1;
  return (
    <div
      className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="radiogroup"
      aria-label="Doctor"
    >
      {doctors.map((doctor) => {
        const selected = doctor.id === selectedId;
        const recommended = doctor.id === recommendedId;
        return (
          <div
            key={doctor.id}
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              tapFeedback();
              onSelect(doctor.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                tapFeedback();
                onSelect(doctor.id);
              }
            }}
            className={`press relative flex shrink-0 snap-start cursor-pointer flex-col rounded-2xl border bg-white p-2 pr-3 text-left short:py-1.5 tall:p-3 ${
              single ? "w-[calc(100%-5.75rem)]" : "w-[78%] max-w-[18.75rem]"
            } ${selected ? "animate-select-pop border-brand ring-2 ring-brand/25" : "border-line"}`}
          >
            <div className="flex items-center gap-3">
              {onViewProfile ? (
                <button
                  type="button"
                  aria-label={`View profile for ${doctor.name}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    tapFeedback();
                    onViewProfile(doctor);
                  }}
                  className="press relative z-10 shrink-0 rounded-xl ring-2 ring-transparent transition-[box-shadow,ring-color] hover:ring-info/35 focus-visible:ring-info/50"
                >
                  <DoctorPhoto doctor={doctor} size={48} priority className="rounded-xl" />
                </button>
              ) : (
                <DoctorPhoto doctor={doctor} size={48} priority className="rounded-xl" />
              )}
              <span className="min-w-0 flex-1">
                {recommended ? (
                  <span className="mb-0.5 inline-flex items-center gap-1 rounded-full bg-brand-soft px-1.5 text-[0.625rem] leading-4 font-bold uppercase tracking-wide text-brand-dark">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    Recommended
                  </span>
                ) : null}
                <span className="block truncate text-[0.9375rem] font-bold leading-tight text-navy">{doctor.name}</span>
                <span className="mt-0.5 block truncate text-[0.75rem] text-muted">
                  {doctor.experience} · {shortenSpecialty(doctor.specialty)}
                </span>
              </span>
              {selected ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden />
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={onOtherHospitals}
        className="press flex w-[5.125rem] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-sky-line bg-sky-50/50 px-2 text-center text-[0.6875rem] font-semibold leading-tight text-info"
      >
        <Building2 className="h-5 w-5" aria-hidden />
        Other hospitals
      </button>
    </div>
  );
}
