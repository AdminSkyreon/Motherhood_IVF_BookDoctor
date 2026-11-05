/** A very short vibration on supported (mostly Android) devices; no-op elsewhere. */
export function tapFeedback() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(8);
    } catch {
      // Some browsers throw when vibration is blocked by user settings.
    }
  }
}
