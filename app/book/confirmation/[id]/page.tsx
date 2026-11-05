import { Suspense } from "react";
import { BookingFallback, BookingScreen } from "@/components/screens/BookingScreen";

async function Confirmation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingScreen id={id} variant="confirmation" />;
}

export default function ConfirmationPage({ params }: PageProps<"/book/confirmation/[id]">) {
  return (
    <Suspense fallback={<BookingFallback />}>
      <Confirmation params={params} />
    </Suspense>
  );
}
