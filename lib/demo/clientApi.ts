import { feesFor, getCentre, getDoctor } from "@/lib/data/centres";
import { createDemoSession, demoStore, getDemoSession } from "@/lib/demo/store";
import { isDemoSlotBookable, listDemoSlotDays } from "@/lib/demo/slots";
import { rankDoctors } from "@/lib/doctors";
import { ApiRequestError } from "@/lib/apiError";
import { QUESTIONS, isAnswered } from "@/lib/questions";
import { computeScore } from "@/lib/score";
import { cleanName, cleanPhone } from "@/lib/server/http";
import type {
  Answers,
  Booking,
  Companion,
  DoctorOption,
  LatLng,
  PatientProfile,
  PaymentMode,
  ScoreResult,
  Slot,
  SlotDay,
} from "@/lib/types";

import { DEMO_OTP } from "@/lib/demo/constants";
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_SECONDS = 30;
const MIN_AGE = 18;
const MAX_AGE = 60;

function randomBookingId(): string {
  let id = String(Math.floor(1_000_000 + Math.random() * 9_000_000));
  while (demoStore.bookings.has(id)) id = String(Math.floor(1_000_000 + Math.random() * 9_000_000));
  return id;
}

function randomPatientId(): string {
  let id = `MH-${Math.floor(100_000 + Math.random() * 900_000)}`;
  while (demoStore.patientRegistry.has(id)) id = `MH-${Math.floor(100_000 + Math.random() * 900_000)}`;
  return id;
}

function listPatients(phone: string): PatientProfile[] {
  return [...demoStore.patientRegistry.values()]
    .filter((p) => p.phone === phone)
    .map(({ id, name, age }) => ({ id, name, age }));
}

function findPatientByName(name: string, phone: string) {
  const norm = name.trim().toLowerCase();
  return [...demoStore.patientRegistry.values()].find((p) => p.phone === phone && p.name.trim().toLowerCase() === norm);
}

