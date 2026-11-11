import type { Metadata } from "next"
import { AuthPage } from "@/components/shared/auth/AuthPage"

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión en la aplicación",
  keywords: ["login", "iniciar sesión", "autenticación"],
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return <AuthPage />
}
