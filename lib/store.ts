"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_CENTRE_ID } from "@/lib/data/centres";
import type {
  Answers,
  Booking,
  BookingPatientChoice,
  Companion,
  LatLng,
  PatientProfile,
  ScoreResult,
  Slot,
} from "@/lib/types";

interface Lead {
  name: string;
  phone: string;
  consent: boolean;
}

interface AppState {
  hydrated: boolean;
  centreId: string;
  answers: Answers;
  lead: Lead;
  otpSentAt: number | null;
  /** Code echoed by the mock OTP service outside production, shown as a hint. */
  devOtp: string | null;
  sessionToken: string | null;
  /** Registered patients on the verified phone number; a family can share one number. */
  patients: PatientProfile[];
  result: ScoreResult | null;
  companion: Companion | null;
  bookings: Record<string, Booking>;
  userLocation: LatLng | null;
  selectedDoctorId: string | null;
  bookingCentreId: string | null;
  selectedSlot: Slot | null;
  slotHeldAt: number | null;
  /** Who this booking is for, set on /book/patient before choosing a doctor. */
  bookingPatient: BookingPatientChoice | null;
  /** Drives check question enter animation (forward vs back). */
  checkNavDirection: "forward" | "back";

  setCentre: (centreId: string) => void;
  setAnswer: (questionId: string, selected: string[]) => void;
  setLead: (lead: Lead) => void;
  markOtpSent: (at: number, devOtp?: string) => void;
  setResult: (result: ScoreResult) => void;
  setBookingAuth: (token: string, patients: PatientProfile[]) => void;
  setBookingPatient: (choice: BookingPatientChoice | null) => void;
  setCompanion: (companion: Companion) => void;
  setUserLocation: (location: LatLng | null) => void;
  selectCentre: (centreId: string) => void;
  selectDoctor: (doctorId: string, centreId: string) => void;
  selectSlot: (slot: Slot) => void;
  clearSlot: () => void;
  addBooking: (booking: Booking) => void;
  startOver: () => void;
  setCheckNavDirection: (direction: "forward" | "back") => void;
}

const initialSelection = {
  selectedDoctorId: null,
  bookingCentreId: null,
  selectedSlot: null,
  slotHeldAt: null,
};

const initialFlow = {
  answers: {} as Answers,
  otpSentAt: null,
  devOtp: null,
  result: null,
  companion: null as Companion | null,
  bookingPatient: null,
  checkNavDirection: "forward" as const,
  ...initialSelection,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hydrated: false,
      centreId: DEFAULT_CENTRE_ID,
      lead: { name: "", phone: "", consent: false },
      sessionToken: null,
      patients: [],
      bookings: {},
      userLocation: null,
      ...initialFlow,

      setCentre: (centreId) => set({ centreId }),
      setAnswer: (questionId, selected) =>
        set((s) => ({ answers: { ...s.answers, [questionId]: selected }, result: null })),
      setLead: (lead) =>
        set((s) => ({
          lead,
          ...(s.lead.phone !== lead.phone
            ? {
                sessionToken: null,
                patients: [],
                bookingPatient: null,
                otpSentAt: null,
                devOtp: null,
              }
            : {}),
        })),
      markOtpSent: (at, devOtp) => set({ otpSentAt: at, devOtp: devOtp ?? null }),
      setResult: (result) => set({ result }),
      setBookingAuth: (sessionToken, patients) => set({ sessionToken, patients, bookingPatient: null }),
      setBookingPatient: (bookingPatient) =>
        set({
          bookingPatient,
          selectedDoctorId: null,
          selectedSlot: null,
          slotHeldAt: null,
          companion: null,
        }),
      setCompanion: (companion) => set({ companion }),
      setUserLocation: (userLocation) => set({ userLocation }),
      selectCentre: (centreId) =>
        set((s) =>
          s.bookingCentreId === centreId
            ? s
            : { bookingCentreId: centreId, selectedDoctorId: null, selectedSlot: null, slotHeldAt: null },
        ),
      selectDoctor: (doctorId, centreId) =>
        set((s) =>
          s.selectedDoctorId === doctorId && s.bookingCentreId === centreId
            ? s
            : { selectedDoctorId: doctorId, bookingCentreId: centreId, selectedSlot: null, slotHeldAt: null },
        ),
      selectSlot: (selectedSlot) => set({ selectedSlot, slotHeldAt: Date.now() }),
      clearSlot: () => set({ selectedSlot: null, slotHeldAt: null }),
      addBooking: (booking) =>
        set((s) => ({
          bookings: { ...s.bookings, [booking.id]: booking },
          patients:
            booking.patient.patientId && !s.patients.some((p) => p.id === booking.patient.patientId)
              ? [...s.patients, { id: booking.patient.patientId, name: booking.patient.name, age: booking.patient.age }]
              : s.patients,
        })),
      startOver: () => set({ ...initialFlow, bookingPatient: null }),
      setCheckNavDirection: (checkNavDirection) => set({ checkNavDirection }),
    }),
    {
      name: "motherhood-fertility-check",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: (s) => ({
        centreId: s.centreId,
        answers: s.answers,
        lead: s.lead,
        otpSentAt: s.otpSentAt,
        devOtp: s.devOtp,
        sessionToken: s.sessionToken,
        patients: s.patients,
        result: s.result,
        companion: s.companion,
        bookings: s.bookings,
        userLocation: s.userLocation,
        selectedDoctorId: s.selectedDoctorId,
        bookingCentreId: s.bookingCentreId,
        selectedSlot: s.selectedSlot,
        slotHeldAt: s.slotHeldAt,
        bookingPatient: s.bookingPatient,
      }),
      onRehydrateStorage: () => () => {
        useAppStore.setState((s) => ({ hydrated: true, patients: Array.isArray(s.patients) ? s.patients : [] }));
      },
    },
  ),
);
