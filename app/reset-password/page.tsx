import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Suspense } from "react"

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto max-w-[400px] py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Restablecer Contraseña</h1>
        <p className="text-muted-foreground">
          Ingresa tu nueva contraseña para completar el proceso de recuperación.
        </p>
      </div>
      <Suspense fallback={<div>Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}