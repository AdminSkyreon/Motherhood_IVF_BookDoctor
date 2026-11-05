"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookingFallback, BookingScreen } from "@/components/screens/BookingScreen";

function DetailsContent() {
  const params = useSearchParams();
  const id = params.get("id");
  if (!id) {
    return (
      <BookingFallback>
        <p className="text-[0.9375rem] text-muted">No booking reference found.</p>
      </BookingFallback>
    );
  }
  return <BookingScreen id={id} variant="details" />;
}

export default function BookingDetailsPage() {
  return (
    <Suspense fallback={<BookingFallback />}>
      <DetailsContent />
    </Suspense>
  );
}
