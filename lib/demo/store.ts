import type { Booking } from "@/lib/types";

export interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: Record<string, number>;
}

export interface PatientRecord {
  id: string;
  name: string;
  phone: string;
  age?: number;
}

export interface SessionRecord {
  phone: string;
  name: string;
  expiresAt: number;
}

const SEED_PATIENTS: PatientRecord[] = [
  { id: "MH-104523", name: "Meera Nair", phone: "9988776655", age: 32 },
  { id: "MH-104871", name: "Kavya Nair", phone: "9988776655", age: 28 },
];

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export const demoStore = {
  otps: new Map<string, OtpRecord>(),
  sessions: new Map<string, SessionRecord>(),
  bookings: new Map<string, Booking>(),
  patientRegistry: new Map<string, PatientRecord>(),
  callbacks: [] as Array<{ id: string; name: string; phone: string; reason: string; createdAt: string }>,
};

for (const p of SEED_PATIENTS) demoStore.patientRegistry.set(p.id, p);

export function createDemoSession(phone: string, name: string): string {
  const token = `demo-${crypto.randomUUID()}`;
  demoStore.sessions.set(token, { phone, name, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

export function getDemoSession(token: string | null | undefined): SessionRecord | null {
  if (!token) return null;
  const session = demoStore.sessions.get(token);
  if (!session || session.expiresAt < Date.now()) return null;
  return session;
}
