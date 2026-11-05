import { INDIAN_MOBILE } from "@/lib/format";

export function jsonError(status: number, error: string, extra?: Record<string, unknown>) {
  return Response.json({ error, ...extra }, { status });
}

export async function readJson<T>(request: Request): Promise<Partial<T> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Partial<T>) : null;
  } catch {
    return null;
  }
}

export function cleanPhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "").slice(-10);
  return INDIAN_MOBILE.test(digits) ? digits : null;
}

export function cleanName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  return name.length >= 2 && name.length <= 80 ? name : null;
}
