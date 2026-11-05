import { CENTRES, feesFor } from "@/lib/data/centres";

const FEES = feesFor(false);

export async function GET() {
  return Response.json({ centres: CENTRES, fees: FEES });
}
