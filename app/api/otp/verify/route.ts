import { cleanName, cleanPhone, jsonError, readJson } from "@/lib/server/http";
import { otpService } from "@/lib/services/otp";
import { patientService } from "@/lib/services/patients";
import { createSession } from "@/lib/services/sessions";

const MESSAGES = {
  invalid: "That code doesn't match. Please check and try again.",
  expired: "This code has expired. Please request a new one.",
  too_many_attempts: "Too many incorrect attempts. Please request a new code.",
} as const;

export async function POST(request: Request) {
  const body = await readJson<{ name: string; phone: string; code: string }>(request);
  const phone = cleanPhone(body?.phone);
  const name = cleanName(body?.name);
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!phone || !name) return jsonError(400, "Missing name or mobile number.");
  if (!/^\d{4}$/.test(code)) return jsonError(400, "Please enter the 4-digit code.");

  const result = await otpService.verify(phone, code);
  if (!result.ok) return jsonError(result.reason === "invalid" ? 401 : 410, MESSAGES[result.reason]);

  const patients = await patientService.listByPhone(phone);
  return Response.json({
    token: createSession(phone, name),
    patients: patients.map(({ id, name, age }) => ({ id, name, age })),
  });
}
