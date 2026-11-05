import { Logo } from "@/components/Logo";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-white pt-[env(safe-area-inset-top)]">
      <div className="flex h-16 items-center px-5 short:h-14">
        <Logo />
      </div>
    </header>
  );
}
