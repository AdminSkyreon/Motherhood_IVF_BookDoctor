"use client";

import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import { useAppStore } from "@/lib/store";

/** Reads a booking from the session store, falling back to the API. */
export function useBooking(id: string) {
  const hydrated = useAppStore((s) => s.hydrated);
  const cached = useAppStore((s) => s.bookings[id]);
  const token = useAppStore((s) => s.sessionToken);
  const addBooking = useAppStore((s) => s.addBooking);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || cached) return;
    let cancelled = false;
    api
      .getBooking(id, token)
      .then(({ booking }) => {
        if (!cancelled) addBooking(booking);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiRequestError ? e.message : "Couldn't load this booking.");
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, cached, id, token, addBooking]);

  return { booking: cached ?? null, error, loading: !cached && !error };
}
