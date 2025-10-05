import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { PawPrint } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-secondary/20 to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-2">
            <PawPrint className="h-8 w-8" />
            <span>Adopta una Mascota</span>
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Iniciar Sesión</h1>
          <p className="text-muted-foreground">Accede a tu cuenta para continuar</p>
        </div>

        <LoginForm />

        <div className="mt-6 space-y-4 text-center text-sm">
          <Link href="/recuperar-password" className="block text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>

          <p className="text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-medium text-primary hover:underline">
              Regístrate aquí
            </Link>
          </p>

          <Link href="/" className="block text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
