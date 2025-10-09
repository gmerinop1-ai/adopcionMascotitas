"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState("")
  const [isValidToken, setIsValidToken] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)
  const [passwordChanged, setPasswordChanged] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
      verifyToken(tokenParam)
    } else {
      setIsCheckingToken(false)
    }
  }, [searchParams])

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch("/api/auth/verify-reset-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: tokenToVerify }),
      })

      if (response.ok) {
        setIsValidToken(true)
      } else {
        setIsValidToken(false)
      }
    } catch (error) {
      console.error("Error verificando token:", error)
      setIsValidToken(false)
    } finally {
      setIsCheckingToken(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
      })
      return
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al restablecer la contraseña")
      }

      setPasswordChanged(true)
      toast({
        title: "¡Contraseña restablecida!",
        description: "Tu contraseña ha sido actualizada exitosamente",
      })

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push("/login")
      }, 3000)

    } catch (error) {
      console.error("Error al restablecer contraseña:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo restablecer la contraseña",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingToken) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verificando enlace de recuperación...</p>
        </CardContent>
      </Card>
    )
  }

  if (!token) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Alert variant="destructive">
            <AlertDescription>
              Enlace de recuperación inválido. No se encontró el token de verificación.
            </AlertDescription>
          </Alert>
          <Button asChild className="mt-4">
            <Link href="/recuperar-password">Solicitar nuevo enlace</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!isValidToken) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Alert variant="destructive">
            <AlertDescription>
              Este enlace de recuperación ha expirado o no es válido. 
              Los enlaces de recuperación expiran después de 1 hora.
            </AlertDescription>
          </Alert>
          <Button asChild className="mt-4">
            <Link href="/recuperar-password">Solicitar nuevo enlace</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (passwordChanged) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">¡Contraseña restablecida!</h3>
          <p className="text-muted-foreground mb-4">
            Tu contraseña ha sido actualizada exitosamente.
          </p>
          <p className="text-sm text-muted-foreground">
            Serás redirigido al inicio de sesión en unos segundos...
          </p>
          <Button asChild className="mt-4">
            <Link href="/login">Ir al inicio de sesión</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restablecer Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Restableciendo contraseña...
              </>
            ) : (
              "Restablecer Contraseña"
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