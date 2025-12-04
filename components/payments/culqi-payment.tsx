'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreditCard, Shield, Lock } from 'lucide-react'

interface CulqiPaymentProps {
  amount: number
  donorName: string
  donorEmail: string
  frequency: 'one-time' | 'monthly'
  message?: string
  onSuccess: (data: any) => void
  onError: (error: string) => void
  onCancel: () => void
}

export function CulqiPayment({
  amount,
  donorName,
  donorEmail,
  frequency,
  message,
  onSuccess,
  onError,
  onCancel
}: CulqiPaymentProps) {
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const validateCard = () => {
    const cleanCardNumber = cardNumber.replace(/\s/g, '')
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      return 'Número de tarjeta inválido'
    }
    
    if (expiryDate.length !== 5) {
      return 'Fecha de vencimiento inválida (MM/YY)'
    }
    
    if (cvv.length < 3 || cvv.length > 4) {
      return 'CVV inválido'
    }
    
    const [month, year] = expiryDate.split('/')
    const currentDate = new Date()
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1)
    
    if (expiry < currentDate) {
      return 'Tarjeta vencida'
    }
    
    return null
  }

  const handleProcessPayment = async () => {
    const validationError = validateCard()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')
    setStep('processing')

    try {
      const [month, year] = expiryDate.split('/')
      
      // Paso 1: Generar token
      console.log('[CULQI] Generando token...')
      const tokenResponse = await fetch('/api/payments/culqi/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: cardNumber,
          cvv: cvv,
          expirationMonth: month,
          expirationYear: `20${year}`,
          email: donorEmail
        })
      })

      const tokenResult = await tokenResponse.json()
      
      if (!tokenResponse.ok || !tokenResult.success) {
        throw new Error(tokenResult.error || 'Error generando token de pago')
      }

      console.log('[CULQI] ✅ Token generado')

      // Paso 2: Crear cargo
      console.log('[CULQI] Creando cargo...')
      const chargeResponse = await fetch('/api/payments/culqi/create-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenResult.token,
          amount,
          donor_name: donorName,
          donor_email: donorEmail,
          frequency,
          message
        })
      })

      const chargeResult = await chargeResponse.json()
      
      if (!chargeResponse.ok || !chargeResult.success) {
        throw new Error(chargeResult.error || 'Error procesando pago')
      }

      console.log('[CULQI] ✅ Pago procesado')

      if (chargeResult.approved) {
        setStep('success')
        onSuccess(chargeResult)
      } else {
        throw new Error(chargeResult.message || 'Pago rechazado')
      }

    } catch (error: any) {
      console.error('[CULQI] ❌ Error:', error)
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
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Pagar con Tarjeta</CardTitle>
        <CardDescription>
          Ingresa los datos de tu tarjeta para continuar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Información del pago */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Monto a pagar:</span>
            <span className="text-xl font-bold text-blue-600">S/ {amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Alerta de seguridad */}
        <Alert className="bg-green-50 border-green-200">
          <Lock className="w-4 h-4" />
          <AlertDescription className="text-sm">
            <strong>🔒 PAGO SEGURO CON CULQI</strong><br/>
            Tus datos están protegidos con encriptación de nivel bancario.
          </AlertDescription>
        </Alert>

        {/* Campos de tarjeta */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Número de Tarjeta</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Vencimiento</Label>
              <Input
                id="expiryDate"
                type="text"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                maxLength={4}
              />
            </div>
          </div>
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
            className="flex-1 bg-blue-600 hover:bg-blue-700" 
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : 'Pagar'}
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
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <CardTitle className="text-2xl">Procesando pago</CardTitle>
        <CardDescription>
          Por favor espera mientras procesamos tu pago...
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
          Tu donación ha sido procesada correctamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-lg">Gracias por tu donación de</p>
          <p className="text-3xl font-bold text-blue-600">S/ {amount.toFixed(2)}</p>
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
          No se pudo procesar tu pago
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