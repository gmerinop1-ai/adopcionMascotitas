import { RecoverPasswordForm } from "@/components/auth/recover-password-form"

export default function RecoverPasswordPage() {
  return (
    <div className="container mx-auto max-w-[400px] py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Recuperar Contraseña</h1>
        <p className="text-muted-foreground">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>
      <RecoverPasswordForm />
    </div>
  )
}
