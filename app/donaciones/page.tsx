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
  const [culqiPublicKey, setCulqiPublicKey] = useState<string>('')
  const [currentDonationId, setCurrentDonationId] = useState<string>('')

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

  // Cargar script de Culqi
  useEffect(() => {
    const loadCulqiScript = () => {
      if (typeof window !== 'undefined') {
        // Verificar si ya existe
        if (window.Culqi) {
          console.log('[CULQI] Script ya cargado')
          return
        }
        
        // Verificar si ya hay un script cargándose
        const existingScript = document.querySelector('script[src*="culqi.com"]')
        if (existingScript) {
          console.log('[CULQI] Script ya está siendo cargado')
          return
        }
        
        console.log('[CULQI] Cargando script...')
        const script = document.createElement('script')
        script.src = 'https://checkout.culqi.com/js/v4'
        script.async = true
        
        script.onload = () => {
          console.log('[CULQI] Script cargado exitosamente')
          // Verificar que Culqi esté disponible
          if (window.Culqi) {
            console.log('[CULQI] Culqi disponible globalmente')
          } else {
            console.error('[CULQI] Culqi no disponible después de cargar script')
          }
        }
        
        script.onerror = (error) => {
          console.error('[CULQI] Error cargando script:', error)
        }
        
        document.head.appendChild(script)
      }
    }
    
    loadCulqiScript()
  }, [])

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
        console.log('[CULQI] Estado actual:', { 
          currentDonationId, 
          selectedPlan, 
          customAmount,
          donor 
        })
        
        if (window.Culqi.token && window.Culqi.token.id) {
          const token = window.Culqi.token.id
          console.log('[CULQI] Token generado:', token)
          
          // Validar que tenemos todos los datos necesarios
          if (!currentDonationId) {
            console.error('[CULQI] ❌ donation_id faltante')
            alert('Error: ID de donación no encontrado. Por favor, intenta de nuevo.')
            setIsLoading(false)
            return
          }
          
          try {
            setIsLoading(true)
            
            const amount = selectedPlan ? selectedPlan.amount : (parseFloat(customAmount) || 0)
            
            if (!amount || amount <= 0) {
              console.error('[CULQI] ❌ Monto inválido:', amount)
              alert('Error: Monto de donación inválido')
              setIsLoading(false)
              return
            }
            
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
  }, [currentDonationId, selectedPlan, customAmount, donor]) // Dependencias importantes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const amount = getFinalAmount()
      
      if (amount < 1) {
        alert('Por favor ingresa un monto válido')
        return
      }

      const donationData = {
        amount,
        frequency,
        donor_name: donor.name,
        donor_email: donor.email,
        message: donor.message
      }

      // Procesar con Culqi (que ahora incluye Yape)
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
          alert(`Error: ${result.error}${result.details ? ` (${result.details})` : ''}`)
          return
        }

        console.log('[CULQI] Datos recibidos:', result)
        
        // Validar datos recibidos
        if (!result.publicKey) {
          console.error('[FRONTEND] No se recibió la clave pública. Respuesta completa:', result)
          alert('Error: No se recibió la clave pública de Culqi. Revisa la configuración.')
          return
        }
        
        if (!result.culqiData || !result.culqiData.amount) {
          alert('Error: Datos de pago inválidos')
          return
        }
        
        // Guardar datos de la sesión
        setCulqiPublicKey(result.publicKey)
        setCurrentDonationId(result.donationId)
        
        // Verificar que Culqi esté cargado
        if (!window.Culqi) {
          alert('El sistema de pagos aún no está listo. Recarga la página e intenta de nuevo.')
          return
        }
        
        // Configurar Culqi con validaciones
        try {
          console.log('[CULQI] Configurando con publicKey:', result.publicKey)
          
          // Establecer clave pública
          window.Culqi.publicKey = result.publicKey
          
          console.log('[CULQI] Configurando settings con amount:', result.culqiData.amount)
          
          // Configurar datos básicos (sin opciones avanzadas primero)
          window.Culqi.settings({
            title: 'Donación - Adopción Mascotas',
            currency: 'PEN',
            description: result.culqiData.description || 'Donación para mascotas',
            amount: result.culqiData.amount
          })
          
          console.log('[CULQI] Configurando options')
          
          // Configurar opciones básicas
          window.Culqi.options({
            paymentMethods: {
              tarjeta: true,
              yape: true, // Habilitar Yape a través de Culqi
              billetera: false,
              bancaMovil: false,
              agente: false,
              cuotealo: false
            }
          })
          
          console.log('[CULQI] Abriendo modal...')
          
          // Pequeña pausa antes de abrir
          setTimeout(() => {
            window.Culqi.open()
          }, 100)
          
        } catch (culqiError) {
          console.error('[CULQI] Error detallado:', culqiError)
          console.error('[CULQI] Stack:', culqiError.stack)
          alert(`Error configurando Culqi: ${culqiError.message}`)
        }
        
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Error al procesar el pago. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
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

          {/* Cantidad Personalizada */}
          <Card className={customAmount ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <CardTitle>Cantidad Personalizada</CardTitle>
              <CardDescription>Elige el monto que desees donar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="custom-amount">Monto en Soles (S/)</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Ej: 25.00"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Frecuencia</Label>
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
              </div>
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
                  disabled={isLoading || getFinalAmount() < 1}
                >
                  {isLoading ? 'Procesando...' : (
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
                <p><strong>💳 Pagos Seguros:</strong> Todas las transacciones están protegidas por Culqi, el procesador de pagos líder en Perú.</p>
                <p><strong>📱 Yape y Tarjetas:</strong> Acepta tarjetas de crédito/débito y Yape a través de Culqi.</p>
                <p><strong>📧 Comprobante:</strong> Recibirás un email con los detalles de tu donación.</p>
                <p><strong>❤️ Transparencia:</strong> Te mantendremos informado del impacto de tu donación.</p>
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