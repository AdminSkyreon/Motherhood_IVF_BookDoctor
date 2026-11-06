"use client";

import { ChevronDown, ChevronRight, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { BrandLoader } from "@/components/BrandLoader";
import { CompanionToggle } from "@/components/booking/CompanionToggle";
import { DateStrip } from "@/components/booking/DateStrip";
import { DoctorCarousel } from "@/components/booking/DoctorCarousel";
import { DoctorProfileSheet } from "@/components/booking/DoctorProfileSheet";
import { type DayPart, splitByPart, TimePicker } from "@/components/booking/TimePicker";
import { formatKm, LocationSheet } from "@/components/LocationSheet";
import { PhoneShell } from "@/components/PhoneShell";
import { api, ApiRequestError } from "@/lib/api";
import { DEFAULT_CENTRE_ID, doctorsAtCentre, getCentre, getDoctor } from "@/lib/data/centres";
import { distanceKm, recommendAtCentre } from "@/lib/doctors";
import { formatDayParts, formatTime, istHour } from "@/lib/format";
import { isComplexCase } from "@/lib/insights";
import { useAppStore } from "@/lib/store";
import type { Doctor, LatLng, SlotDay } from "@/lib/types";
import { useFlowGuard } from "@/lib/useFlowGuard";

const LOCATE_TIMEOUT_MS = 8000;
const NO_LOCATION_NOTICE = "We couldn't find your location. Choose your city and hospital below.";

/** Resolves with the device location, or null on denial, error or timeout. */
function requestLocation(): Promise<LatLng | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    // Safari only starts the API timeout after the permission prompt is answered.
    const timer = window.setTimeout(() => resolve(null), LOCATE_TIMEOUT_MS);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.clearTimeout(timer);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        window.clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: LOCATE_TIMEOUT_MS, maximumAge: 10 * 60 * 1000 },
    );
  });
}

let autoLocateTried = false;

