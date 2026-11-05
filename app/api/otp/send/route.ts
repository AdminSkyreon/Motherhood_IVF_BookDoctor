import { cleanName, cleanPhone, jsonError, readJson } from "@/lib/server/http";
import { otpService, type OtpChannel } from "@/lib/services/otp";

export async function POST(request: Request) {
  const body = await readJson<{ name: string; phone: string; channel: OtpChannel }>(request);
  const phone = cleanPhone(body?.phone);
  const name = cleanName(body?.name);
  const channel: OtpChannel = body?.channel === "whatsapp" ? "whatsapp" : "sms";

  if (!name) return jsonError(400, "Please enter your full name.");
  if (!phone) return jsonError(400, "Please enter a valid 10-digit mobile number.");

  const result = await otpService.send(phone, channel);
  if (!result.ok) {
    return jsonError(429, `Please wait ${result.retryAfter}s before requesting a new code.`, {
      retryAfter: result.retryAfter,
    });
  }
  return Response.json({ sentAt: result.sentAt, channel, devCode: result.devCode });
}
