import { feesFor, getCentre, getDoctor } from "@/lib/data/centres";
import { jsonError, readJson } from "@/lib/server/http";
import { bookingService } from "@/lib/services/bookings";
import { patientService } from "@/lib/services/patients";
import { getSession } from "@/lib/services/sessions";
import { slotService } from "@/lib/services/slots";
import type { Companion, PaymentMode, Slot } from "@/lib/types";

const MIN_AGE = 18;
const MAX_AGE = 60;

function parseSlot(value: unknown): Slot | null {
  if (!value || typeof value !== "object") return null;
  const { start, end } = value as Partial<Slot>;
  if (typeof start !== "string" || typeof end !== "string") return null;
  const s = Date.parse(start);
  const e = Date.parse(end);
  if (Number.isNaN(s) || Number.isNaN(e)) return null;
  return { start: new Date(s).toISOString(), end: new Date(e).toISOString() };
}

export async function POST(request: Request) {
  const session = getSession(request);
  if (!session) return jsonError(401, "Your session has expired. Please verify your number again.");

  const body = await readJson<{
    centreId: string;
    doctorId: string;
    slot: Slot;
    companion: Companion;
    paymentMode: PaymentMode;
    patientId?: string;
    patientName?: string;
    patientAge?: number;
  }>(request);
  const centre = getCentre(body?.centreId);
  const doctor = getDoctor(body?.doctorId);
  const slot = parseSlot(body?.slot);
  const companion: Companion = body?.companion === "alone" ? "alone" : "partner";
  const paymentMode = body?.paymentMode;

  if (!centre) return jsonError(400, "Please choose a centre.");
  if (!doctor || !doctor.centreIds.includes(centre.id)) return jsonError(400, "Please choose a doctor at this centre.");
  if (paymentMode !== "hospital" && paymentMode !== "online") return jsonError(400, "Please choose a payment mode.");
  if (!slot || !(await slotService.isBookable(doctor.id, centre.id, slot))) {
    return jsonError(409, "This slot is no longer available. Please pick a new one.");
  }

  const requestedName = typeof body?.patientName === "string" ? body.patientName.trim().replace(/\s+/g, " ") : "";
  const requestedAge = Number(body?.patientAge);
  const existing = body?.patientId
    ? await patientService.findForPhone(String(body.patientId), session.phone)
    : await patientService.findByName(requestedName, session.phone);
  if (body?.patientId && !existing) return jsonError(400, "That patient isn't registered on this mobile number.");
  if (!existing) {
    if (requestedName.length < 2) return jsonError(400, "Please enter the patient's name.");
    if (!Number.isInteger(requestedAge) || requestedAge < MIN_AGE || requestedAge > MAX_AGE) {
      return jsonError(400, `Please enter an age between ${MIN_AGE} and ${MAX_AGE}.`);
    }
  }

  const result = await bookingService.create({
    centre,
    doctor,
    slot,
    patient: {
      name: existing?.name ?? requestedName,
      phone: session.phone,
      age: existing?.age ?? requestedAge,
      companion,
      patientId: existing?.id,
    },
    fees: feesFor(Boolean(existing)),
    paymentMode,
  });
  if (!result.ok) return jsonError(402, `Payment failed: ${result.reason}`);

  if (!existing) {
    const registered = await patientService.register(requestedName, session.phone, requestedAge);
    result.booking.patient.patientId = registered.id;
    result.booking.patient.newlyRegistered = true;
  }

  return Response.json({ booking: result.booking }, { status: 201 });
}
