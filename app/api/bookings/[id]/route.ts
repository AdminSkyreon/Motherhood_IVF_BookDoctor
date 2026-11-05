import { jsonError } from "@/lib/server/http";
import { bookingService } from "@/lib/services/bookings";
import { getSession } from "@/lib/services/sessions";

export async function GET(request: Request, ctx: RouteContext<"/api/bookings/[id]">) {
  const session = getSession(request);
  if (!session) return jsonError(401, "Please verify your number to view this booking.");

  const { id } = await ctx.params;
  const booking = await bookingService.get(id);
  if (!booking || booking.patient.phone !== session.phone) return jsonError(404, "Booking not found.");

  return Response.json({ booking });
}
