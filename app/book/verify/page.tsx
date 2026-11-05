"use client";

import { ArrowRight, Clock, MessageSquareText, Pencil, RotateCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { HeartSpinner } from "@/components/HeartSpinner";
import { PrimaryButton } from "@/components/Buttons";
import { DemoOtpHint } from "@/components/DemoOtpHint";
import { OtpInput } from "@/components/OtpInput";
import { DEMO_OTP } from "@/lib/demo/constants";
import { PhoneShell } from "@/components/PhoneShell";
import { api, ApiRequestError } from "@/lib/api";
import { formatCountdown, formatPhone } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { useFlowGuard } from "@/lib/useFlowGuard";
import { useNow } from "@/lib/useNow";

const RESEND_MS = 30_000;

export default function BookVerifyPage() {
  const router = useRouter();
  const ready = useFlowGuard("bookAuth");
  const lead = useAppStore((s) => s.lead);
  const token = useAppStore((s) => s.sessionToken);
  const otpSentAt = useAppStore((s) => s.otpSentAt);
  const markOtpSent = useAppStore((s) => s.markOtpSent);
  const setBookingAuth = useAppStore((s) => s.setBookingAuth);
  const now = useNow();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [failures, setFailures] = useState(0);
  const [resending, setResending] = useState<"sms" | "whatsapp" | null>(null);
  const autoSend = useRef(false);

  useLayoutEffect(
    () => () => {
      setVerifying(false);
      setCode("");
    },
    [],
  );

  useEffect(() => {
    if (token) {
      router.replace("/book/patient");
      return;
    }
    if (!ready || autoSend.current || !lead.phone) return;
    autoSend.current = true;
    void (async () => {
      try {
        const res = await api.sendOtp({ name: lead.name, phone: lead.phone });
        markOtpSent(res.sentAt, res.devCode ?? DEMO_OTP);
      } catch (e) {
        if (e instanceof ApiRequestError && e.status === 429 && otpSentAt) return;
        setError(e instanceof ApiRequestError ? e.message : "Couldn't send the code.");
      }
    })();
  }, [ready, lead.name, lead.phone, markOtpSent, otpSentAt, router, token]);

  const remainingMs = otpSentAt && now ? Math.max(0, otpSentAt + RESEND_MS - now) : RESEND_MS;
  const canResend = ready && now !== null && remainingMs === 0;

  const resend = async (channel: "sms" | "whatsapp") => {
    setResending(channel);
    setError(null);
    setNotice(null);
    try {
      const res = await api.sendOtp({ name: lead.name, phone: lead.phone, channel });
      if (channel === "sms") markOtpSent(res.sentAt, res.devCode ?? DEMO_OTP);
      setNotice(channel === "sms" ? "A new code has been sent by SMS." : "We've sent the code to your WhatsApp.");
      setCode("");
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Couldn't resend the code.");
    } finally {
      setResending(null);
    }
  };

  const verify = async () => {
    if (code.length !== 4) {
      setError("Please enter the 4-digit code.");
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      const { token: sessionToken, patients } = await api.verifyOtp({ name: lead.name, phone: lead.phone, code });
      setBookingAuth(sessionToken, patients);
      router.push("/book/patient");
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Verification failed. Please try again.");
      setCode("");
      setVerifying(false);
      setFailures((n) => n + 1);
    }
  };

  return (
    <PhoneShell lineArt="none">
      <BackButton href="/results" label="Back to your results" />

      <h1 className="mt-8 text-[1.625rem] font-bold text-navy">Verify your mobile to book</h1>
      <p className="mt-2 text-[0.9375rem] text-muted">
        Confirm{" "}
        <span className="whitespace-nowrap font-bold text-navy">{lead.phone ? formatPhone(lead.phone) : "your number"}</span>{" "}
        with the demo code below{" "}
        <Link href="/results/verify" className="inline-flex items-center gap-0.5 font-semibold text-maroon hover:underline">
          Edit
          <Pencil className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </p>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void verify();
        }}
      >
        <div className="mt-7 rounded-[1.5rem] border border-line/70 bg-white/95 px-4 pb-5 pt-5 shadow-card min-[360px]:px-6">
          <DemoOtpHint className="mb-4" />
          <button
            type="button"
            onClick={() => {
              setCode(DEMO_OTP);
              setError(null);
            }}
            className="press mb-5 w-full rounded-xl border border-dashed border-brand-line bg-brand-soft/40 py-2 text-[0.8125rem] font-bold text-brand-dark"
          >
            Fill demo code {DEMO_OTP}
          </button>
          <OtpInput
            value={code}
            onChange={(v) => {
              setCode(v);
              setError(null);
            }}
            invalid={Boolean(error)}
            resetKey={failures}
            autoFocus
          />

          <p className="mt-6 flex items-center justify-center gap-1.5 text-[0.875rem] text-ink" aria-live="polite">
            <Clock className="h-4 w-4 text-maroon" aria-hidden />
            {canResend ? (
              "Didn't get the code?"
            ) : (
              <>
                Resend code in <span className="font-bold text-navy">{formatCountdown(remainingMs / 1000)}</span>
              </>
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 whitespace-nowrap text-[0.8125rem] font-semibold">
            <button
              type="button"
              onClick={() => void resend("sms")}
              disabled={!canResend || resending !== null}
              className="inline-flex items-center gap-1 text-maroon transition disabled:text-brand/40"
            >
              {resending === "sms" ? <HeartSpinner className="h-3.5 w-3.5" /> : <RotateCw className="h-3.5 w-3.5" aria-hidden />}
              Resend SMS
            </button>
            <span className="hidden text-slate-300 min-[360px]:inline" aria-hidden>
              ·
            </span>
            <button
              type="button"
              onClick={() => void resend("whatsapp")}
              disabled={!ready || resending !== null}
              className="inline-flex items-center gap-1 text-navy transition hover:text-maroon disabled:opacity-50"
            >
              {resending === "whatsapp" ? (
                <HeartSpinner className="h-4 w-4 text-maroon" />
              ) : (
                <MessageSquareText className="h-4 w-4 text-maroon" aria-hidden />
              )}
              Get via WhatsApp
            </button>
          </div>

          {error ? (
            <p role="alert" className="mt-4 text-center text-[0.8125rem] text-brand-dark">
              {error}
            </p>
          ) : notice ? (
            <p role="status" className="mt-4 text-center text-[0.8125rem] text-success">
              {notice}
            </p>
          ) : null}
        </div>

        <PrimaryButton type="submit" tone="maroon" className="mt-7" loading={verifying} disabled={!ready}>
          Verify &amp; continue
          <ArrowRight className="h-5 w-5" aria-hidden />
        </PrimaryButton>
      </form>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.8125rem] font-medium text-muted">
        <ShieldCheck className="h-4 w-4 fill-maroon text-white" aria-hidden />
        Only accessed by verified clinical specialists
      </p>

    </PhoneShell>
  );
}
