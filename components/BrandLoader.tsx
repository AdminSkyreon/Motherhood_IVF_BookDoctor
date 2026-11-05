import Image from "next/image";

export function BrandLoader({
  caption,
  size = 56,
  className = "",
}: {
  caption?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`} role="status" aria-live="polite">
      <span
        className="relative flex items-center justify-center"
        style={{ width: `${(size * 1.6) / 16}rem`, height: `${(size * 1.6) / 16}rem` }}
      >
        <span aria-hidden className="animate-loader-ring absolute inset-0 rounded-full bg-brand/15" />
        <span aria-hidden className="animate-loader-ring absolute inset-0 rounded-full bg-brand/10 [animation-delay:0.6s]" />
        <Image
          src="/brand/motherhood-mark.webp"
          alt=""
          width={size}
          height={size}
          priority
          className="animate-heartbeat relative"
          style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}
        />
      </span>
      <span className={caption ? "text-[0.875rem] font-medium text-muted" : "sr-only"}>{caption ?? "Loading"}</span>
    </div>
  );
}
