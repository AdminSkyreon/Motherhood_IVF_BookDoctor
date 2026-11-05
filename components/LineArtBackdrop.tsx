"use client";

import { useEffect, useState } from "react";

export type LineArtVariant = "subtle" | "feature" | "none";

const MASK = "url(/brand/lineart-mother.webp)";

// Fade in only on the first page of a visit, not on every client navigation.
let hasFadedIn = false;

export function LineArtBackdrop({ variant }: { variant: Exclude<LineArtVariant, "none"> }) {
  const [fade] = useState(() => !hasFadedIn);

  useEffect(() => {
    hasFadedIn = true;
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute bottom-0 right-0 z-0 bg-brand ${
        variant === "feature" ? "w-full opacity-[0.18]" : "w-[78%] opacity-[0.10]"
      } ${fade ? "animate-lineart-in" : ""}`}
      style={{
        aspectRatio: "564 / 299",
        maskImage: MASK,
        WebkitMaskImage: MASK,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "bottom center",
        WebkitMaskPosition: "bottom center",
      }}
    />
  );
}
