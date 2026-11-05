import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" aria-label="Motherhood Fertility & IVF home" className="inline-flex shrink-0">
      <Image
        src="/brand/motherhood-logo.webp"
        alt="Motherhood Fertility & IVF"
        width={540}
        height={208}
        priority
        sizes="125px"
        className="h-12 w-auto short:h-10"
      />
    </Link>
  );
}
