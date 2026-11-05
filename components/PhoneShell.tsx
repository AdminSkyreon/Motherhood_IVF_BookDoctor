import type { ReactNode } from "react";
import { LineArtBackdrop, type LineArtVariant } from "@/components/LineArtBackdrop";

// Bottom space reserved so the line art never sits under content (art aspect ratio is 564:299).
const ART_SPACE: Record<LineArtVariant, string> = {
  feature: "pb-[min(53vw,228px)]",
  subtle: "pb-[min(41vw,178px)]",
  none: "pb-[calc(2rem+env(safe-area-inset-bottom))]",
};

export function PhoneShell({
  children,
  lineArt = "subtle",
  footer,
}: {
  children: ReactNode;
  lineArt?: LineArtVariant;
  /** Sticky action bar pinned to the bottom of the viewport. */
  footer?: ReactNode;
}) {
  const space = footer && lineArt === "none" ? "pt-4 pb-3 short:pt-3" : `pt-5 ${ART_SPACE[lineArt]}`;
  return (
    <main className="relative flex flex-1 flex-col overflow-x-clip">
      <div className="relative flex flex-1 flex-col">
        <div className={`relative z-10 flex flex-1 flex-col px-5 ${space}`}>{children}</div>
        {lineArt !== "none" ? <LineArtBackdrop variant={lineArt} /> : null}
      </div>
      {footer ? (
        <div className="sticky bottom-0 z-20 border-t border-line bg-white/95 px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_-16px_rgb(27_43_75/0.35)] backdrop-blur short:pb-[calc(0.5rem+env(safe-area-inset-bottom))] short:pt-2">
          {footer}
        </div>
      ) : null}
    </main>
  );
}
