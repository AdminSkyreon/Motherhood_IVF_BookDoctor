import type { Slot } from "@/lib/types";

const TIME_ZONE = "Asia/Kolkata";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export function formatSlot(slot: Slot): string {
  const start = new Date(slot.start);
  const end = new Date(slot.end);
  return `${dateFormat.format(start)}, ${timeFormat.format(start)} - ${timeFormat.format(end)}`;
}

const shortTimeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const dayPartsFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});

export function formatTime(iso: string): string {
  return shortTimeFormat.format(new Date(iso));
}

/** Splits a YYYY-MM-DD (IST) date key into display parts. */
export function formatDayParts(dateKey: string): { weekday: string; day: string; month: string; long: string } {
  const date = new Date(`${dateKey}T12:00:00+05:30`);
  const parts = Object.fromEntries(dayPartsFormat.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    weekday: parts.weekday,
    day: parts.day,
    month: parts.month,
    long: `${parts.weekday}, ${parts.day} ${parts.month}`,
  };
}

/** Hour of the day (0-23) in IST. */
export function istHour(iso: string): number {
  return new Date(new Date(iso).getTime() + 330 * 60_000).getUTCHours();
}

export function formatRupees(amount: number, { decimals = true } = {}): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  })}`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export const INDIAN_MOBILE = /^[6-9]\d{9}$/;
