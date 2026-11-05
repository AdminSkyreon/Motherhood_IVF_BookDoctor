import type { Booking } from "@/lib/types";

export interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: Record<string, number>;
}

export interface CallbackRecord {
  id: string;
  name: string;
  phone: string;
  reason: string;
  createdAt: string;
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

interface MemoryStore {
  otps: Map<string, OtpRecord>;
  sessions: Map<string, SessionRecord>;
  bookings: Map<string, Booking>;
  callbacks: CallbackRecord[];
  /** Keyed by Patient ID. One phone number can be shared by several patients (e.g. family members). */
  patientRegistry: Map<string, PatientRecord>;
}

// Demo records standing in for the hospital's patient registry.
const SEED_PATIENTS: PatientRecord[] = [
  { id: "MH-104523", name: "Meera Nair", phone: "9988776655", age: 32 },
  { id: "MH-104871", name: "Kavya Nair", phone: "9988776655", age: 28 },
];

// Kept on globalThis so dev-mode module reloads don't wipe the data.
const globalForStore = globalThis as typeof globalThis & { __motherhoodStore?: MemoryStore };

export const db: MemoryStore = (globalForStore.__motherhoodStore ??= {
  otps: new Map(),
  sessions: new Map(),
  bookings: new Map(),
  callbacks: [],
  patientRegistry: new Map(),
});
db.patientRegistry ??= new Map();
for (const p of SEED_PATIENTS) if (!db.patientRegistry.has(p.id)) db.patientRegistry.set(p.id, p);
