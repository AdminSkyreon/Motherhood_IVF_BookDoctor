import { cleanName, cleanPhone, jsonError, readJson } from "@/lib/server/http";
import { callbackService } from "@/lib/services/callbacks";

const REASONS = new Set(["general", "counsellor"]);

export async function POST(request: Request) {
  const body = await readJson<{ name: string; phone: string; reason: string }>(request);
  const name = cleanName(body?.name);
  const phone = cleanPhone(body?.phone);
  const reason = typeof body?.reason === "string" && REASONS.has(body.reason) ? body.reason : "general";

  if (!name) return jsonError(400, "Please enter your full name.");
  if (!phone) return jsonError(400, "Please enter a valid 10-digit mobile number.");

  const record = await callbackService.request({ name, phone, reason });
  return Response.json({ id: record.id }, { status: 201 });
}
