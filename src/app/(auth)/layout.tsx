import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-10">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
          <Sparkles size={24} strokeWidth={2.5} />
        </span>
        <span className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Glowbox
        </span>
        <p className="text-sm text-ink-muted">Tu armario de maquillaje, siempre a mano.</p>
      </div>
      {children}
    </div>
  );
}
