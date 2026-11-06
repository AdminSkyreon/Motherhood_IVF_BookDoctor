import type { ReactNode } from "react";

/** Passthrough — question swap animation lives inside QuestionStep only. */
export default function CheckTemplate({ children }: { children: ReactNode }) {
  return children;
}
