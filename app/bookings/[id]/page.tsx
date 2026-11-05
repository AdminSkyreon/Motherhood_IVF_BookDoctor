import { Suspense } from "react";
import { BookingFallback, BookingScreen } from "@/components/screens/BookingScreen";

async function Details({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingScreen id={id} variant="details" />;
}

export default function BookingDetailsPage({ params }: PageProps<"/bookings/[id]">) {
  return (
    <Suspense fallback={<BookingFallback />}>
      <Details params={params} />
    </Suspense>
  );
}
