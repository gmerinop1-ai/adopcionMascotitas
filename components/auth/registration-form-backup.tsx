'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, User, Mail, Lock, IdCard } from 'lucide-react'

interface FormData {
  nombres: string
  apellidos: string
  nro_dni: string
  correo: string
  password: string
  confirmPassword: string
}

export function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    nombres: '',
    apellidos: '',
    nro_dni: '',
    correo: '',
    password: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.nombres.trim()) newErrors.nombres = 'Los nombres son requeridos'
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son requeridos'
    if (!formData.nro_dni.trim()) newErrors.nro_dni = 'El DNI es requerido'
    else if (!/^\d{8}$/.test(formData.nro_dni)) newErrors.nro_dni = 'El DNI debe tener 8 dígitos'
    
    if (!formData.correo.trim()) newErrors.correo = 'El correo es requerido'
    else if (!/\S+@\S+\.\S+/.test(formData.correo)) newErrors.correo = 'Formato de correo inválido'
    
    if (!formData.password) newErrors.password = 'La contraseña es requerida'
    else if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          setErrors({ general: data.error || 'Error al crear la cuenta' })
        }
        return
      }

      setSuccessMessage('¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      setErrors({ general: 'Error de conexión. Por favor, intenta de nuevo.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-secondary/20 to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
          <CardDescription className="text-center">
            Completa todos los campos para crear tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="nro_dni">DNI *</Label>
              <Input
                id="nro_dni"
                name="nro_dni"
                type="text"
                placeholder="12345678"
                value={formData.nro_dni}
                onChange={handleChange}
                className={errors.nro_dni ? "border-destructive" : ""}
                disabled={isLoading}
                maxLength={8}
              />
              {errors.nro_dni && <p className="text-sm text-destructive">{errors.nro_dni}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electrónico *</Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                placeholder="correo@ejemplo.com"
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
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Cuenta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}