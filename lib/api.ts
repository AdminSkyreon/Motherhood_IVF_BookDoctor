import { demoApi } from "@/lib/demo/clientApi";
import type {
  Answers,
  Companion,
  LatLng,
  PaymentMode,
  Slot,
} from "@/lib/types";

export { ApiRequestError } from "@/lib/apiError";

/** Demo-only client API — no network calls. */
export const api = {
  sendOtp: demoApi.sendOtp,
  verifyOtp: demoApi.verifyOtp,
  score: (answers: Answers) => demoApi.score(answers),
  doctors: (input: { location: LatLng | null; centreId: string; complexCase: boolean }) => demoApi.doctors(input),
  slots: (doctorId: string, centreId: string) => demoApi.slots(doctorId, centreId),
  createBooking: (
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
  ) => demoApi.createBooking(input, token),
  getBooking: (id: string, token: string | null) => demoApi.getBooking(id, token),
  requestCallback: demoApi.requestCallback,
};
