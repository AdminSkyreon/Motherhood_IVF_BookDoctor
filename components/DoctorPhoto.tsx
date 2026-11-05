import Image from "next/image";
import { publicPath } from "@/lib/publicPath";
import type { Doctor } from "@/lib/types";

export function DoctorPhoto({
  doctor,
  size,
  priority = false,
  className = "",
}: {
  doctor: Doctor;
  /** Size in px at the 16px root; rendered in rem so it scales with the phone width. */
  size: number;
  priority?: boolean;
  className?: string;
}) {
  const rem = `${size / 16}rem`;
  return (
    <span
      className={`relative block shrink-0 overflow-hidden bg-brand-soft/60 ${className}`}
      style={{ width: rem, height: rem }}
    >
      <Image
        src={publicPath(doctor.photo)}
        alt={doctor.name}
        fill
        sizes={`${Math.ceil((size * 17) / 16)}px`}
        priority={priority}
        className="object-cover object-top"
      />
    </span>
  );
}
