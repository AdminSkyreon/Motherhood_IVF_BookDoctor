import { randomInt } from "node:crypto";
import { db } from "@/lib/server/store";
import type { Booking, Centre, Doctor, Fees, PaymentMode, Slot } from "@/lib/types";
import { paymentService } from "@/lib/services/payment";

export interface CreateBookingInput {
  centre: Centre;
  doctor: Doctor;
  slot: Slot;
  patient: Booking["patient"];
  fees: Fees;
  paymentMode: PaymentMode;
}

export type CreateBookingResult = { ok: true; booking: Booking } | { ok: false; reason: string };

export interface BookingService {
  create(input: CreateBookingInput): Promise<CreateBookingResult>;
  get(id: string): Promise<Booking | undefined>;
}

class InMemoryBookingService implements BookingService {
  async create(input: CreateBookingInput): Promise<CreateBookingResult> {
    let id = String(randomInt(1_000_000, 10_000_000));
    while (db.bookings.has(id)) id = String(randomInt(1_000_000, 10_000_000));

    let paymentStatus: Booking["paymentStatus"] = "pending";
    let paymentReference: string | undefined;
    if (input.paymentMode === "online") {
      const charge = await paymentService.charge({ amount: input.fees.total, bookingId: id, phone: input.patient.phone });
      if (!charge.ok) return { ok: false, reason: charge.reason };
      paymentStatus = "paid";
      paymentReference = charge.reference;
    }

    const booking: Booking = {
      id,
      createdAt: new Date().toISOString(),
      centre: input.centre,
      doctor: input.doctor,
      slot: input.slot,
      patient: input.patient,
      fees: input.fees,
      paymentMode: input.paymentMode,
      paymentStatus,
      paymentReference,
    };
    db.bookings.set(id, booking);
    return { ok: true, booking };
  }

  async get(id: string) {
    return db.bookings.get(id);
  }
}

export const bookingService: BookingService = new InMemoryBookingService();
