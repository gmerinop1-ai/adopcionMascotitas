import { RegistrationForm } from "@/components/auth/registration-form"
import Link from "next/link"
import { PawPrint } from "lucide-react"

export default function RegistroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-secondary/20 to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-2">
            <PawPrint className="h-8 w-8" />
            <span>Adopta una Mascota</span>
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Crear Cuenta</h1>
          <p className="text-muted-foreground">Regístrate para comenzar el proceso de adopción</p>
        </div>

        <RegistrationForm />

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
