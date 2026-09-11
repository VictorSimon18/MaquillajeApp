"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, LayoutGrid, Plus, Wand2 } from "lucide-react";

const TABS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/armario", label: "Armario", icon: LayoutGrid },
  { href: "/anadir", label: "Añadir", icon: Plus, isAction: true },
  { href: "/recomendacion", label: "Para ti", icon: Wand2 },
  { href: "/alertas", label: "Alertas", icon: Bell },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2">
        {TABS.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          if (tab.isAction) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={tab.label}
                className="-mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-pink-300/50 transition-transform active:scale-95"
              >
                <Icon size={26} strokeWidth={2.5} />
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-semibold transition-colors"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 2}
                className={active ? "text-primary" : "text-ink-muted"}
              />
              <span className={active ? "text-primary" : "text-ink-muted"}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
