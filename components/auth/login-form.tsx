"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateLoginForm } from "@/lib/validations"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    correo: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate form
    const validationErrors = validateLoginForm(formData)
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {}
      validationErrors.forEach((error) => {
        errorMap[error.field] = error.message
      })
      setErrors(errorMap)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          const errorMap: Record<string, string> = {}
          data.errors.forEach((error: { field: string; message: string }) => {
            errorMap[error.field] = error.message
          })
          setErrors(errorMap)
        } else {
          setErrors({ general: data.error || "Error al iniciar sesión" })
        }
        return
      }

      // Success - login user and redirect based on role
      login(data.user)
      
      if (data.user.rol === "administrador") {
        router.push("/admin")
      } else {
        router.push("/mascotas")
      }
    } catch (error) {
      setErrors({ general: "Error de conexión. Por favor, intenta de nuevo." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accede a tu cuenta</CardTitle>
        <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="correo">Correo Electrónico</Label>
            <Input
              id="correo"
              name="correo"
              type="email"
              placeholder="tu@email.com"
              value={formData.correo}
              onChange={handleChange}
              className={errors.correo ? "border-destructive" : ""}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.correo && <p className="text-sm text-destructive">{errors.correo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
                disabled={isLoading}
                autoComplete="current-password"
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
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>

          <div className="space-y-2">
            <div className="text-center">
              <Link 
                href="/recuperar-password"
                className="text-sm text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="text-center">
              <Link 
                href="/"
                className="text-sm text-muted-foreground hover:underline"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
