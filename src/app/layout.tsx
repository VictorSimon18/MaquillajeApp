import type { Metadata } from "next";
import { Baloo_2, Plus_Jakarta_Sans } from "next/font/google";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import "./globals.css";
import { TabBar } from "@/components/layout/TabBar";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Glowbox — Tu armario de maquillaje",
  description:
    "Glowbox es tu armario virtual de maquillaje: evita duplicados, controla la caducidad y descubre qué usar según la ocasión.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${baloo.variable} ${jakarta.variable} h-full`}>
      <body className="min-h-full bg-bg text-ink antialiased">
        <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
          <header className="sticky top-0 z-30 flex items-center gap-2 bg-bg/90 px-5 pb-3 pt-5 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
            <Link href="/" className="flex items-center gap-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
                <Sparkles size={17} strokeWidth={2.5} />
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight text-ink">
                Glowbox
              </span>
            </Link>
          </header>
          <main className="flex-1 px-5 pb-28">{children}</main>
          <TabBar />
        </div>
      </body>
    </html>
  );
}
