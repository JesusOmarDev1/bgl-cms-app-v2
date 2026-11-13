import type { Metadata } from "next"
import { AuthPage } from "@/components/shared/auth/AuthPage"
import { TURNSTILE_SECRET_KEY, TURNSTILE_SITE_KEY } from "@/lib/env/constants"

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión en la aplicación",
  keywords: ["login", "iniciar sesión", "autenticación"],
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  // Both keys are needed: the widget alone would let the server skip the gate.
  const captchaEnabled =
    Boolean(TURNSTILE_SITE_KEY) && Boolean(TURNSTILE_SECRET_KEY)
  return <AuthPage captchaEnabled={captchaEnabled} />
}
