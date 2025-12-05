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
import { Loader2, User, Mail, Lock, IdCard, CheckCircle, AlertCircle } from "lucide-react"

type VerificationStep = 'form' | 'dni_verification' | 'email_verification' | 'completed'

interface VerificationState {
  dni: {
    verified: boolean
    loading: boolean
    code: string
  }
  email: {
    verified: boolean
    loading: boolean
    code: string
  }
}

export function RegistrationForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<VerificationStep>('form')
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
  const [verification, setVerification] = useState<VerificationState>({
    dni: { verified: false, loading: false, code: "" },
    email: { verified: false, loading: false, code: "" }
  })

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

  const handleVerificationCodeChange = (type: 'dni' | 'email', value: string) => {
    // Only allow digits and max 6 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 6)
    setVerification(prev => ({
      ...prev,
      [type]: { ...prev[type], code: cleanValue }
    }))
  }

  const sendVerificationCode = async (type: 'dni' | 'email') => {
    try {
      setVerification(prev => ({
        ...prev,
        [type]: { ...prev[type], loading: true }
      }))

      const endpoint = '/api/verification/send-code'
      const requestType = type === 'dni' ? 'dni_verification' : 'email_verification'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.correo,
          dni: type === 'dni' ? formData.nro_dni : undefined,
          type: requestType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors(prev => ({ ...prev, [`${type}_verification`]: data.error }))
        return
      }

      setSuccessMessage(data.message)
      setCurrentStep(type === 'dni' ? 'dni_verification' : 'email_verification')

    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        [`${type}_verification`]: `Error enviando código de ${type === 'dni' ? 'DNI' : 'email'}` 
      }))
    } finally {
      setVerification(prev => ({
        ...prev,
        [type]: { ...prev[type], loading: false }
      }))
    }
  }

  const verifyCode = async (type: 'dni' | 'email') => {
    try {
      setVerification(prev => ({
        ...prev,
        [type]: { ...prev[type], loading: true }
      }))

      const endpoint = '/api/verification/verify-code'
      const requestType = type === 'dni' ? 'dni_verification' : 'email_verification'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.correo,
          code: verification[type].code,
          type: requestType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors(prev => ({ ...prev, [`${type}_code`]: data.error }))
        return
      }

      setVerification(prev => ({
        ...prev,
        [type]: { ...prev[type], verified: true, code: "" }
      }))

      setSuccessMessage(data.message)

      // If both are verified, proceed to registration
      const otherType = type === 'dni' ? 'email' : 'dni'
      if (verification[otherType].verified) {
        await completeRegistration()
      } else {
        // Move to next verification step
        if (type === 'dni') {
          setCurrentStep('email_verification')
        }
      }

    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        [`${type}_code`]: `Error verificando código de ${type === 'dni' ? 'DNI' : 'email'}` 
      }))
    } finally {
      setVerification(prev => ({
        ...prev,
        [type]: { ...prev[type], loading: false }
      }))
    }
  }

  const completeRegistration = async () => {
    try {
      setIsLoading(true)
      
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
          setErrors({ general: data.error || "Error en el registro" })
        }
        return
      }

      setSuccessMessage("¡Cuenta creada con éxito! Redirigiendo...")
      setCurrentStep('completed')
      
      setTimeout(() => {
        router.push("/login?registered=true")
      }, 2000)

    } catch (error) {
      setErrors({ general: "Error de conexión. Inténtalo de nuevo." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInitialSubmit = async (e: React.FormEvent) => {
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

    // Start verification process
    await sendVerificationCode('dni')
  }

  if (currentStep === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-secondary/20 to-background">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">¡Registro Exitoso!</h2>
            <p className="text-muted-foreground mb-4">
              Tu cuenta ha sido creada correctamente. Te estamos redirigiendo...
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === 'dni_verification') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-secondary/20 to-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="h-5 w-5" />
              Verificar DNI
            </CardTitle>
            <CardDescription>
              Hemos enviado un código a tu email para verificar tu DNI: {formData.nro_dni}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="dni_code">Código de verificación (6 dígitos)</Label>
              <Input
                id="dni_code"
                type="text"
                placeholder="123456"
                value={verification.dni.code}
                onChange={(e) => handleVerificationCodeChange('dni', e.target.value)}
                className={errors.dni_code ? "border-destructive" : ""}
                maxLength={6}
                disabled={verification.dni.loading}
              />
              {errors.dni_code && (
                <p className="text-sm text-destructive">{errors.dni_code}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => verifyCode('dni')}
                disabled={verification.dni.code.length !== 6 || verification.dni.loading}
                className="flex-1"
              >
                {verification.dni.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar DNI
              </Button>
              <Button 
                variant="outline" 
                onClick={() => sendVerificationCode('dni')}
                disabled={verification.dni.loading}
              >
                Reenviar
              </Button>
            </div>

            <Button 
              variant="ghost" 
              onClick={() => setCurrentStep('form')}
              className="w-full"
            >
              Volver al formulario
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === 'email_verification') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-secondary/20 to-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Verificar Email
            </CardTitle>
            <CardDescription>
              {verification.dni.verified && (
                <div className="flex items-center gap-1 text-green-600 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  DNI verificado exitosamente
                </div>
              )}
              Enviamos un código de verificación a: {formData.correo}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email_code">Código de verificación (6 dígitos)</Label>
              <Input
                id="email_code"
                type="text"
                placeholder="123456"
                value={verification.email.code}
                onChange={(e) => handleVerificationCodeChange('email', e.target.value)}
                className={errors.email_code ? "border-destructive" : ""}
                maxLength={6}
                disabled={verification.email.loading}
              />
              {errors.email_code && (
                <p className="text-sm text-destructive">{errors.email_code}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => verifyCode('email')}
                disabled={verification.email.code.length !== 6 || verification.email.loading}
                className="flex-1"
              >
                {verification.email.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Completar Registro
              </Button>
              <Button 
                variant="outline" 
                onClick={() => sendVerificationCode('email')}
                disabled={verification.email.loading}
              >
                Reenviar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
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
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default form view
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-secondary/20 to-background">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Crear Cuenta</h1>
          <p className="text-muted-foreground mt-2">
            Únete a nuestra comunidad de adopción responsable
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Completa tus datos. Verificaremos tu DNI y email antes del registro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInitialSubmit} className="space-y-6">
              {errors.general && (
                <Alert className="border-destructive bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
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
                  <p className="text-xs text-muted-foreground">
                    Verificaremos tu DNI con RENIEC para mayor seguridad
                  </p>
                </div>
              </div>

              {/* Account Information */}
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
                  <p className="text-xs text-muted-foreground">
                    Te enviaremos códigos de verificación a este email
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Tu contraseña"
                        value={formData.password}
                        onChange={handleChange}
                        className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    <p className="text-xs text-muted-foreground">Entre 8 y 12 caracteres</p>
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
                    {errors.confirmar_password && (
                      <p className="text-sm text-destructive">{errors.confirmar_password}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <strong>Proceso de verificación:</strong>
                    <br />1. Verificaremos tu DNI con RENIEC
                    <br />2. Confirmaremos tu email con un código
                    <br />3. Crearemos tu cuenta una vez verificado
                  </AlertDescription>
                </Alert>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Iniciar Verificación
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