export const demoApi = {
  async sendOtp(input: { name: string; phone: string; channel?: "sms" | "whatsapp" }) {
    const phone = cleanPhone(input.phone);
    if (!phone) throw new ApiRequestError("Please enter a valid 10-digit mobile number.", 400);
    const now = Date.now();
    const channel = input.channel ?? "sms";
    const existing = demoStore.otps.get(phone);
    const lastSent = existing?.lastSentAt[channel];
    if (lastSent && now - lastSent < OTP_RESEND_SECONDS * 1000) {
      throw new ApiRequestError("Please wait before requesting another code.", 429, Math.ceil((lastSent + OTP_RESEND_SECONDS * 1000 - now) / 1000));
    }
    demoStore.otps.set(phone, {
      code: DEMO_OTP,
      expiresAt: now + OTP_TTL_MS,
      attempts: 0,
      lastSentAt: { ...existing?.lastSentAt, [channel]: now },
    });
    return { sentAt: now, channel, devCode: DEMO_OTP };
  },

  async verifyOtp(input: { name: string; phone: string; code: string }) {
    const phone = cleanPhone(input.phone);
    const name = cleanName(input.name);
    const code = input.code.trim();
    if (!phone || !name) throw new ApiRequestError("Missing name or mobile number.", 400);
    if (!/^\d{4}$/.test(code)) throw new ApiRequestError("Please enter the 4-digit code.", 400);

    const record = demoStore.otps.get(phone);
    if (!record || record.expiresAt < Date.now()) {
      throw new ApiRequestError("This code has expired. Please request a new one.", 410);
    }
    if (record.attempts >= 5) {
      throw new ApiRequestError("Too many incorrect attempts. Please request a new code.", 410);
    }
    if (record.code !== code) {
      record.attempts += 1;
      throw new ApiRequestError("That code doesn't match. Please check and try again.", 401);
    }
    demoStore.otps.delete(phone);

    const token = createDemoSession(phone, name);
    return { token, patients: listPatients(phone) };
  },

  async score(answers: Answers): Promise<ScoreResult> {
    const normalized: Answers = {};
    for (const question of QUESTIONS) {
      const selected = answers[question.id];
      const list = Array.isArray(selected) ? selected.filter((v): v is string => typeof v === "string") : [];
      if (!isAnswered(question, list)) throw new ApiRequestError(`Please answer: ${question.title}`, 400);
      normalized[question.id] = list;
    }
    return computeScore(normalized);
  },

  async doctors(input: { location: LatLng | null; centreId: string; complexCase: boolean }): Promise<{ doctors: DoctorOption[] }> {
    return {
      doctors: rankDoctors({
        location: input.location,
        fallbackCentreId: input.centreId,
        complexCase: input.complexCase,
      }),
    };
  },

  async slots(doctorId: string, centreId: string): Promise<{ days: SlotDay[] }> {
    const doctor = getDoctor(doctorId);
    const centre = getCentre(centreId);
    if (!doctor) throw new ApiRequestError("Doctor not found.", 404);
    if (!centre || !doctor.centreIds.includes(centre.id)) {
      throw new ApiRequestError("This doctor does not consult at that centre.", 400);
    }
    return { days: await listDemoSlotDays(doctor.id, centre.id) };
  },

  async createBooking(
    input: {
      centreId: string;
      doctorId: string;
      slot: Slot;
      companion: Companion;
      paymentMode: PaymentMode;
      patientId?: string;
      patientName?: string;
      patientAge?: number;
    },
    token: string | null,
  ): Promise<{ booking: Booking }> {
    const centre = getCentre(input.centreId);
    const doctor = getDoctor(input.doctorId);
    const session = getDemoSession(token);
    const byId = input.patientId ? demoStore.patientRegistry.get(String(input.patientId)) : undefined;
    const phone = session?.phone ?? byId?.phone;

    if (!centre) throw new ApiRequestError("Please choose a centre.", 400);
    if (!doctor || !doctor.centreIds.includes(centre.id)) {
      throw new ApiRequestError("Please choose a doctor at this centre.", 400);
    }
    if (input.paymentMode !== "hospital" && input.paymentMode !== "online") {
      throw new ApiRequestError("Please choose a payment mode.", 400);
    }
    if (!(await isDemoSlotBookable(doctor.id, centre.id, input.slot))) {
      throw new ApiRequestError("This slot is no longer available. Please pick a new one.", 409);
    }

    const requestedName = typeof input.patientName === "string" ? input.patientName.trim().replace(/\s+/g, " ") : "";
    const requestedAge = Number(input.patientAge);
    const resolvedPhone = phone ?? "9988776655";

    const existing = input.patientId ? byId : findPatientByName(requestedName, resolvedPhone);
    if (input.patientId && !existing) throw new ApiRequestError("That patient isn't registered on this mobile number.", 400);
    if (!existing) {
      if (requestedName.length < 2) throw new ApiRequestError("Please enter the patient's name.", 400);
      if (!Number.isInteger(requestedAge) || requestedAge < MIN_AGE || requestedAge > MAX_AGE) {
        throw new ApiRequestError(`Please enter an age between ${MIN_AGE} and ${MAX_AGE}.`, 400);
      }
    }

    const registered = Boolean(existing);
    const fees = feesFor(registered);
    const id = randomBookingId();
    let paymentStatus: Booking["paymentStatus"] = "pending";
    let paymentReference: string | undefined;
    if (input.paymentMode === "online") {
      paymentStatus = "paid";
      paymentReference = `BD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    }

    const booking: Booking = {
      id,
      createdAt: new Date().toISOString(),
      centre,
      doctor,
      slot: input.slot,
      patient: {
        name: existing?.name ?? requestedName,
        phone: resolvedPhone,
        age: existing?.age ?? requestedAge,
        companion: input.companion === "alone" ? "alone" : "partner",
        patientId: existing?.id,
      },
      fees,
      paymentMode: input.paymentMode,
      paymentStatus,
      paymentReference,
    };

    if (!existing) {
      const reg = findPatientByName(requestedName, resolvedPhone) ?? {
        id: randomPatientId(),
        name: requestedName,
        phone: resolvedPhone,
        age: requestedAge,
      };
      if (!demoStore.patientRegistry.has(reg.id)) demoStore.patientRegistry.set(reg.id, reg);
      booking.patient.patientId = reg.id;
      booking.patient.newlyRegistered = true;
    }

    demoStore.bookings.set(id, booking);
    return { booking };
  },

  async getBooking(id: string, _token?: string | null): Promise<{ booking: Booking }> {
    const booking = demoStore.bookings.get(id);
    if (!booking) throw new ApiRequestError("Booking not found.", 404);
    return { booking };
  },

  async requestCallback(input: { name: string; phone: string; reason: "general" | "counsellor" }) {
    const phone = cleanPhone(input.phone);
    const name = cleanName(input.name);
    if (!phone || !name) throw new ApiRequestError("Please enter your name and mobile number.", 400);
    const id = `CB-${Date.now()}`;
    demoStore.callbacks.push({ id, name, phone, reason: input.reason, createdAt: new Date().toISOString() });
    return { id };
  },
};
