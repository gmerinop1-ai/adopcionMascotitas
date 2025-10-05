"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateRegistrationForm } from "@/lib/validations"
import { Loader2 } from "lucide-react"

export function RegistrationForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre_completo: "",
    correo: "",
    password: "",
    confirmar_password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

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
    setSuccessMessage("")

    // Validate form
    const validationErrors = validateRegistrationForm(formData)
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
      const response = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_completo: formData.nombre_completo,
          correo: formData.correo,
          password: formData.password,
        }),
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
          setErrors({ general: data.error || "Error al crear la cuenta" })
        }
        return
      }

      // Success
      setSuccessMessage("Cuenta creada con éxito, ya puedes iniciar sesión")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error) {
      setErrors({ general: "Error de conexión. Por favor, intenta de nuevo." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Personal</CardTitle>
        <CardDescription>Completa todos los campos para crear tu cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-accent/10 text-accent-foreground border-accent">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre_completo">Nombre Completo *</Label>
            <Input
              id="nombre_completo"
              name="nombre_completo"
              type="text"
              placeholder="Juan Pérez"
              value={formData.nombre_completo}
              onChange={handleChange}
              className={errors.nombre_completo ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.nombre_completo && <p className="text-sm text-destructive">{errors.nombre_completo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo Electrónico *</Label>
            <Input
              id="correo"
              name="correo"
              type="email"
              placeholder="tu@email.com"
              value={formData.correo}
              onChange={handleChange}
              className={errors.correo ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.correo && <p className="text-sm text-destructive">{errors.correo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="8-12 caracteres"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            <p className="text-xs text-muted-foreground">La contraseña debe tener entre 8 y 12 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmar_password">Confirmar Contraseña *</Label>
            <Input
              id="confirmar_password"
              name="confirmar_password"
              type="password"
              placeholder="Repite tu contraseña"
              value={formData.confirmar_password}
              onChange={handleChange}
              className={errors.confirmar_password ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.confirmar_password && <p className="text-sm text-destructive">{errors.confirmar_password}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              "Crear Cuenta"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
