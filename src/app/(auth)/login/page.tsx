"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { signIn, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";

const initialState: AuthFormState = {};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Inicia sesión</h1>
        <p className="mt-1 text-sm text-ink-muted">Accede a tu armario de maquillaje.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        <Field label="Email">
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="tu@email.com"
            className="input-field"
          />
        </Field>
        <Field label="Contraseña">
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="input-field"
          />
        </Field>

        {state.error ? <p className="text-sm font-semibold text-coral">{state.error}</p> : null}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isPending}
          icon={<LogIn size={16} />}
        >
          {isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="text-center text-sm text-ink-muted">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-primary">
          Crea una
        </Link>
      </p>
    </Card>
  );
}
