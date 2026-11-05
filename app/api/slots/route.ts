import type { NextRequest } from "next/server";
import { getCentre, getDoctor } from "@/lib/data/centres";
import { jsonError } from "@/lib/server/http";
import { slotService } from "@/lib/services/slots";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const doctor = getDoctor(params.get("doctor"));
  const centre = getCentre(params.get("centre"));
  if (!doctor) return jsonError(404, "Doctor not found.");
  if (!centre || !doctor.centreIds.includes(centre.id)) return jsonError(400, "This doctor does not consult at that centre.");

  const days = await slotService.listDays(doctor.id, centre.id);
  return Response.json({ days });
}
