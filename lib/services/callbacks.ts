import { randomUUID } from "node:crypto";
import { db, type CallbackRecord } from "@/lib/server/store";

export interface CallbackService {
  request(input: { name: string; phone: string; reason: string }): Promise<CallbackRecord>;
}

class InMemoryCallbackService implements CallbackService {
  async request(input: { name: string; phone: string; reason: string }) {
    const record: CallbackRecord = { id: randomUUID(), createdAt: new Date().toISOString(), ...input };
    db.callbacks.push(record);
    console.info(`[mock-callback] ${record.reason} callback requested for +91${record.phone}`);
    return record;
  }
}

export const callbackService: CallbackService = new InMemoryCallbackService();
