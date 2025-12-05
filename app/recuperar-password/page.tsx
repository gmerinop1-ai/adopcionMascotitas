"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { PawPrint, ArrowLeft, Mail, Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { validateEmail } from "@/lib/auth"

type RecoveryStep = 'email' | 'verification' | 'new_password' | 'completed'

export default function RecuperarPasswordPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<RecoveryStep>('email')
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleCodeChange = (value: string) => {
    // Only allow digits and max 6 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 6)
    handleInputChange('code', cleanValue)
  }

  const sendRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage("")

    // Validate email
    if (!formData.email) {
      setErrors({ email: "Email es requerido" })
      return
    }

    if (!validateEmail(formData.email)) {
      setErrors({ email: "Formato de email inválido" })
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ email: data.error })
        return
      }

      setSuccessMessage(data.message)
      setCurrentStep('verification')

    } catch (error) {
      setErrors({ email: "Error de conexión. Inténtalo de nuevo." })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCodeAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate code
    if (!formData.code || formData.code.length !== 6) {
      setErrors({ code: "El código debe tener 6 dígitos" })
      return
    }

    // Validate new password
    if (!formData.newPassword) {
      setErrors({ newPassword: "Nueva contraseña es requerida" })
      return
    }

    if (formData.newPassword.length < 8 || formData.newPassword.length > 12) {
      setErrors({ newPassword: "La contraseña debe tener entre 8 y 12 caracteres" })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Las contraseñas no coinciden" })
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch('/api/verification/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: formData.code,
          type: 'password_reset',
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error.includes('código')) {
          setErrors({ code: data.error })
        } else {
          setErrors({ newPassword: data.error })
        }
        return
      }

      setSuccessMessage(data.message)
      setCurrentStep('completed')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?password_reset=true')
      }, 3000)

    } catch (error) {
      setErrors({ code: "Error de conexión. Inténtalo de nuevo." })
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = async () => {
    setErrors({})
    await sendRecoveryEmail(new Event('submit') as any)
  }

  if (currentStep === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-secondary/20 to-background">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">¡Contraseña Actualizada!</h2>
            <p className="text-muted-foreground mb-4">
              Tu contraseña ha sido restablecida exitosamente. Te estamos redirigiendo al login...
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === 'verification') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-secondary/20 to-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-2">
              <PawPrint className="h-8 w-8" />
              <span>Adopta una Mascota</span>
            </Link>
            <h1 className="text-3xl font-bold mt-4 mb-2">Verificar Código</h1>
            <p className="text-muted-foreground">Ingresa el código que enviamos a tu email</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Código de Verificación
              </CardTitle>
              <CardDescription>
                Enviamos un código de 6 dígitos a: <br />
                <strong>{formData.email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={verifyCodeAndResetPassword} className="space-y-4">
                {successMessage && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="code">Código de Verificación</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={formData.code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className={`text-center text-lg tracking-wider ${errors.code ? "border-destructive" : ""}`}
                    maxLength={6}
                    disabled={isLoading}
                  />
                  {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Tu nueva contraseña"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      className={`pl-10 ${errors.newPassword ? "border-destructive" : ""}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
                  <p className="text-xs text-muted-foreground">Entre 8 y 12 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repite tu nueva contraseña"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit"
                    disabled={isLoading || formData.code.length !== 6 || !formData.newPassword || !formData.confirmPassword}
                    className="flex-1"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cambiar Contraseña
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={resendCode}
                    disabled={isLoading}
                  >
                    Reenviar
                  </Button>
                </div>

                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={() => setCurrentStep('email')}
                  className="w-full"
                  disabled={isLoading}
                >
                  Cambiar Email
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Default email step
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-secondary/20 to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-2">
            <PawPrint className="h-8 w-8" />
            <span>Adopta una Mascota</span>
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Recuperar Contraseña</h1>
          <p className="text-muted-foreground">Te enviaremos un código para restablecer tu contraseña</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ingresa tu email</CardTitle>
            <CardDescription>Recibirás un código de verificación si tu email está registrado</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={sendRecoveryEmail} className="space-y-4">
              {errors.email && (
                <Alert className="border-destructive bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">{errors.email}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Código de Recuperación
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
