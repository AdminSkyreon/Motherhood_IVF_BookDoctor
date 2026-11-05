"use client";

import { ArrowRight, CalendarDays, Check, Copy } from "lucide-react";
import { useState } from "react";
import { DoctorPhoto } from "@/components/DoctorPhoto";
import { InfoRow } from "@/components/InfoRow";
import { Badge } from "@/components/Pills";
import { formatRupees, formatSlot } from "@/lib/format";
import { downloadIcs } from "@/lib/ics";
import type { Booking } from "@/lib/types";

export function BookingDetailsCard({ booking }: { booking: Booking }) {
  const [copied, setCopied] = useState(false);
  const paid = booking.paymentStatus === "paid";
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.centre.mapsQuery)}`;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(booking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-[1.25rem] border border-line bg-white px-5 shadow-card" aria-label="Booking details">
      <div className="flex items-center justify-between border-b border-line py-4">
        <p className="text-[0.8125rem] uppercase tracking-[0.08em] text-muted">
          Booking ID <span className="ml-1.5 text-[0.9375rem] font-bold tracking-normal text-navy">#{booking.id}</span>
        </p>
        <button
          type="button"
          onClick={() => void copyId()}
          className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-[0.8125rem] font-semibold text-info transition hover:bg-sky-100"
          aria-label={copied ? "Booking ID copied" : "Copy booking ID"}
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <dl className="py-2">
        {booking.patient.patientId ? (
          <InfoRow label={booking.patient.newlyRegistered ? "Your new Patient ID" : "Patient ID"}>
            <span className="block">{booking.patient.patientId}</span>
            <span className="block text-[0.8125rem] font-normal text-ink/80">
              {booking.patient.name}
              {booking.patient.age ? ` · ${booking.patient.age} years` : ""}
            </span>
            {booking.patient.newlyRegistered ? (
              <span className="block text-[0.8125rem] font-normal text-muted">
                Keep this handy, it skips registration next time
              </span>
            ) : null}
          </InfoRow>
        ) : null}
        <InfoRow label="When">{formatSlot(booking.slot)}</InfoRow>
        <InfoRow label="Where">
          <span className="block">{booking.centre.name}</span>
          <span className="block text-[0.8125rem] font-normal text-muted">{booking.centre.address}</span>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-info hover:underline"
          >
            Get Directions
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </InfoRow>
        <InfoRow label="Doctor">
          <span className="flex items-center gap-3">
            {booking.doctor.photo ? <DoctorPhoto doctor={booking.doctor} size={40} className="rounded-full" /> : null}
            <span className="min-w-0">
              <span className="block">{booking.doctor.name}</span>
              {booking.doctor.specialty ? (
                <span className="block text-[0.8125rem] font-normal text-muted">{booking.doctor.specialty}</span>
              ) : null}
            </span>
          </span>
        </InfoRow>
        <InfoRow label="Coming">
          {booking.patient.companion === "partner" ? "Together with your partner" : "On your own"}
        </InfoRow>
        <InfoRow label="Fee">
          <span className="block">
            {formatRupees(booking.fees.total)}
            <span className="font-normal text-ink/80">{paid ? ", paid online" : ", pay at the hospital"}</span>
          </span>
          <span className="mt-1.5 inline-block">
            <Badge tone={paid ? "success" : "warning"}>{paid ? "Paid" : "Payment pending"}</Badge>
          </span>
        </InfoRow>
      </dl>

      <div className="flex items-center justify-between border-t border-line py-4">
        <p className="text-[0.8125rem] text-muted">Add to your calendar</p>
        <button
          type="button"
          onClick={() => downloadIcs(booking)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[0.8125rem] font-semibold text-navy shadow-sm transition hover:bg-slate-50"
        >
          <CalendarDays className="h-4 w-4 text-info" aria-hidden />
          Sync Calendar
        </button>
      </div>
    </section>
  );
}
