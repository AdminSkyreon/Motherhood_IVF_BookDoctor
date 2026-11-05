import type { Booking } from "@/lib/types";

function toIcsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

export function buildIcs(booking: Booking): string {
  const location = `Motherhood Hospital, ${booking.centre.name} - ${booking.centre.address}`;
  const description = [
    `Booking ID: #${booking.id}`,
    `Doctor: ${booking.doctor.name}`,
    "Please bring previous reports and scans, a list of medicines you take, and a photo ID.",
    "Arrive 15 minutes early for registration.",
  ].join("\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Motherhood Hospitals//Fertility Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:booking-${booking.id}@motherhoodindia.com`,
    `DTSTAMP:${toIcsDate(booking.createdAt)}`,
    `DTSTART:${toIcsDate(booking.slot.start)}`,
    `DTEND:${toIcsDate(booking.slot.end)}`,
    `SUMMARY:${escapeText(`Fertility consultation with ${booking.doctor.name}`)}`,
    `LOCATION:${escapeText(location)}`,
    `DESCRIPTION:${escapeText(description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Fertility consultation reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(booking: Booking) {
  const blob = new Blob([buildIcs(booking)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `motherhood-booking-${booking.id}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
