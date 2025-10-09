"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, CheckCircle, Mail } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export function RecoverPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setEmailSent(false)

    try {
      const response = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar el correo de recuperación")
      }

      // Mostrar mensaje de éxito
      setEmailSent(true)
      toast({
        title: "¡Correo enviado exitosamente!",
        description: "Revisa tu bandeja de entrada y carpeta de spam",
      })
      
      // Limpiar el campo de email después del envío exitoso
      setEmail("")
    } catch (error) {
      console.error("Error al recuperar contraseña:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo enviar el correo de recuperación",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar Contraseña</CardTitle>
        <CardDescription>
          Te enviaremos un correo con instrucciones para restablecer tu contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emailSent && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>¡Correo enviado exitosamente!</strong>
              <br />
              Revisa tu bandeja de entrada y carpeta de spam. El enlace expirará en 1 hora.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando correo...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Enviar Correo de Recuperación
              </>
            )}
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar Contraseña</CardTitle>
        <CardDescription>
          Te enviaremos un correo con instrucciones para restablecer tu contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Correo"
            )}
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}