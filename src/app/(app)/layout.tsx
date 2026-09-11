import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { TabBar } from "@/components/layout/TabBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 bg-bg/90 px-5 pb-3 pt-5 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
            <Sparkles size={17} strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink">
            Glowbox
          </span>
        </Link>

        <form action={signOut} className="flex items-center gap-2">
          <span className="hidden max-w-32 truncate text-xs font-medium text-ink-muted sm:inline">
            {user.email}
          </span>
          <button
            type="submit"
            aria-label="Cerrar sesión"
            title={user.email ?? "Cerrar sesión"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-soft shadow-sm ring-1 ring-black/[0.04] active:scale-95"
          >
            <LogOut size={15} />
          </button>
        </form>
      </header>
      <main className="flex-1 px-5 pb-28">{children}</main>
      <TabBar />
    </div>
  );
}
