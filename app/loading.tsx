import { BrandLoader } from "@/components/BrandLoader";
import { PhoneShell } from "@/components/PhoneShell";

export default function Loading() {
  return (
    <PhoneShell lineArt="none">
      <BrandLoader className="flex-1" />
    </PhoneShell>
  );
}
