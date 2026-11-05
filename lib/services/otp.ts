import { randomInt } from "node:crypto";
import { db } from "@/lib/server/store";

export type OtpChannel = "sms" | "whatsapp";

export const OTP_RESEND_SECONDS = 30;
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export type SendResult =
  | { ok: true; sentAt: number; devCode?: string }
  | { ok: false; reason: "rate_limited"; retryAfter: number };

export type VerifyResult = { ok: true } | { ok: false; reason: "invalid" | "expired" | "too_many_attempts" };

export interface OtpService {
  send(phone: string, channel: OtpChannel): Promise<SendResult>;
  verify(phone: string, code: string): Promise<VerifyResult>;
}

/** Stand-in for an SMS / WhatsApp provider. Set MOCK_OTP_CODE to override the fixed code. */
class MockOtpService implements OtpService {
  async send(phone: string, channel: OtpChannel): Promise<SendResult> {
    const now = Date.now();
    const existing = db.otps.get(phone);
    const lastSent = existing?.lastSentAt[channel];
    if (lastSent && now - lastSent < OTP_RESEND_SECONDS * 1000) {
      return { ok: false, reason: "rate_limited", retryAfter: Math.ceil((lastSent + OTP_RESEND_SECONDS * 1000 - now) / 1000) };
    }

    const fixed = process.env.MOCK_OTP_CODE ?? (process.env.NODE_ENV === "production" ? undefined : "1234");
    const code = existing && existing.expiresAt > now ? existing.code : (fixed ?? String(randomInt(0, 10000)).padStart(4, "0"));

    db.otps.set(phone, {
      code,
      expiresAt: now + OTP_TTL_MS,
      attempts: 0,
      lastSentAt: { ...existing?.lastSentAt, [channel]: now },
    });

    console.info(`[mock-otp] ${channel} code for +91${phone}: ${code}`);
    return { ok: true, sentAt: now, devCode: process.env.NODE_ENV === "production" ? undefined : code };
  }

  async verify(phone: string, code: string): Promise<VerifyResult> {
    const record = db.otps.get(phone);
    if (!record || record.expiresAt < Date.now()) return { ok: false, reason: "expired" };
    if (record.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };
    if (record.code !== code) {
      record.attempts += 1;
      return { ok: false, reason: "invalid" };
    }
    db.otps.delete(phone);
    return { ok: true };
  }
}

export const otpService: OtpService = new MockOtpService();
