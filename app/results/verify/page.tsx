"use client";

import { ArrowRight, Check, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackButton } from "@/components/BackButton";
import { PrimaryButton } from "@/components/Buttons";
import { PhoneField, TextField } from "@/components/Fields";
import { PhoneShell } from "@/components/PhoneShell";
import { api, ApiRequestError } from "@/lib/api";
import { INDIAN_MOBILE } from "@/lib/format";
import { TOTAL_QUESTIONS } from "@/lib/questions";
import { useAppStore } from "@/lib/store";
import { useFlowGuard } from "@/lib/useFlowGuard";

export default function VerifyPage() {
  const router = useRouter();
  const ready = useFlowGuard("answers");
  const lead = useAppStore((s) => s.lead);
  const setLead = useAppStore((s) => s.setLead);
  const markOtpSent = useAppStore((s) => s.markOtpSent);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; consent?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const clearError = (key: keyof typeof errors) =>
    setErrors((prev) => (prev[key] || prev.form ? { ...prev, [key]: undefined, form: undefined } : prev));

  const [prefilled, setPrefilled] = useState(false);
  if (ready && !prefilled) {
    setPrefilled(true);
    setName(lead.name);
    setPhone(lead.phone);
    setConsent(lead.consent);
  }

  const submit = async () => {
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Please enter your full name.";
    if (!INDIAN_MOBILE.test(phone)) next.phone = "Please enter a valid 10-digit mobile number.";
    if (!consent) next.consent = "Please agree so we can share your recommendation.";
    setErrors(next);
    if (next.name || next.phone || next.consent) return;

    setSubmitting(true);
    try {
      setLead({ name: name.trim(), phone, consent });
      const res = await api.sendOtp({ name: name.trim(), phone });
      markOtpSent(res.sentAt, res.devCode);
      router.push("/results/otp");
    } catch (e) {
      setErrors({ form: e instanceof ApiRequestError ? e.message : "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PhoneShell>
      <BackButton href={`/check/${TOTAL_QUESTIONS}`} />

      <h1 className="mt-8 text-[1.75rem] font-bold leading-tight text-navy">Your result is ready</h1>
      <p className="mt-3 text-[1rem] leading-relaxed text-muted">
        Enter your details to see your fertility score and personalised recommendation.
      </p>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="mt-7 space-y-5 rounded-[1.5rem] border border-line/70 bg-white/90 p-6 shadow-card"
      >
        <TextField
          label="Full name"
          value={name}
          onChange={(v) => {
            setName(v);
            clearError("name");
          }}
          placeholder="e.g. Sarah Jenkins"
          autoComplete="name"
          error={errors.name}
          trailing={<UserRound className="h-5 w-5 text-slate-400" aria-hidden />}
        />
        <PhoneField
          value={phone}
          onChange={(v) => {
            setPhone(v);
            clearError("phone");
          }}
          error={errors.phone}
        />

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                clearError("consent");
              }}
              className="peer sr-only"
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <span
              aria-hidden
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-[1.5px] transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 ${
                consent ? "border-brand bg-brand text-white" : "border-slate-300 bg-white"
              }`}
            >
              {consent ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
            </span>
            <span className="text-[0.875rem] leading-relaxed text-muted">
              I agree that Motherhood may use my answers to recommend next steps and contact me by phone.{" "}
              <a href="https://www.motherhoodindia.com/privacy-policy/" target="_blank" rel="noreferrer" className="font-semibold text-info">
                Privacy policy
              </a>
            </span>
          </label>
          {errors.consent ? (
            <p id="consent-error" className="mt-1.5 pl-9 text-[0.8125rem] text-brand-dark">
              {errors.consent}
            </p>
          ) : null}
        </div>

        {errors.form ? (
          <p role="alert" className="text-[0.8125rem] text-brand-dark">
            {errors.form}
          </p>
        ) : null}

        <PrimaryButton type="submit" loading={submitting} disabled={!ready}>
          Send OTP to verify
          <ArrowRight className="h-5 w-5" aria-hidden />
        </PrimaryButton>
      </form>
    </PhoneShell>
  );
}
