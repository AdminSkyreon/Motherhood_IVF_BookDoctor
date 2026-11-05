"use client";

import { CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PrimaryLink } from "@/components/Buttons";
import { DoctorPhoto } from "@/components/DoctorPhoto";
import { PhoneShell } from "@/components/PhoneShell";
import { Badge } from "@/components/Pills";
import { BookingHeader } from "@/components/screens/BookingScreen";
import { formatSlot } from "@/lib/format";
import { useAppStore } from "@/lib/store";

export default function MyBookingsPage() {
  const hydrated = useAppStore((s) => s.hydrated);
  const bookings = useAppStore((s) => s.bookings);
  const list = Object.values(bookings).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <PhoneShell>
      <BookingHeader title="My bookings" backHref="/" />
      <h1 className="mt-6 text-[1.5rem] font-bold text-navy">My Bookings</h1>

      {!hydrated ? null : list.length === 0 ? (
        <div className="mt-10 space-y-5 text-center">
          <p className="text-[0.9375rem] text-muted">You don&apos;t have any bookings yet.</p>
          <PrimaryLink href="/">Take the fertility check</PrimaryLink>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {list.map((booking) => (
            <li key={booking.id}>
              <Link
                href={`/bookings/${booking.id}`}
                className="flex items-center gap-4 rounded-[1.25rem] border border-line bg-white px-5 py-4 shadow-card transition hover:border-sky-line"
              >
                {booking.doctor.photo ? (
                  <DoctorPhoto doctor={booking.doctor} size={48} className="rounded-xl" />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-info">
                    <CalendarDays className="h-5 w-5" aria-hidden />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.9375rem] font-bold text-navy">{booking.doctor.name}</span>
                  <span className="mt-0.5 block text-[0.8125rem] text-muted">{formatSlot(booking.slot)}</span>
                  <span className="mt-0.5 block truncate text-[0.8125rem] text-muted">{booking.centre.name}</span>
                  <span className="mt-2 inline-block">
                    <Badge tone={booking.paymentStatus === "paid" ? "success" : "warning"}>
                      {booking.paymentStatus === "paid" ? "Paid" : "Payment pending"}
                    </Badge>
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PhoneShell>
  );
}
