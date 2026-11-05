"use client";

import { ArrowLeft, Heart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { BeforeVisitCard } from "@/components/BeforeVisitCard";
import { BookingDetailsCard } from "@/components/BookingDetailsCard";
import { BrandLoader } from "@/components/BrandLoader";
import { PhoneShell } from "@/components/PhoneShell";
import { publicPath } from "@/lib/publicPath";
import { useAppStore } from "@/lib/store";
import { useBooking } from "@/lib/useBooking";

const FLOATING_HEARTS = [
  { left: "-6%", size: 12, drift: -18 },
  { left: "14%", size: 9, drift: -8 },
  { left: "36%", size: 14, drift: 4 },
  { left: "58%", size: 10, drift: 10 },
  { left: "78%", size: 13, drift: 16 },
  { left: "98%", size: 9, drift: 22 },
];

const circleButton =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-navy shadow-sm transition hover:bg-slate-50";

const pillLink =
  "inline-flex h-14 flex-1 items-center justify-center rounded-full border-[1.5px] border-info bg-white text-[1rem] font-semibold text-navy transition hover:bg-sky-50";

export function BookingHeader({ title, backHref }: { title: string; backHref: string }) {
  return (
    <div className="flex items-center justify-between">
      <Link href={backHref} aria-label="Go back" className={circleButton}>
        <ArrowLeft className="h-5 w-5" aria-hidden />
      </Link>
      <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-muted">{title}</p>
      <Link href="/" aria-label="Close" className={circleButton}>
        <X className="h-5 w-5" aria-hidden />
      </Link>
    </div>
  );
}

export function BookingFallback({ children }: { children?: ReactNode }) {
  return (
    <PhoneShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" aria-busy={!children}>
        {children ?? <BrandLoader caption="Loading your appointment…" />}
      </div>
    </PhoneShell>
  );
}

export function BookingScreen({ id, variant }: { id: string; variant: "confirmation" | "details" }) {
  const router = useRouter();
  const startOver = useAppStore((s) => s.startOver);
  const { booking, error } = useBooking(id);

  if (error) {
    return (
      <BookingFallback>
        <p className="text-[1rem] font-semibold text-navy">{error}</p>
        <Link href="/bookings" className="font-semibold text-info underline">
          Go to My Bookings
        </Link>
      </BookingFallback>
    );
  }
  if (!booking) return <BookingFallback />;

  const isConfirmation = variant === "confirmation";
  const firstName = booking.patient.name.trim().split(/\s+/)[0];

  return (
    <PhoneShell lineArt={isConfirmation ? "feature" : "subtle"}>
      <BookingHeader
        title={isConfirmation ? "Confirmation" : "Booking details"}
        backHref={isConfirmation ? "/results" : "/bookings"}
      />

      {isConfirmation ? (
        <div className="mt-5 text-center">
          <span className="relative mx-auto flex h-[5.25rem] w-[5.25rem] items-center justify-center">
            <span className="animate-pop-in flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-full bg-brand-soft/70 ring-[6px] ring-brand-soft/40">
              <Image src={publicPath("/brand/motherhood-mark.webp")} alt="" width={52} height={52} priority className="h-[3.25rem] w-[3.25rem]" />
            </span>
            {FLOATING_HEARTS.map((h, i) => (
              <Heart
                key={i}
                aria-hidden
                className="animate-heart-float absolute fill-brand text-brand"
                style={
                  {
                    left: h.left,
                    bottom: 10,
                    width: `${h.size / 16}rem`,
                    height: `${h.size / 16}rem`,
                    animationDelay: `${0.25 + i * 0.09}s`,
                    "--drift": `${h.drift}px`,
                    opacity: 0,
                  } as CSSProperties
                }
              />
            ))}
          </span>
          <h1 className="mt-4 text-[1.5rem] font-bold text-navy">
            {firstName ? `You're all set, ${firstName}` : "Your appointment is booked"}
          </h1>
          <p className="mx-auto mt-2 max-w-[19.375rem] text-[0.875rem] leading-relaxed text-muted">
            Your booking details are below. You can view the appointment anytime under{" "}
            <span className="font-semibold text-navy">My Bookings</span>.
          </p>
        </div>
      ) : (
        <h1 className="mt-6 text-[1.5rem] font-bold text-navy">Your appointment</h1>
      )}

      <div className="mt-6 space-y-4">
        <BookingDetailsCard booking={booking} />
        <BeforeVisitCard />
      </div>

      <div className="mt-6 flex gap-3">
        {isConfirmation ? (
          <Link href={`/bookings/detail?id=${encodeURIComponent(booking.id)}`} className={pillLink}>
            View booking
          </Link>
        ) : null}
        <Link href="/bookings" className={pillLink}>
          My Bookings
        </Link>
      </div>

      <button
        type="button"
        onClick={() => {
          startOver();
          router.push("/");
        }}
        className="mx-auto mt-5 text-[0.875rem] font-medium text-info hover:underline"
      >
        Start over
      </button>
    </PhoneShell>
  );
}
