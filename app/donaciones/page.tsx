'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Heart, CreditCard } from 'lucide-react'
import { DONATION_PLANS } from '@/lib/donation-config'
import { DonationPlan } from '@/lib/db'
import { useAuth } from '@/contexts/auth-context'
import { ProtectedRoute } from '@/components/auth/protected-route'

// Declarar Culqi global para TypeScript
declare global {
  interface Window {
    Culqi: any
    culqi: () => void
  }
}

function DonationsPageContent() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<DonationPlan | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('monthly')
  const [donor, setDonor] = useState({
    name: user?.nombres || '',
    email: user?.correo || '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentDonationId, setCurrentDonationId] = useState<string>('')
  const [culqiLoaded, setCulqiLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Evitar errores de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  // Actualizar datos del donante cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      setDonor(prev => ({
        ...prev,
        name: prev.name || user.nombres || '',
        email: prev.email || user.correo || ''
      }))
    }
  }, [user])

  // Cargar script de Culqi solo en el cliente
  useEffect(() => {
    if (!mounted) return
    
    const loadCulqiScript = () => {
      console.log('[CULQI] Iniciando carga de script...')
      
      // Verificar si ya existe
      if (window.Culqi && typeof window.Culqi.open === 'function') {
        console.log('[CULQI] Culqi ya cargado y funcional')
        setCulqiLoaded(true)
        return
      }
      
      // Verificar si ya hay un script cargándose
      const existingScript = document.querySelector('script[src*="js.culqi.com"]')
      if (existingScript) {
        console.log('[CULQI] Script ya está siendo cargado')
        return
      }
      
      console.log('[CULQI] Cargando script...')
      const script = document.createElement('script')
      
      // Usar la URL estándar de Culqi
      script.src = 'https://js.culqi.com/v2'
      script.async = true
      script.type = 'text/javascript'
      
      script.onload = () => {
        console.log('[CULQI] ✅ Script cargado exitosamente')
        console.log('[CULQI] window.Culqi después de carga:', typeof window.Culqi)
        
        // Dar tiempo para que Culqi se inicialice completamente
        setTimeout(() => {
          if (window.Culqi && typeof window.Culqi.open === 'function') {
            setCulqiLoaded(true)
            console.log('[CULQI] ✅ Culqi completamente inicializado')
          } else {
            console.error('[CULQI] ❌ Culqi no se inicializó correctamente')
            console.error('[CULQI] Estado actual:', {
              windowCulqi: typeof window.Culqi,
              culqiProps: window.Culqi ? Object.keys(window.Culqi) : 'N/A'
            })
          }
        }, 2000)
      }
      
      script.onerror = (error) => {
        console.error('[CULQI] ❌ Error cargando script:', error)
        console.error('[CULQI] Reintentando con script alternativo...')
        
        // Script alternativo
        const fallbackScript = document.createElement('script')
        fallbackScript.src = 'https://checkout.culqi.com/js/v3'
        fallbackScript.async = true
        fallbackScript.onload = () => {
          console.log('[CULQI] ✅ Script alternativo cargado')
          if (window.Culqi) {
            setCulqiLoaded(true)
          }
        }
        document.head.appendChild(fallbackScript)
      }
      
      document.head.appendChild(script)
    }
    
    loadCulqiScript()
  }, [mounted])

  const handlePlanSelect = (plan: DonationPlan) => {
    setSelectedPlan(plan)
    setCustomAmount('')
    setFrequency(plan.frequency)
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedPlan(null)
  }

  const getFinalAmount = () => {
    if (selectedPlan) return selectedPlan.amount
    return parseFloat(customAmount) || 0
  }

  // Configurar callback de Culqi
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.culqi = async () => {
        console.log('[CULQI] Callback ejecutado')
        
        // Verificar que Culqi esté disponible
        if (!window.Culqi) {
          console.error('[CULQI] ❌ Culqi no disponible en callback')
          alert('Error en el sistema de pagos. Recarga la página.')
          setIsLoading(false)
          return
        }
        
        if (window.Culqi.token && window.Culqi.token.id) {
          const token = window.Culqi.token.id
          console.log('[CULQI] Token generado:', token)
          
          if (!currentDonationId) {
            console.error('[CULQI] ❌ donation_id faltante')
            alert('Error: ID de donación no encontrado. Por favor, intenta de nuevo.')
            setIsLoading(false)
            return
          }
          
          try {
            setIsLoading(true)
            
            const amount = getFinalAmount()
            
            const paymentData = {
              token,
              donation_id: currentDonationId,
              amount,
              description: `Donación para mascotas - ${donor.name || 'Anónimo'}`,
              customer_email: donor.email || ''
            }
            
            console.log('[CULQI] Enviando datos para verificación:', paymentData)
            
            const response = await fetch('/api/payments/culqi/verify-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(paymentData)
            })
            
            const result = await response.json()
            console.log('[CULQI] Respuesta del servidor:', result)
            
            if (result.success) {
              console.log('[CULQI] ✅ Pago exitoso!')
              window.location.href = `/donaciones/exito?donation_id=${currentDonationId}`
            } else {
              console.error('[CULQI] ❌ Error en verificación:', result.error)
              alert(result.error || 'Error al procesar el pago')
            }
          } catch (error) {
            console.error('[CULQI] ❌ Error en callback:', error)
            alert('Error procesando el pago. Inténtalo de nuevo.')
          } finally {
            setIsLoading(false)
          }
        } else if (window.Culqi.error) {
          console.error('[CULQI] Error de Culqi:', window.Culqi.error)
          alert(window.Culqi.error.user_message || 'Error en el pago')
          setIsLoading(false)
        } else {
          console.error('[CULQI] Sin token ni error')
          alert('Error desconocido en el pago')
          setIsLoading(false)
        }
      }
    }
  }, [currentDonationId, donor, getFinalAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const amount = getFinalAmount()
      
      if (amount < 1) {
        alert('Por favor ingresa un monto válido (mínimo S/ 1.00)')
        return
      }

      console.log('[FRONTEND] Iniciando proceso de donación...')

      const donationData = {
        amount,
        frequency,
        donor_name: donor.name,
        donor_email: donor.email,
        message: donor.message
      }

      console.log('[FRONTEND] Enviando datos a Culqi API:', donationData)
        
      const response = await fetch('/api/payments/culqi/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData)
      })

      const result = await response.json()
      console.log('[FRONTEND] Respuesta de Culqi API:', result)
      
      if (result.error) {
        console.error('[FRONTEND] Error de Culqi API:', result.error)
        alert(`Error: ${result.error}`)
        return
      }

      console.log('[CULQI] Datos recibidos:', result)
      
      if (!result.publicKey) {
        console.error('[FRONTEND] No se recibió la clave pública')
        alert('Error de configuración. Contacta al soporte.')
        return
      }
      
      if (!result.culqiData || !result.culqiData.amount) {
        alert('Error: Datos de pago inválidos')
        return
      }
      
      // Guardar datos de la sesión
      setCurrentDonationId(result.donationId)
      
      // Verificar que Culqi esté cargado
      if (!culqiLoaded || !window.Culqi) {
        console.error('[CULQI] ❌ Culqi no está disponible. Estado:', {
          culqiLoaded,
          windowCulqi: typeof window.Culqi,
          hasOpenMethod: window.Culqi && typeof window.Culqi.open === 'function'
        })
        alert('El sistema de pagos aún no está listo. Por favor, recarga la página y espera unos segundos antes de intentar de nuevo.')
        return
      }

      console.log('[CULQI] ✅ Culqi verificado - procediendo con el pago')

      // Configuración SIMPLE para tarjetas
      try {
        console.log('[CULQI] Configurando Culqi...')
        
        window.Culqi.publicKey = result.publicKey
        window.Culqi.settings({
          title: 'Donación - Adopción Mascotas',
          currency: 'PEN',
          amount: result.culqiData.amount,
          order: result.donationId,
          description: result.culqiData.description || 'Donación para mascotas'
        })
        
        console.log('[CULQI] ✅ Configuración aplicada')
        console.log('[CULQI] Abriendo modal...')
        
        window.Culqi.open()
        console.log('[CULQI] ✅ Modal abierto exitosamente')
        
      } catch (culqiError) {
        console.error('[CULQI] ❌ Error configurando Culqi:', culqiError)
        alert('Error al abrir el sistema de pagos. Intenta nuevamente.')
        return
      }

    } catch (error) {
      console.error('[FRONTEND] Error en handleSubmit:', error)
      alert('Error al procesar la donación. Por favor, inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  // Evitar errores de hidratación - no renderizar hasta que esté montado
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Cargando página de donaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          <Heart className="inline-block w-8 h-8 text-red-500 mr-2" />
          Dona por las Mascotas
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Tu donación ayuda a cubrir gastos de alimentación, atención veterinaria y cuidados especiales 
          para las mascotas que esperan encontrar un hogar.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Selección de Plan */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Elige tu forma de ayudar</h2>
          
          {/* Planes Predefinidos */}
          <div className="space-y-4">
            {DONATION_PLANS.map((plan) => (
              <Card 
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan?.id === plan.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`}
                onClick={() => handlePlanSelect(plan)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">S/ {plan.amount}</div>
                      <div className="text-sm text-muted-foreground">
                        {plan.frequency === 'monthly' ? '/mes' : 'una vez'}
                      </div>
                      {plan.popular && <Badge variant="default" className="mt-1">Popular</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1 text-sm">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <Heart className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Monto Personalizado */}
          <Card className={`${!selectedPlan && customAmount ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader>
              <CardTitle className="text-lg">Monto Personalizado</CardTitle>
              <CardDescription>Elige la cantidad que desees donar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-medium">S/</span>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="text-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Frecuencia */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Frecuencia de Donación</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={frequency} onValueChange={setFrequency as any}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one-time" id="one-time" />
                  <Label htmlFor="one-time">Una vez</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Mensual</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Formulario de Pago */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Donante</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="donor-name">Nombre (Opcional)</Label>
                  <Input
                    id="donor-name"
                    value={donor.name}
                    onChange={(e) => setDonor({...donor, name: e.target.value})}
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <Label htmlFor="donor-email">Email</Label>
                  <Input
                    id="donor-email"
                    type="email"
                    required
                    value={donor.email}
                    onChange={(e) => setDonor({...donor, email: e.target.value})}
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mensaje (Opcional)</Label>
                  <Textarea
                    id="message"
                    value={donor.message}
                    onChange={(e) => setDonor({...donor, message: e.target.value})}
                    placeholder="Escribe un mensaje de apoyo para las mascotas..."
                    rows={3}
                  />
                </div>

                {/* Resumen */}
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span>Monto a donar:</span>
                      <span className="text-xl font-bold">S/ {getFinalAmount().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Frecuencia:</span>
                      <span>{frequency === 'monthly' ? 'Mensual' : 'Una vez'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading || getFinalAmount() < 1 || !culqiLoaded}
                >
                  {!culqiLoaded ? 'Cargando sistema de pagos...' : 
                   isLoading ? 'Procesando...' : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Donar S/ {getFinalAmount().toFixed(2)}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>💳 Pagos Seguros:</strong> Todas las transacciones están protegidas por Culqi.</p>
                <p><strong>📱 Métodos de pago:</strong> Tarjetas Visa/Mastercard disponibles.</p>
                <p><strong>📧 Comprobante:</strong> Recibirás un email con los detalles de tu donación.</p>
                <p><strong>❤️ Transparencia:</strong> Te mantendremos informado del impacto de tu donación.</p>
                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-sm"><strong>🎉 ¡Pagos con tarjeta disponibles!</strong></p>
                  <p className="text-xs mt-1">Puedes donar con tarjeta de crédito/débito de forma segura.</p>
                  {!culqiLoaded && (
                    <p className="text-xs mt-2 text-orange-600">⏳ Cargando sistema de pagos...</p>
                  )}
                  {culqiLoaded && (
                    <p className="text-xs mt-2 text-green-600">✅ Sistema de pagos listo</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DonationsPage() {
  return (
    <ProtectedRoute>
      <DonationsPageContent />
    </ProtectedRoute>
  )
}