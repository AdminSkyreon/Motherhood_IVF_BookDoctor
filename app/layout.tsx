import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { AppHeader } from "@/components/AppHeader";
import { StoreHydrator } from "@/components/StoreHydrator";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fertility Check | Motherhood Fertility & IVF",
  description:
    "Take a 2-minute fertility check based on clinical guidelines and book a consultation with a Motherhood fertility specialist.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full bg-white">
        <StoreHydrator />
        <div className="flex min-h-dvh justify-center">
          <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-white sm:border-x sm:border-line/70">
            <AppHeader />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
