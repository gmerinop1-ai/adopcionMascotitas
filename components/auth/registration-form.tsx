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
import { Loader2, User, Mail, Lock, IdCard } from "lucide-react"

export function RegistrationForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    nro_dni: "",
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
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          nro_dni: formData.nro_dni,
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
      setSuccessMessage("¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...")
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
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Crear Cuenta de Adoptante</CardTitle>
        <CardDescription className="text-center">
          Completa todos los campos para crear tu cuenta y comenzar el proceso de adopción
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Información Personal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <User className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-sm text-muted-foreground">INFORMACIÓN PERSONAL</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres *</Label>
                <Input
                  id="nombres"
                  name="nombres"
                  type="text"
                  placeholder="Juan Carlos"
                  value={formData.nombres}
                  onChange={handleChange}
                  className={errors.nombres ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.nombres && <p className="text-sm text-destructive">{errors.nombres}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  placeholder="Pérez González"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className={errors.apellidos ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.apellidos && <p className="text-sm text-destructive">{errors.apellidos}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nro_dni">Documento de Identidad (DNI) *</Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nro_dni"
                  name="nro_dni"
                  type="text"
                  placeholder="12345678"
                  value={formData.nro_dni}
                  onChange={handleChange}
                  className={`pl-10 ${errors.nro_dni ? "border-destructive" : ""}`}
                  disabled={isLoading}
                  maxLength={8}
                />
              </div>
              {errors.nro_dni && <p className="text-sm text-destructive">{errors.nro_dni}</p>}
              <p className="text-xs text-muted-foreground">Ingresa tu número de DNI (8 dígitos)</p>
            </div>
          </div>

          {/* Información de Cuenta */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Mail className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-sm text-muted-foreground">INFORMACIÓN DE CUENTA</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electrónico *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.correo}
                  onChange={handleChange}
                  className={`pl-10 ${errors.correo ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {errors.correo && <p className="text-sm text-destructive">{errors.correo}</p>}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Lock className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-sm text-muted-foreground">CONTRASEÑA</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="8-12 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                <p className="text-xs text-muted-foreground">La contraseña debe tener entre 8 y 12 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmar_password">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmar_password"
                    name="confirmar_password"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={formData.confirmar_password}
                    onChange={handleChange}
                    className={`pl-10 ${errors.confirmar_password ? "border-destructive" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmar_password && <p className="text-sm text-destructive">{errors.confirmar_password}</p>}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              "Crear Cuenta de Adoptante"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Al crear una cuenta, podrás:</p>
            <ul className="mt-2 space-y-1">
              <li>• Ver y buscar mascotas disponibles</li>
              <li>• Enviar solicitudes de adopción</li>
              <li>• Hacer seguimiento a tus procesos</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
