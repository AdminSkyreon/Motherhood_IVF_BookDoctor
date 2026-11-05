"use client";

import {
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronUp,
  Info,
  Lock,
  MapPin,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DoctorProfileSheet } from "@/components/booking/DoctorProfileSheet";
import { BackButton } from "@/components/BackButton";
import { companionLabel } from "@/components/booking/CompanionToggle";
import { BottomSheet } from "@/components/BottomSheet";
import { OutlineButton, PrimaryButton } from "@/components/Buttons";
import { DoctorPhoto } from "@/components/DoctorPhoto";
import { PhoneShell } from "@/components/PhoneShell";
import { api, ApiRequestError } from "@/lib/api";
import { resolveBookingPatient } from "@/lib/bookingPatient";
import { tapFeedback } from "@/lib/haptics";
import { feesFor, getCentre, getDoctor } from "@/lib/data/centres";
import { formatCountdown, formatRupees, formatSlot } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import type { PaymentMode } from "@/lib/types";
import { useFlowGuard } from "@/lib/useFlowGuard";
import { useNow } from "@/lib/useNow";

const SLOT_HOLD_MS = 15 * 60 * 1000;

function DetailRow({
  icon,
  label,
  change,
  children,
}: {
  icon: ReactNode;
  label: string;
  change?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4 px-5 py-4">
      <span className="mt-0.5 text-navy" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-muted">{label}</p>
          {change ? (
            <Link
              href={change.href}
              aria-label={change.label}
              className="text-[0.8125rem] font-bold text-info underline underline-offset-2 hover:text-navy"
            >
              Change
            </Link>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const ready = useFlowGuard("slot");
  const patients = useAppStore((s) => s.patients);
  const bookingPatient = useAppStore((s) => s.bookingPatient);
  const token = useAppStore((s) => s.sessionToken);
  const companion = useAppStore((s) => s.companion);
  const resolved = bookingPatient ? resolveBookingPatient(bookingPatient, patients) : null;
  const registered = resolved?.registered ?? null;
  const fees = feesFor(Boolean(registered));
  const addBooking = useAppStore((s) => s.addBooking);
  const doctor = getDoctor(useAppStore((s) => s.selectedDoctorId));
  const centre = getCentre(useAppStore((s) => s.bookingCentreId));
  const slot = useAppStore((s) => s.selectedSlot);
  const slotHeldAt = useAppStore((s) => s.slotHeldAt);
  const now = useNow();

  const [submitting, setSubmitting] = useState<PaymentMode | null>(null);
  const [error, setError] = useState<{ message: string; pickAgain?: boolean } | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [payOptionsVisible, setPayOptionsVisible] = useState(false);
  const payRevealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = payRevealRef.current;
    if (!target || !ready) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setPayOptionsVisible(true);
      },
      { root: null, threshold: 0.15, rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [ready]);

  const holdUntil = slotHeldAt ? slotHeldAt + SLOT_HOLD_MS : null;
  const holdRemaining = holdUntil && now ? Math.min(SLOT_HOLD_MS, Math.max(0, holdUntil - now)) : null;
  const holdExpired = holdRemaining === 0;

  const displayName = registered?.name ?? resolved?.name ?? "Patient";

  const book = async (paymentMode: PaymentMode) => {
    if (!slot || !doctor || !centre || !bookingPatient) return;
    setSubmitting(paymentMode);
    setError(null);
    try {
      const { booking } = await api.createBooking(
        {
          centreId: centre.id,
          doctorId: doctor.id,
          slot,
          companion: companion ?? "partner",
          paymentMode,
          ...(bookingPatient.kind === "registered"
            ? { patientId: bookingPatient.patientId }
            : { patientName: bookingPatient.name, patientAge: bookingPatient.age }),
        },
        token,
      );
      addBooking(booking);
      setCheckoutOpen(false);
      router.push(`/book/confirmation/${booking.id}`);
    } catch (e) {
      const status = e instanceof ApiRequestError ? e.status : 0;
      setCheckoutOpen(false);
      setError({
        message: e instanceof ApiRequestError ? e.message : "Couldn't complete your booking.",
        pickAgain: status === 409,
      });
    } finally {
      setSubmitting(null);
    }
  };

  const disabled = !ready || !slot || !doctor || !centre || !bookingPatient || holdExpired || submitting !== null;

  return (
    <PhoneShell
      lineArt="none"
      footer={
        <>
          {error ? (
            <p role="alert" className="mb-2 text-center text-[0.8125rem] text-brand-dark">
              {error.message}{" "}
              {error.pickAgain ? (
                <Link href="/book" className="font-bold underline">
                  Pick another time
                </Link>
              ) : null}
            </p>
          ) : null}
          <p className="mb-2 flex items-baseline justify-between text-[0.8125rem] text-muted short:mb-1.5">
            <span className="truncate">{displayName} · Total payable</span>
            <span className="ml-2 shrink-0 text-[1.0625rem] font-bold text-navy">{formatRupees(fees.total)}</span>
          </p>
          {payOptionsVisible ? (
            <div className="animate-fade-in grid grid-cols-2 gap-2.5">
              <OutlineButton
                onClick={() => void book("hospital")}
                loading={submitting === "hospital"}
                disabled={disabled}
                className="h-12 px-2 text-[0.9375rem] short:h-11"
              >
                Pay at hospital
              </OutlineButton>
              <PrimaryButton
                onClick={() => setCheckoutOpen(true)}
                disabled={disabled}
                tone="solid"
                className="h-12 px-2 text-[0.9375rem] short:h-11"
              >
                Pay now
              </PrimaryButton>
            </div>
          ) : (
            <p className="flex items-center justify-center gap-1.5 py-2.5 text-[0.8125rem] font-medium text-muted">
              <ChevronUp className="h-4 w-4 animate-bounce text-info" aria-hidden />
              Scroll to choose how to pay
            </p>
          )}
        </>
      }
    >
      <div className="flex items-center gap-3">
        <BackButton href="/book" label="Back to booking" />
        <p className="text-[0.8125rem] font-semibold uppercase tracking-wide text-muted">Step 3 of 3</p>
      </div>

      <h1 className="mt-5 text-[1.5rem] font-bold leading-tight text-navy short:mt-3 tall:mt-6">Review and pay</h1>
      <p className="mt-1 text-[0.875rem] text-muted">Check the details below and choose how you would like to pay.</p>

      <section className="mt-5 divide-y divide-line overflow-hidden rounded-[1.25rem] border border-line bg-white shadow-card">
        <DetailRow
          icon={<UserRound className="h-6 w-6" strokeWidth={1.6} />}
          label="Patient"
          change={{ href: "/book/patient", label: "Change patient" }}
        >
          <p className="text-[1.0625rem] font-bold text-navy">{displayName}</p>
          {registered ? (
            <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[0.75rem] font-semibold text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              Registered · {registered.id}
              {registered.age ? ` · ${registered.age} yrs` : ""}
            </p>
          ) : resolved ? (
            <p className="mt-0.5 text-[0.8125rem] text-muted">
              New patient · {resolved.age} years
            </p>
          ) : null}
        </DetailRow>

        <DetailRow
          icon={<UserRound className="h-6 w-6" strokeWidth={1.6} />}
          label="Doctor"
          change={{ href: "/book", label: "Change doctor" }}
        >
          {doctor ? (
            <div className="mt-1.5 flex items-center gap-3">
              <button
                type="button"
                aria-label={`View profile for ${doctor.name}`}
                onClick={() => {
                  tapFeedback();
                  setProfileOpen(true);
                }}
                className="press shrink-0 rounded-xl ring-2 ring-transparent transition-[box-shadow,ring-color] hover:ring-info/35 focus-visible:ring-info/50"
              >
                <DoctorPhoto doctor={doctor} size={52} priority className="rounded-xl" />
              </button>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[1.0625rem] font-bold leading-tight text-navy">
                  {doctor.name}
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-success">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                    Verified
                  </span>
                </p>
                <p className="mt-0.5 text-[0.8125rem] leading-snug text-muted">
                  {doctor.specialty} · {doctor.experience}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-1 h-12 skeleton rounded-xl" />
          )}
        </DetailRow>

        <DetailRow icon={<MapPin className="h-6 w-6" strokeWidth={1.6} />} label="Centre">
          {centre ? (
            <>
              <p className="text-[1.0625rem] font-bold text-navy">{centre.name}</p>
              <p className="mt-0.5 text-[0.8125rem] text-muted">{centre.address}</p>
            </>
          ) : (
            <div className="mt-1 h-5 w-48 skeleton rounded" />
          )}
        </DetailRow>

        <DetailRow
          icon={<CalendarDays className="h-6 w-6" strokeWidth={1.6} />}
          label="Date & Time"
          change={{ href: "/book", label: "Change date and time" }}
        >
          {slot ? (
            <p className="text-[1rem] font-bold text-navy">{formatSlot(slot)}</p>
          ) : (
            <div className="mt-1 h-5 w-56 skeleton rounded" aria-label="Loading slot" />
          )}
          {slot && holdExpired ? (
            <p className="mt-1 text-[0.8125rem] font-medium text-brand-dark">
              Your reservation expired.{" "}
              <Link href="/book" className="font-bold underline">
                Pick a time again
              </Link>
            </p>
          ) : slot ? (
            <p className="mt-1 text-[0.8125rem] font-medium text-brand-dark" aria-live="off">
              {holdRemaining !== null
                ? `Slot reserved · ${formatCountdown(holdRemaining / 1000)} left`
                : "Slot reserved for 15 minutes"}
            </p>
          ) : null}
        </DetailRow>

        <DetailRow
          icon={<Users className="h-6 w-6" strokeWidth={1.6} />}
          label="Coming to the hospital"
          change={{ href: "/book", label: "Change who is coming" }}
        >
          <p className="text-[0.9375rem] font-semibold text-navy">{companion ? companionLabel(companion) : "—"}</p>
        </DetailRow>
      </section>

      <section className="mt-4 rounded-[1.25rem] border border-line bg-white px-5 py-4 shadow-card" aria-labelledby="fees-title">
        <div className="flex items-center justify-between">
          <h2 id="fees-title" className="text-[0.875rem] font-bold uppercase tracking-wide text-navy">
            Fee &amp; Charges
          </h2>
          <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-success">Standard OP rates</span>
        </div>
        <dl className="mt-3 space-y-2 text-[0.8125rem] uppercase text-ink/80">
          <div className="flex justify-between">
            <dt>OP Consultation</dt>
            <dd className="font-medium">{formatRupees(fees.consultation)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Registration Charges</dt>
            <dd className="font-medium">
              {registered ? (
                <>
                  <span className="mr-1.5 text-muted line-through">{formatRupees(feesFor(false).registration)}</span>
                  {formatRupees(0)}
                </>
              ) : (
                formatRupees(fees.registration)
              )}
            </dd>
          </div>
          {registered ? (
            <p className="text-[0.75rem] normal-case text-success">Registration waived for registered patients</p>
          ) : null}
        </dl>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <p className="text-[0.9375rem] font-bold text-navy">Total Payable</p>
          <p className="text-[1.25rem] font-bold text-navy">{formatRupees(fees.total)}</p>
        </div>
      </section>

      <div ref={payRevealRef} className="mt-4 scroll-mt-24">
        {payOptionsVisible ? (
          <section
            className="animate-fade-in rounded-[1.25rem] border border-line bg-white p-4 shadow-card"
            aria-labelledby="pay-choice-title"
          >
            <h2 id="pay-choice-title" className="text-[0.875rem] font-bold uppercase tracking-wide text-navy">
              How would you like to pay?
            </h2>
            <p className="mt-1 text-[0.8125rem] text-muted">
              Pay at the hospital front desk, or pay online now to skip the queue.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <OutlineButton
                onClick={() => void book("hospital")}
                loading={submitting === "hospital"}
                disabled={disabled}
                className="h-12 px-2 text-[0.9375rem] short:h-11"
              >
                Pay at hospital
              </OutlineButton>
              <PrimaryButton
                onClick={() => setCheckoutOpen(true)}
                disabled={disabled}
                tone="solid"
                className="h-12 px-2 text-[0.9375rem] short:h-11"
              >
                Pay now
              </PrimaryButton>
            </div>
          </section>
        ) : (
          <p className="rounded-xl border border-dashed border-line bg-slate-50/80 px-4 py-3 text-center text-[0.8125rem] text-muted">
            Scroll a little further to unlock payment options
          </p>
        )}
      </div>

      <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-[0.8125rem] leading-relaxed text-navy">
        <Info className="mt-0.5 h-4 w-4 shrink-0 fill-navy text-white" aria-hidden />
        <span>
          <strong>Pay at hospital</strong> to settle at the front desk, or <strong>Pay now</strong> online to skip the queue.
        </span>
      </p>

      <p className="mt-4 text-center text-[0.8125rem] leading-relaxed text-muted">
        Pay now by credit or debit card, net banking, UPI or wallet, via <span className="font-bold text-ink">BillDesk</span>.
      </p>

      <div className="mt-5 flex items-center justify-center gap-4 border-t border-line pt-4 text-[0.75rem] text-muted">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 fill-success text-white" aria-hidden />
          256-bit Encrypted Checkout
        </span>
        <span aria-hidden>·</span>
        <span>Free cancellation up to 2 hrs prior</span>
      </div>

      <DoctorProfileSheet
        doctor={doctor ?? null}
        centreLabel={centre?.name.split(",")[0]}
        open={profileOpen && Boolean(doctor)}
        onClose={() => setProfileOpen(false)}
      />

      <BottomSheet open={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="BillDesk secure checkout">
        <div className="space-y-5">
          <div className="rounded-2xl border border-line bg-slate-50 p-4">
            <p className="text-[0.8125rem] text-muted">Paying Motherhood Hospitals</p>
            <p className="mt-1 text-[1.625rem] font-bold text-navy">{formatRupees(fees.total)}</p>
            <p className="mt-1 text-[0.8125rem] text-muted">
              {doctor?.name} · {slot ? formatSlot(slot) : ""}
            </p>
          </div>
          <p className="flex items-start gap-2 text-[0.8125rem] text-muted">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Demo checkout. No money will be charged; the payment is simulated as successful.
          </p>
          <PrimaryButton onClick={() => void book("online")} loading={submitting === "online"}>
            Pay {formatRupees(fees.total)}
          </PrimaryButton>
        </div>
      </BottomSheet>
    </PhoneShell>
  );
}
