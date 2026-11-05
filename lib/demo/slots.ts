import { demoStore } from "@/lib/demo/store";
import type { Slot, SlotDay } from "@/lib/types";

const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 24 * 3600_000;
const SLOT_MS = 15 * 60 * 1000;
const LEAD_TIME_MS = 30 * 60 * 1000;
const SESSIONS: Array<[number, number]> = [
  [10, 13],
  [16, 19],
];
const BOOKED_PERCENT = 35;
const BOOKING_WINDOW_DAYS = 14;

function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function istMidnight(ms: number): number {
  const ist = new Date(ms + IST_OFFSET_MS);
  return Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - IST_OFFSET_MS;
}

function dateKey(istMidnightMs: number): string {
  return new Date(istMidnightMs + IST_OFFSET_MS).toISOString().slice(0, 10);
}

function isTaken(doctorId: string, centreId: string, start: string): boolean {
  if (hash(`${doctorId}|${centreId}|${start}`) % 100 < BOOKED_PERCENT) return true;
  for (const booking of demoStore.bookings.values()) {
    if (booking.doctor.id === doctorId && booking.slot.start === start) return true;
  }
  return false;
}

export async function listDemoSlotDays(doctorId: string, centreId: string, now = Date.now()): Promise<SlotDay[]> {
  const first = istMidnight(now);
  const days: SlotDay[] = [];

  for (let d = 0; d < BOOKING_WINDOW_DAYS; d++) {
    const midnight = first + d * DAY_MS;
    const closed = new Date(midnight + IST_OFFSET_MS).getUTCDay() === 0;
    const slots: SlotDay["slots"] = [];

    if (!closed) {
      for (const [open, close] of SESSIONS) {
        for (let t = midnight + open * 3600_000; t < midnight + close * 3600_000; t += SLOT_MS) {
          if (t < now + LEAD_TIME_MS) continue;
          const start = new Date(t).toISOString();
          slots.push({
            start,
            end: new Date(t + SLOT_MS).toISOString(),
            available: !isTaken(doctorId, centreId, start),
          });
        }
      }
    }
    days.push({ date: dateKey(midnight), closed, slots });
  }
  return days;
}

export async function isDemoSlotBookable(doctorId: string, centreId: string, slot: Slot, now = Date.now()): Promise<boolean> {
  const days = await listDemoSlotDays(doctorId, centreId, now);
  return days.some((day) => day.slots.some((s) => s.start === slot.start && s.end === slot.end && s.available));
}
