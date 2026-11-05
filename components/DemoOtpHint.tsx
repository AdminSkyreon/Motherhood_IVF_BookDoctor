import { KeyRound } from "lucide-react";
import { DEMO_OTP } from "@/lib/demo/constants";

export function DemoOtpHint({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3 text-center ${className}`}
      role="note"
      aria-label={`Demo one-time password is ${DEMO_OTP.split("").join(" ")}`}
    >
      <p className="flex items-center justify-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-info">
        <KeyRound className="h-3.5 w-3.5" aria-hidden />
        Demo OTP
      </p>
      <p className="mt-1 text-[0.8125rem] leading-snug text-navy">
        No SMS is sent. Enter{" "}
        <span className="inline-flex gap-1 font-bold tracking-[0.2em] text-maroon" aria-hidden>
          {DEMO_OTP.split("").map((digit, i) => (
            <span key={i} className="inline-flex h-7 min-w-[1.375rem] items-center justify-center rounded-md bg-white px-1 shadow-sm ring-1 ring-line/80">
              {digit}
            </span>
          ))}
        </span>{" "}
        below to continue.
      </p>
    </div>
  );
}
