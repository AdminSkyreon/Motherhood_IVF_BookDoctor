"use client";

import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import { PrimaryButton } from "@/components/Buttons";
import { PhoneField, TextField } from "@/components/Fields";
import { api, ApiRequestError } from "@/lib/api";
import { INDIAN_MOBILE } from "@/lib/format";

type Reason = "general" | "counsellor";

interface Props {
  open: boolean;
  onClose: () => void;
  reason: Reason;
  defaultName?: string;
  defaultPhone?: string;
}

export function CallbackSheet({ open, onClose, reason, defaultName = "", defaultPhone = "" }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title={reason === "counsellor" ? "Speak to a counsellor" : "Request a call back"}>
      <CallbackForm onClose={onClose} reason={reason} defaultName={defaultName} defaultPhone={defaultPhone} />
    </BottomSheet>
  );
}

function CallbackForm({ onClose, reason, defaultName, defaultPhone }: Omit<Props, "open">) {
  const [name, setName] = useState(defaultName ?? "");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; form?: string }>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const submit = async () => {
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Please enter your full name.";
    if (!INDIAN_MOBILE.test(phone)) next.phone = "Please enter a valid 10-digit mobile number.";
    setErrors(next);
    if (next.name || next.phone) return;

    setStatus("sending");
    try {
      await api.requestCallback({ name: name.trim(), phone, reason });
      setStatus("done");
    } catch (e) {
      setErrors({ form: e instanceof ApiRequestError ? e.message : "Something went wrong." });
      setStatus("idle");
    }
  };

  if (status === "done") {
    return (
      <div className="space-y-5 py-2 text-center" role="status">
        <CircleCheck className="animate-pop-in mx-auto h-12 w-12 text-success" aria-hidden />
        <div className="space-y-1.5">
          <p className="text-[1.0625rem] font-bold text-navy">Request received</p>
          <p className="text-[0.875rem] text-muted">
            {reason === "counsellor"
              ? "A fertility counsellor will call you shortly to talk things through, at your pace."
              : "Our care team will call you shortly to answer your questions."}
          </p>
        </div>
        <PrimaryButton onClick={onClose}>Done</PrimaryButton>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <p className="text-[0.875rem] text-muted">
        {reason === "counsellor"
          ? "Share your details and a counsellor will call you. There's no obligation to book."
          : "Share your details and our care team will call you back."}
      </p>
      <TextField
        label="Full name"
        value={name}
        onChange={setName}
        autoComplete="name"
        placeholder="e.g. Sarah Jenkins"
        error={errors.name}
      />
      <PhoneField value={phone} onChange={setPhone} error={errors.phone} />
      {errors.form ? (
        <p role="alert" className="text-[0.8125rem] text-brand-dark">
          {errors.form}
        </p>
      ) : null}
      <PrimaryButton type="submit" loading={status === "sending"}>
        Request call
      </PrimaryButton>
    </form>
  );
}
