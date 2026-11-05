"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BrandLoader } from "@/components/BrandLoader";
import { PhoneShell } from "@/components/PhoneShell";

/** Legacy route — OTP now happens at the start of booking. */
export default function LegacyResultsOtpPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/book/verify");
  }, [router]);

  return (
    <PhoneShell lineArt="none">
      <BrandLoader className="flex-1" caption="Taking you to booking…" />
    </PhoneShell>
  );
}