export default function BookPage() {
  const ready = useFlowGuard("book");
  const router = useRouter();
  const answers = useAppStore((s) => s.answers);
  const result = useAppStore((s) => s.result);
  const centreId = useAppStore((s) => s.bookingCentreId);
  const selectCentre = useAppStore((s) => s.selectCentre);
  const selectDoctor = useAppStore((s) => s.selectDoctor);
  const selectSlot = useAppStore((s) => s.selectSlot);
  const companion = useAppStore((s) => s.companion);
  const setCompanion = useAppStore((s) => s.setCompanion);
  const userLocation = useAppStore((s) => s.userLocation);
  const setUserLocation = useAppStore((s) => s.setUserLocation);

  const complexCase = result ? isComplexCase(answers, result.band) : false;
  const centre = getCentre(centreId);

  const [locating, setLocating] = useState(false);
  const [sheet, setSheet] = useState<{ open: boolean; notice: string | null }>({ open: false, notice: null });
  const [profileDoctor, setProfileDoctor] = useState<Doctor | null>(null);

  const locate = useCallback(() => {
    setLocating(true);
    requestLocation().then(async (loc) => {
      if (!loc) {
        setLocating(false);
        setSheet({ open: true, notice: NO_LOCATION_NOTICE });
        return;
      }
      setUserLocation(loc);
      try {
        const { doctors } = await api.doctors({
          location: loc,
          centreId: useAppStore.getState().bookingCentreId ?? DEFAULT_CENTRE_ID,
          complexCase,
        });
        const best = doctors.find((d) => d.recommended) ?? doctors[0];
        if (best) selectCentre(best.centre.id);
        setSheet({ open: false, notice: null });
      } catch {
        setSheet({ open: true, notice: "We couldn't load nearby hospitals. Please choose one below." });
      } finally {
        setLocating(false);
      }
    });
  }, [complexCase, selectCentre, setUserLocation, setSheet, setLocating]);

  useEffect(() => {
    if (!ready || centreId) return;
    let fired = false;
    const id = window.setTimeout(() => {
      fired = true;
      if (autoLocateTried) {
        setSheet({ open: true, notice: null });
        return;
      }
      autoLocateTried = true;
      locate();
    }, 0);
    return () => {
      if (!fired) window.clearTimeout(id);
    };
  }, [ready, centreId, locate]);

  const [pickedDoctor, setPickedDoctor] = useState<{ centreId: string; doctorId: string } | null>(null);
  const centreDoctors = centre ? doctorsAtCentre(centre.id) : [];
  const recommended = centre ? recommendAtCentre(centre.id, complexCase) : undefined;
  const doctorId = pickedDoctor?.centreId === centreId ? pickedDoctor.doctorId : null;
  const doctor = getDoctor(doctorId);

  const slotKey = doctor && centre ? `${doctor.id}|${centre.id}` : null;
  const [slotData, setSlotData] = useState<{ key: string; days: SlotDay[] } | null>(null);
  const [slotError, setSlotError] = useState<{ key: string; message: string } | null>(null);
  const [slotsFetch, setSlotsFetch] = useState<{ key: string; status: "loading" | "ready" | "error" } | null>(null);

  useEffect(() => {
    if (!ready || !doctor || !centre || !slotKey) return;
    let cancelled = false;
    api
      .slots(doctor.id, centre.id)
      .then((res) => {
        if (cancelled) return;
        const days = Array.isArray(res.days) ? res.days : [];
        setSlotData({ key: slotKey, days });
        setSlotsFetch({ key: slotKey, status: "ready" });
      })
      .catch((err) => {
        if (cancelled) return;
        setSlotError({
          key: slotKey,
          message: err instanceof ApiRequestError ? err.message : "Couldn't load times.",
        });
        setSlotsFetch({ key: slotKey, status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [ready, doctor, centre, slotKey]);

  const days = slotData?.key === slotKey ? slotData.days : null;
  const loadError = slotError?.key === slotKey ? slotError.message : null;
  const slotsLoading = Boolean(
    doctorId &&
      slotKey &&
      !loadError &&
      ((slotsFetch?.key === slotKey && slotsFetch.status === "loading") ||
        (ready && days == null && slotsFetch?.key !== slotKey)),
  );

  const [pick, setPick] = useState<{ key: string; date: string; start: string | null; part: DayPart | null } | null>(
    null,
  );
  const myPick = pick?.key === slotKey ? pick : null;
  const activeDate = myPick?.date ?? null;
  const activeDay = activeDate ? (days?.find((d) => d.date === activeDate) ?? null) : null;
  const activeStart = myPick?.start ?? null;
  const activeSlot =
    activeDay && activeStart ? (activeDay.slots.find((s) => s.start === activeStart && s.available) ?? null) : null;
  const groups = activeDay ? splitByPart(activeDay.slots) : { morning: [], evening: [] };
  const part: DayPart =
    myPick?.part ??
    (activeSlot ? (istHour(activeSlot.start) < 14 ? "morning" : "evening") : groups.morning.length ? "morning" : "evening");

  const updatePick = (next: Partial<{ date: string; start: string | null; part: DayPart | null }>) => {
    if (!slotKey) return;
    const date = next.date ?? myPick?.date;
    if (!date) return;
    setPick({
      key: slotKey,
      date,
      start: next.start !== undefined ? next.start : (myPick?.start ?? null),
      part: next.part !== undefined ? next.part : (myPick?.part ?? null),
    });
  };

  const chooseCentre = (id: string) => {
    selectCentre(id);
    setPickedDoctor(null);
    setPick(null);
    setSlotsFetch(null);
    setSheet({ open: false, notice: null });
  };

  const proceed = () => {
    if (!doctor || !centre || !activeSlot || !companion) return;
    selectDoctor(doctor.id, centre.id);
    selectSlot({ start: activeSlot.start, end: activeSlot.end });
    router.push("/book/review");
  };

  const distance = userLocation && centre ? distanceKm(userLocation, centre) : null;
  const summary =
    activeSlot && activeDate && doctor
      ? `${formatDayParts(activeDate).long} · ${formatTime(activeSlot.start)} with ${doctor.name}`
      : "Pick a time to continue";

  return (
    <PhoneShell
      lineArt="none"
      footer={
        <>
          <p key={summary} className="animate-fade-in mb-1.5 truncate short:mb-1 text-center text-[0.8125rem] leading-4 text-muted" aria-live="polite">
            {summary}
          </p>
          <button
            key={activeSlot ? "ready" : "idle"}
            type="button"
            onClick={proceed}
            disabled={!activeSlot || !companion || !doctorId}
            className={`press cta-hover bg-cta inline-flex h-12 w-full short:h-11 tall:h-13 items-center justify-center gap-2 rounded-full text-[1rem] font-semibold text-white shadow-cta disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${activeSlot ? "shine shine-interactive" : ""}`}
          >
            Continue
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <BackButton href="/book/patient" label="Back to patient" />
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted short:sr-only">Step 2 of 3</p>
          <h1 className="text-[1.1875rem] font-bold leading-tight text-navy tall:text-[1.375rem]">Book your consultation</h1>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setSheet({ open: true, notice: null })}
        className="press mt-3 flex w-full items-center gap-3 rounded-2xl border border-sky-line bg-sky-50/60 px-3.5 py-2 text-left short:mt-2 short:py-1.5 tall:mt-4 tall:py-3"
        aria-label={centre ? `Hospital: ${centre.name}. Change hospital` : "Choose hospital"}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-info">
          <MapPin className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.6875rem] font-medium text-muted">
            {locating
              ? "Finding hospitals near you…"
              : [distance !== null ? `Near you · ${formatKm(distance)}` : "Your hospital", centre?.city]
                  .filter(Boolean)
                  .join(" · ")}
          </span>
          <span className="block truncate text-[0.9375rem] font-bold leading-tight text-navy">
            {centre ? centre.name.split(",")[0] : "Choose a hospital"}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-0.5 text-[0.8125rem] font-bold text-info">
          Change
          <ChevronDown className="h-4 w-4" aria-hidden />
        </span>
      </button>

      {!centre ? (
        <BrandLoader
          className="flex-1 py-6"
          caption={locating ? "Finding specialists near you…" : "Choose a hospital to see available doctors"}
        />
      ) : (
        <>
          <SectionLabel>Specialist</SectionLabel>
          <DoctorCarousel
            key={centre.id}
            doctors={centreDoctors}
            recommendedId={recommended?.id ?? null}
            selectedId={doctorId}
            onSelect={(id) => {
              const key = `${id}|${centre.id}`;
              setPickedDoctor({ centreId: centre.id, doctorId: id });
              setPick(null);
              setSlotError(null);
              setSlotsFetch({ key, status: "loading" });
            }}
            onViewProfile={setProfileDoctor}
            onOtherHospitals={() => setSheet({ open: true, notice: null })}
          />

          <SectionLabel tallOnly>Date</SectionLabel>
          {!doctorId ? (
            <p className="text-[0.8125rem] text-muted">Select a specialist to see available dates.</p>
          ) : loadError ? (
            <p className="rounded-xl bg-brand-soft/50 px-3 py-2.5 text-[0.8125rem] text-brand-dark" role="alert">
              {loadError}
            </p>
          ) : slotsLoading ? (
            <div className="flex gap-2 overflow-hidden" aria-busy="true" aria-label="Loading dates">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="skeleton h-[3.625rem] w-[3.25rem] short:h-[3.25rem] tall:h-16 tall:w-14 shrink-0 rounded-2xl" />
              ))}
            </div>
          ) : days ? (
            <DateStrip days={days} activeDate={activeDate} onPick={(date) => updatePick({ date, start: null, part: null })} />
          ) : null}

          <SectionLabel tallOnly>Time</SectionLabel>
          {!doctorId ? (
            <p className="text-[0.8125rem] text-muted">Select a specialist first.</p>
          ) : slotsLoading ? (
            <BrandLoader size={28} className="h-[5.75rem] gap-1.5" caption="Finding open times…" />
          ) : !days ? (
            <p className="text-[0.8125rem] text-muted">No open dates for this specialist.</p>
          ) : !activeDate ? (
            <p className="text-[0.8125rem] text-muted">Pick a date to see open times.</p>
          ) : activeDay ? (
            <TimePicker
              slots={activeDay.slots}
              part={part}
              onPartChange={(p) => updatePick({ part: p, start: null })}
              activeStart={activeSlot?.start ?? null}
              onPick={(start) => updatePick({ start })}
            />
          ) : (
            <p className="text-[0.8125rem] text-muted">No open dates in the next two weeks. Try another doctor or hospital.</p>
          )}

          <SectionLabel>Who&apos;s coming?</SectionLabel>
          <CompanionToggle value={companion} onChange={setCompanion} />
        </>
      )}

      <LocationSheet
        open={sheet.open}
        onClose={() => setSheet({ open: false, notice: null })}
        selectedCentreId={centreId}
        location={userLocation}
        locating={locating}
        notice={sheet.notice}
        onUseLocation={locate}
        onSelect={chooseCentre}
      />

      <DoctorProfileSheet
        doctor={profileDoctor}
        centreLabel={centre?.name.split(",")[0]}
        open={profileDoctor !== null}
        onClose={() => setProfileDoctor(null)}
      />
    </PhoneShell>
  );
}

/** `tallOnly` labels collapse to a spacer (still read by screen readers) unless the screen is tall. */
function SectionLabel({ children, tallOnly = false }: { children: ReactNode; tallOnly?: boolean }) {
  return (
    <h2
      className={`mb-1 mt-3 text-[0.75rem] font-semibold uppercase leading-4 tracking-wide text-muted short:mt-2 tall:mb-1.5 tall:mt-5 ${
        tallOnly ? "not-tall:mb-0 not-tall:mt-2.5 not-tall:h-0 not-tall:overflow-hidden short:mt-2" : ""
      }`}
    >
      {children}
    </h2>
  );
}
