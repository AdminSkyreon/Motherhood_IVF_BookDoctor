import type { NextRequest } from "next/server";
import { rankDoctors } from "@/lib/doctors";
import type { LatLng } from "@/lib/types";

function parseLocation(params: URLSearchParams): LatLng | null {
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  if (!params.has("lat") || !params.has("lng") || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const doctors = rankDoctors({
    location: parseLocation(params),
    fallbackCentreId: params.get("centre"),
    complexCase: params.get("complex") === "1",
  });
  return Response.json({ doctors });
}
