import { randomUUID } from "node:crypto";

export type ChargeResult = { ok: true; reference: string } | { ok: false; reason: string };

export interface PaymentService {
  charge(input: { amount: number; bookingId: string; phone: string }): Promise<ChargeResult>;
}

/** Stand-in for the BillDesk gateway; always succeeds. */
class MockBillDeskService implements PaymentService {
  async charge(): Promise<ChargeResult> {
    return { ok: true, reference: `BD-${randomUUID().slice(0, 8).toUpperCase()}` };
  }
}

export const paymentService: PaymentService = new MockBillDeskService();
