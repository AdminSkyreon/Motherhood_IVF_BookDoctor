import { randomInt } from "node:crypto";
import { db, type PatientRecord } from "@/lib/server/store";

export interface PatientService {
  listByPhone(phone: string): Promise<PatientRecord[]>;
  /** Returns the patient only if they are registered on the given phone number. */
  findForPhone(id: string, phone: string): Promise<PatientRecord | undefined>;
  findByName(name: string, phone: string): Promise<PatientRecord | undefined>;
  register(name: string, phone: string, age?: number): Promise<PatientRecord>;
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

class InMemoryPatientService implements PatientService {
  async listByPhone(phone: string) {
    return [...db.patientRegistry.values()].filter((p) => p.phone === phone);
  }

  async findForPhone(id: string, phone: string) {
    const record = db.patientRegistry.get(id);
    return record?.phone === phone ? record : undefined;
  }

  async findByName(name: string, phone: string) {
    if (!name.trim()) return undefined;
    return (await this.listByPhone(phone)).find((p) => sameName(p.name, name));
  }

  async register(name: string, phone: string, age?: number) {
    const existing = await this.findByName(name, phone);
    if (existing) return existing;
    let id = `MH-${randomInt(100_000, 1_000_000)}`;
    while (db.patientRegistry.has(id)) id = `MH-${randomInt(100_000, 1_000_000)}`;
    const record: PatientRecord = { id, name, phone, age };
    db.patientRegistry.set(id, record);
    return record;
  }
}

export const patientService: PatientService = new InMemoryPatientService();
