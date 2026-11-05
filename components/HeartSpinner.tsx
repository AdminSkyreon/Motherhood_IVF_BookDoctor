import { Heart } from "lucide-react";

/** Inline busy indicator for buttons and small rows; takes the surrounding text colour. */
export function HeartSpinner({ className = "h-5 w-5" }: { className?: string }) {
  return <Heart className={`animate-heartbeat shrink-0 fill-current ${className}`} aria-hidden />;
}
