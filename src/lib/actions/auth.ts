"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthFormState {
  error?: string;
  message?: string;
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!email || !password) {
    return { error: "Introduce tu email y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  redirect(next.startsWith("/") ? next : "/");
}

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;

/**
 * El username duplicado se detecta contra el mensaje de error que devuelve
 * signUp: la fila en `profiles` la crea un trigger sobre auth.users dentro
 * de la misma transacción, así que una violación de la restricción única
 * de username hace fallar la creación del usuario y Supabase Auth envuelve
 * ese error de Postgres en su propia respuesta. No hay forma de comprobar
 * la disponibilidad del username por separado antes de registrarse (RLS
 * solo deja leer `profiles` a usuarios ya autenticados, y durante el
 * registro todavía no lo está) — así que esto es un best-effort por texto,
 * no una detección garantizada al 100%.
 */
function isUsernameTakenError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("username") || lower.includes("profiles_username");
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim();

  if (!email || !password || !username) {
    return { error: "Introduce tu email, contraseña y nombre de usuario." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return {
      error:
        "El nombre de usuario debe tener entre 3 y 20 caracteres: solo letras, números y guion bajo.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    if (isUsernameTakenError(error.message)) {
      return { error: "Ese nombre de usuario ya está en uso." };
    }
    return { error: error.message };
  }

  if (!data.session) {
    return {
      message:
        "Cuenta creada. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.",
    };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
