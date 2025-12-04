'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Smartphone, Shield, CreditCard } from 'lucide-react'

interface YapePaymentProps {
  amount: number
  donorName: string
  donorEmail: string
  frequency: 'one-time' | 'monthly'
  message?: string
  onSuccess: (data: any) => void
  onError: (error: string) => void
  onCancel: () => void
}

export function YapePayment({
  amount,
  donorName,
  donorEmail,
  frequency,
  message,
  onSuccess,
  onError,
  onCancel
}: YapePaymentProps) {
  const [step, setStep] = useState<'info' | 'processing' | 'success' | 'error'>('info')
  const [phoneNumber, setPhoneNumber] = useState('') // Número de teléfono del usuario
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleProcessPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Por favor ingresa un número de celular válido (9 dígitos)')
      return
    }
    setError('')

    setIsLoading(true)
    setError('')

    try {
      console.log('[YAPE] Creando preferencia de pago...')
      const response = await fetch('/api/payments/yape/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          amount,
          donorName,
          donorEmail,
          frequency,
          message
        })
      })

      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error creando preferencia de pago')
      }

      console.log('[YAPE] ✅ Preferencia creada:', result)

      // Redirigir al usuario a MercadoPago para completar el pago con Yape
      if (result.init_point) {
        window.location.href = result.init_point
      } else {
        throw new Error('No se recibió URL de pago')
      }

    } catch (error: any) {
      console.error('[YAPE] ❌ Error:', error)
      setError(error.message)
      setStep('error')
      onError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepInfo = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-purple-600" />
        </div>
        <CardTitle className="text-2xl">Pagar con Yape</CardTitle>
        <CardDescription>
          Ingresa tu número de celular para continuar con el pago
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

        {/* Alerta del nuevo flujo */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-sm">
            <strong>📱 PAGO CON YAPE</strong><br/>
            Al hacer clic en "Pagar", serás redirigido a MercadoPago donde podrás completar tu pago usando Yape.<br/>
            <strong>No necesitas el OTP aquí</strong> - lo ingresarás en la página de MercadoPago.
          </AlertDescription>
        </Alert>

        {/* Campo de teléfono */}
        <div className="space-y-2">
          <Label htmlFor="phone">Número de celular</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="987654321"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 9))}
            maxLength={9}
          />
          <p className="text-sm text-gray-500">
            Ingresa el número asociado a tu cuenta Yape
          </p>
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
          <Button onClick={handleProcessPayment} className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
            {isLoading ? 'Procesando...' : 'Pagar con Yape'}
          </Button>
        </div>

        {/* Información de seguridad */}
        <div className="text-center pt-4 border-t">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Pago seguro protegido por MercadoPago</span>
          </div>
        </div>
      </CardContent>
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
          Tu donación ha sido procesada correctamente
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
          <Button onClick={() => setStep('info')} className="flex-1">
            Reintentar
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  switch (step) {
    case 'info':
      return renderStepInfo()
    case 'processing':
      return renderStepInfo() // Mantenemos el mismo formulario mientras procesa
    case 'success':
      return renderStepSuccess()
    case 'error':
      return renderStepError()
    default:
      return renderStepInfo()
  }
}