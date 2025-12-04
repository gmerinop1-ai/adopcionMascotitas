'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreditCard, Shield, CheckCircle, XCircle } from 'lucide-react'
import { getCulqiPublicKey } from '@/lib/config'

// Declarar Culqi global para TypeScript
declare global {
  interface Window {
    Culqi: any
  }
}

interface CulqiStandardPaymentProps {
  amount: number
  donorName: string
  donorEmail: string
  frequency: 'one-time' | 'monthly'
  message?: string
  onSuccess: (data: any) => void
  onError: (error: string) => void
  onCancel: () => void
}

export function CulqiStandardPayment({
  amount,
  donorName,
  donorEmail,
  frequency,
  message,
  onSuccess,
  onError,
  onCancel
}: CulqiStandardPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [culqiLoaded, setCulqiLoaded] = useState(false)
  const [step, setStep] = useState<'loading' | 'ready' | 'processing' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    // Limpiar cualquier script previo
    const existingScript = document.querySelector('script[src*="checkout.culqi.com"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Cargar script de Culqi
    const script = document.createElement('script')
    script.src = 'https://checkout.culqi.com/js/v4'
    script.async = true
    script.onload = () => {
      console.log('[CULQI] Script cargado exitosamente')
      // Pequeña demora para asegurar que Culqi esté completamente disponible
      setTimeout(() => {
        if (window.Culqi) {
          initializeCulqi()
        } else {
          console.error('[CULQI] Culqi no disponible después de cargar script')
          setError('Error cargando sistema de pagos. Intenta recargar la página.')
          setStep('error')
        }
      }, 100)
    }
    script.onerror = (error) => {
      console.error('[CULQI] Error cargando script:', error)
      setError('Error cargando Culqi. Verifica tu conexión a internet.')
      setStep('error')
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup en desmontaje
      const scriptToRemove = document.querySelector('script[src*="checkout.culqi.com"]')
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [])

  const initializeCulqi = () => {
    try {
      // Usar la nueva función de configuración
      const publicKey = getCulqiPublicKey()
      
      console.log('[CULQI] Obteniendo clave pública...')
      console.log('[CULQI] Clave pública obtenida:', publicKey?.substring(0, 15) + '...')
      
      if (!publicKey || !window.Culqi) {
        console.error('[CULQI] Error: clave pública no disponible o Culqi no cargado')
        console.error('[CULQI] publicKey:', publicKey)
        console.error('[CULQI] window.Culqi:', window.Culqi)
        setError('Sistema de pagos no disponible. Intenta recargar la página.')
        setStep('error')
        return
      }

      console.log('[CULQI] Configurando Culqi con clave:', publicKey.substring(0, 15) + '...')
      
      // Configurar Culqi
      window.Culqi.publicKey = publicKey
      
      // Configurar callback de éxito
      window.Culqi.options({
        lang: 'es',
        modal: true,
        installments: false,
        style: {
          logo: '', // Sin logo para evitar errores
          maincolor: '#0f172a',
          buttontext: '#ffffff',
          maintext: '#0f172a',
          desctext: '#64748b'
        }
      })

      // Callback cuando el token es creado exitosamente
      window.Culqi.culqi = async function() {
        if (window.Culqi.token) {
          const token = window.Culqi.token
          console.log('[CULQI] Token recibido:', token.id)
          console.log('[CULQI] Token completo:', token)
          
          setStep('processing')
          setIsLoading(false) // Reset loading state
          
          try {
            console.log('[CULQI] Enviando solicitud al servidor...')
            // Procesar el pago con el token
            const response = await fetch('/api/payments/culqi/create-charge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token: token.id,
                amount,
                donor_name: donorName,
                donor_email: donorEmail,
                frequency,
                message
              })
            })

            const result = await response.json()
            console.log('[CULQI] Respuesta del servidor:', result)
            console.log('[CULQI] Status de respuesta:', response.status)
            console.log('[CULQI] Headers de respuesta:', Object.fromEntries(response.headers.entries()))
            
            if (!response.ok) {
              console.error('[CULQI] Error HTTP:', response.status, result)
              throw new Error(result.error || `Error del servidor (${response.status})`)
            }
            
            // Verificar múltiples condiciones de éxito
            const isSuccess = result.success === true || result.approved === true
            console.log('[CULQI] Verificación de éxito:', {
              success: result.success,
              approved: result.approved,
              isSuccess,
              status: result.status
            })
            
            if (isSuccess) {
              console.log('[CULQI] ✅ Pago exitoso!')
              
              // Cerrar modal de Culqi si está abierto
              if (window.Culqi && typeof window.Culqi.close === 'function') {
                try {
                  window.Culqi.close()
                  console.log('[CULQI] Modal cerrado exitosamente')
                } catch (closeError) {
                  console.warn('[CULQI] Error cerrando modal:', closeError)
                }
              }
              
              setStep('success')
              onSuccess(result)
            } else {
              console.log('[CULQI] ⚠️ Pago no exitoso:', result)
              const errorMsg = result.message || result.error || `Estado: ${result.status || 'desconocido'}`
              throw new Error(errorMsg)
            }
          } catch (error: any) {
            console.error('[CULQI] ❌ Error procesando pago:', error)
            setError(`Error: ${error.message}`)
            setStep('error')
            onError(error.message)
          }
        } else if (window.Culqi.error) {
          const culqiError = window.Culqi.error
          console.error('[CULQI] Error en token:', culqiError)
          setError(culqiError.user_message || culqiError.merchant_message || 'Error creando token de pago')
          setStep('error')
          setIsLoading(false)
        } else {
          console.error('[CULQI] Ni token ni error disponibles')
          setError('Error inesperado en el procesamiento')
          setStep('error')
          setIsLoading(false)
        }
      }
      
      // Callback para errores en la creación de token
      window.Culqi.close = function() {
        console.log('[CULQI] Modal cerrado por usuario')
        setIsLoading(false)
      }

      setCulqiLoaded(true)
      setStep('ready')
      console.log('[CULQI] Inicializado correctamente')
      
    } catch (error: any) {
      console.error('[CULQI] Error inicializando:', error)
      setError('Error inicializando sistema de pagos')
      setStep('error')
    }
  }

  const handlePay = () => {
    if (!culqiLoaded) {
      console.error('[CULQI] Sistema no cargado')
      setError('Sistema de pagos no disponible')
      return
    }

    if (!window.Culqi) {
      console.error('[CULQI] Objeto Culqi no disponible')
      setError('Error: sistema de pagos no inicializado')
      return
    }

    console.log('[CULQI] Iniciando proceso de pago...')
    setIsLoading(true)
    
    try {
      // Configurar datos del pago
      const paymentData = {
        title: 'Adopción Mascotitas',
        currency: 'PEN',
        description: `Donación - ${donorName}`,
        amount: Math.round(amount * 100), // Culqi requiere centavos
        email: donorEmail
      }
      
      console.log('[CULQI] Configurando pago:', paymentData)
      window.Culqi.settings(paymentData)

      // Abrir modal de Culqi
      console.log('[CULQI] Abriendo modal de pago...')
      window.Culqi.open()
      
    } catch (error: any) {
      console.error('[CULQI] Error abriendo modal:', error)
      setError('Error abriendo formulario de pago: ' + error.message)
      setIsLoading(false)
    }
  }

  if (step === 'loading') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando sistema de pagos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={onCancel} variant="outline" className="w-full">
              Cerrar
            </Button>
            <Button onClick={() => window.location.reload()} className="w-full">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Procesando pago...</h3>
            <p className="text-gray-600">Por favor espera mientras procesamos tu donación</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">¡Pago Exitoso!</CardTitle>
          <CardDescription>Tu donación ha sido procesada correctamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="mb-4">Gracias por tu generosa donación de <strong>S/ {amount.toFixed(2)}</strong></p>
            <Button onClick={onCancel} className="w-full">
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Pago Seguro con Culqi</CardTitle>
        <CardDescription>
          Procesamiento seguro y confiable
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Información del pago */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Monto a pagar:</div>
            <div className="text-2xl font-bold text-blue-600">S/ {amount.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">
              {frequency === 'monthly' ? 'Donación mensual' : 'Donación única'}
            </div>
          </div>
        </div>

        {/* Información de donante */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm">
            <p><strong>Donante:</strong> {donorName}</p>
            <p><strong>Email:</strong> {donorEmail}</p>
            {message && <p><strong>Mensaje:</strong> {message}</p>}
          </div>
        </div>

        {/* Alerta de seguridad */}
        <Alert className="bg-green-50 border-green-200">
          <Shield className="w-4 h-4" />
          <AlertDescription className="text-sm">
            <strong>🔒 PAGO 100% SEGURO</strong><br/>
            Procesado por Culqi con encriptación bancaria y cumplimiento PCI DSS.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={handlePay}
          disabled={isLoading || !culqiLoaded}
          className="w-full" 
          size="lg"
        >
          {isLoading ? 'Procesando...' : 'Pagar con Tarjeta'}
        </Button>

        <Button 
          onClick={onCancel}
          variant="outline"
          className="w-full"
        >
          Cancelar
        </Button>

        {/* Tarjetas de prueba */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p className="font-semibold mb-1">Tarjetas de prueba oficiales (Culqi):</p>
          <p>• Visa: 4111 1111 1111 1111 | CVV: 123 | Fecha: 12/30</p>
          <p>• Mastercard: 5111 1111 1111 1118 | CVV: 039 | Fecha: 12/30</p>
          <p>• Email: review@culqi.com (requerido)</p>
        </div>
      </CardContent>
    </Card>
  )
}