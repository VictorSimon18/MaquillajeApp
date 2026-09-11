import type { Metadata } from "next";
import { Baloo_2, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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
      <body className="min-h-full bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
