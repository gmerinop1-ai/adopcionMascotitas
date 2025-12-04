'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Smartphone, Shield } from 'lucide-react'

interface CulqiYapePaymentProps {
  amount: number
  donorName: string
  donorEmail: string
  frequency: 'one-time' | 'monthly'
  message?: string
  onSuccess: (data: any) => void
  onError: (error: string) => void
  onCancel: () => void
}

export function CulqiYapePayment({
  amount,
  donorName,
  donorEmail,
  frequency,
  message,
  onSuccess,
  onError,
  onCancel
}: CulqiYapePaymentProps) {
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPhoneNumber = (value: string) => {
    // Solo permitir números y limitar a 9 dígitos
    const cleaned = value.replace(/[^0-9]/g, '')
    return cleaned.slice(0, 9)
  }

  const validatePhone = () => {
    if (phoneNumber.length !== 9) {
      return 'El número debe tener 9 dígitos'
    }
    
    if (!phoneNumber.startsWith('9')) {
      return 'El número debe empezar con 9'
    }
    
    return null
  }

  const handleProcessPayment = async () => {
    const phoneError = validatePhone()
    if (phoneError) {
      setError(phoneError)
      return
    }

    setIsLoading(true)
    setError('')
    setStep('processing')

    try {
      console.log('[CULQI YAPE] Procesando pago...')
      const response = await fetch('/api/payments/culqi/yape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          amount,
          donor_name: donorName,
          donor_email: donorEmail,
          frequency,
          message
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error procesando pago con Yape')
      }

      console.log('[CULQI YAPE] Respuesta:', result)

      if (result.pending) {
        // Mostrar instrucciones para completar en Yape
        setError(`Completa el pago en tu app Yape. ${result.message || ''}`)
        setStep('form')
        
        // Opcional: redirigir a URL de Yape si está disponible
        if (result.yape_url) {
          window.open(result.yape_url, '_blank')
        }
        
        return
      }

      if (result.success) {
        setStep('success')
        onSuccess(result)
      } else {
        throw new Error(result.message || 'Pago no aprobado')
      }

    } catch (error: any) {
      console.error('[CULQI YAPE] ❌ Error:', error)
      setError(error.message)
      setStep('error')
      onError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepForm = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-purple-600" />
        </div>
        <CardTitle className="text-2xl">Pagar con Yape</CardTitle>
        <CardDescription>
          Ingresa tu número de Yape para continuar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Información del pago */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Monto a pagar:</span>
            <span className="text-xl font-bold text-purple-600">S/ {amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Alerta de Culqi + Yape */}
        <Alert className="bg-purple-50 border-purple-200">
          <Smartphone className="w-4 h-4" />
          <AlertDescription className="text-sm">
            <strong>📱 YAPE VIA CULQI</strong><br/>
            Pago seguro procesado por Culqi. Recibirás notificación en tu app Yape.
          </AlertDescription>
        </Alert>

        {/* Campo de teléfono */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Número de celular Yape</Label>
          <Input
            id="phoneNumber"
            type="text"
            placeholder="987654321"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
            maxLength={9}
            className="text-center text-lg"
          />
          <p className="text-xs text-gray-500">Ingresa tu número de 9 dígitos (empezando con 9)</p>
        </div>

        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleProcessPayment} 
            className="flex-1 bg-purple-600 hover:bg-purple-700" 
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : 'Pagar con Yape'}
          </Button>
        </div>

        {/* Información de seguridad */}
        <div className="text-center pt-4 border-t">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Pago seguro protegido por Culqi</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderStepProcessing = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <CardTitle className="text-2xl">Procesando pago</CardTitle>
        <CardDescription>
          Enviando solicitud de pago a tu app Yape...
        </CardDescription>
      </CardHeader>
    </Card>
  )

  const renderStepSuccess = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 text-green-600 font-bold text-2xl">✓</div>
        </div>
        <CardTitle className="text-2xl text-green-600">¡Pago exitoso!</CardTitle>
        <CardDescription>
          Tu donación ha sido procesada correctamente con Yape
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-lg">Gracias por tu donación de</p>
          <p className="text-3xl font-bold text-purple-600">S/ {amount.toFixed(2)}</p>
        </div>

        <Button onClick={onCancel} className="w-full">
          Continuar
        </Button>
      </CardContent>
    </Card>
  )

  const renderStepError = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 text-red-600 font-bold text-2xl">✗</div>
        </div>
        <CardTitle className="text-2xl text-red-600">Error en el pago</CardTitle>
        <CardDescription>
          No se pudo procesar tu pago con Yape
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={() => { setStep('form'); setError('') }} className="flex-1">
            Reintentar
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  switch (step) {
    case 'form':
      return renderStepForm()
    case 'processing':
      return renderStepProcessing()
    case 'success':
      return renderStepSuccess()
    case 'error':
      return renderStepError()
    default:
      return renderStepForm()
  }
}