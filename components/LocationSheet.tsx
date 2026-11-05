"use client";

import { Check, LocateFixed, MapPin } from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import { HeartSpinner } from "@/components/HeartSpinner";
import { CITIES, centresInCity, getCentre } from "@/lib/data/centres";
import { distanceKm } from "@/lib/doctors";
import { tapFeedback } from "@/lib/haptics";
import type { LatLng } from "@/lib/types";

export function formatKm(km: number): string {
  return km < 1 ? "Under 1 km" : `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

interface SheetBodyProps {
  selectedCentreId: string | null;
  location: LatLng | null;
  locating: boolean;
  notice?: string | null;
  onUseLocation: () => void;
  onSelect: (centreId: string) => void;
}

export function LocationSheet({
  open,
  onClose,
  ...body
}: SheetBodyProps & {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Choose your hospital">
      <LocationSheetBody {...body} />
    </BottomSheet>
  );
}

function LocationSheetBody({ selectedCentreId, location, locating, notice, onUseLocation, onSelect }: SheetBodyProps) {
  const [city, setCity] = useState(() => getCentre(selectedCentreId)?.city ?? CITIES[0]);
  const centres = centresInCity(city)
    .map((centre) => ({ centre, km: location ? distanceKm(location, centre) : null }))
    .sort((a, b) => (a.km ?? 0) - (b.km ?? 0));

  return (
    <>
      {notice ? (
        <p className="-mt-2 mb-3 rounded-xl bg-amber-50 px-3 py-2 text-[0.8125rem] leading-snug text-amber-800">{notice}</p>
      ) : null}

      <button
        type="button"
        onClick={onUseLocation}
        disabled={locating}
        className="press flex w-full items-center gap-3 rounded-2xl border border-sky-line bg-sky-50/60 px-4 py-3 text-left disabled:opacity-70"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-info">
          {locating ? (
            <HeartSpinner className="h-[1.125rem] w-[1.125rem] text-brand" />
          ) : (
            <LocateFixed className="h-[1.125rem] w-[1.125rem]" aria-hidden />
          )}
        </span>
        <span className="min-w-0">
          <span className="block text-[0.9375rem] font-semibold text-info">
            {locating ? "Finding your location…" : "Use my current location"}
          </span>
          <span className="block text-[0.75rem] text-muted">We&apos;ll pick the hospital closest to you</span>
        </span>
      </button>

      <p className="mt-5 text-[0.8125rem] font-semibold uppercase tracking-wide text-muted">City</p>
      <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="City">
        {CITIES.map((c) => {
          const active = c === city;
          return (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                tapFeedback();
                setCity(c);
              }}
              className={`press h-10 rounded-full border px-4 text-[0.875rem] font-semibold ${
                active ? "animate-select-pop border-navy bg-navy text-white" : "border-line bg-white text-ink hover:border-navy/40"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-[0.8125rem] font-semibold uppercase tracking-wide text-muted">Hospital</p>
      <ul className="mt-2 space-y-2" role="listbox" aria-label={`Hospitals in ${city}`}>
        {centres.map(({ centre, km }) => {
          const selected = centre.id === selectedCentreId;
          return (
            <li key={centre.id}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  tapFeedback();
                  onSelect(centre.id);
                }}
                className={`press flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
                  selected ? "border-brand bg-brand-soft/40" : "border-line hover:border-brand-line"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft/70 text-brand">
                  <MapPin className="h-[1.125rem] w-[1.125rem]" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.9375rem] font-bold leading-tight text-navy">{centre.name}</span>
                  <span className="mt-0.5 block truncate text-[0.75rem] text-muted">
                    {km !== null ? `${formatKm(km)} · ` : ""}
                    {centre.address}
                  </span>
                </span>
                {selected ? <Check className="h-5 w-5 shrink-0 text-brand" aria-hidden /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
