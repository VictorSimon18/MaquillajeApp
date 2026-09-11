"use client";

import { useActionState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { signUp, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";

const initialState: AuthFormState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUp, initialState);

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Empieza a organizar tu armario de maquillaje.
        </p>
      </div>

      {state.message ? (
        <p className="rounded-2xl bg-mint-soft px-4 py-3 text-sm font-semibold text-mint">
          {state.message}
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          <Field label="Nombre de usuario">
            <input
              type="text"
              name="username"
              required
              autoComplete="username"
              placeholder="Ej. glow_maria"
              pattern="[A-Za-z0-9_]{3,20}"
              title="Entre 3 y 20 caracteres: letras, números y guion bajo."
              className="input-field"
            />
          </Field>
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
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              className="input-field"
            />
          </Field>

          {state.error ? (
            <p className="text-sm font-semibold text-coral">{state.error}</p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isPending}
            icon={<UserPlus size={16} />}
          >
            {isPending ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-ink-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Inicia sesión
        </Link>
      </p>
    </Card>
  );
}
