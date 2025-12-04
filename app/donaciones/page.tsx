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
import { DONATION_PLANS, MERCADOPAGO_CONFIG } from '@/lib/donation-config'
import { DonationPlan } from '@/lib/db'
import { useAuth } from '@/contexts/auth-context'
import { ProtectedRoute } from '@/components/auth/protected-route'

// Declarar MercadoPago global para TypeScript
declare global {
  interface Window {
    MercadoPago: any
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
  const [mercadopagoPublicKey, setMercadopagoPublicKey] = useState<string>('')
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

  // Cargar script de MercadoPago
  useEffect(() => {
    const loadMercadoPagoScript = () => {
      if (typeof window !== 'undefined') {
        // Verificar si ya existe
        if (window.MercadoPago) {
          console.log('[MERCADOPAGO] Script ya cargado')
          return Promise.resolve()
        }
        
        // Verificar si ya hay un script cargándose
        const existingScript = document.querySelector('script[src*="mercadopago.com"]')
        if (existingScript) {
          console.log('[MERCADOPAGO] Script ya está siendo cargado')
          return new Promise((resolve) => {
            existingScript.addEventListener('load', () => resolve(true))
          })
        }
        
        console.log('[MERCADOPAGO] Cargando script...')
        
        return new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://sdk.mercadopago.com/js/v2'
          script.async = true
          
          script.onload = () => {
            console.log('[MERCADOPAGO] Script cargado exitosamente')
            // Verificar que MercadoPago esté disponible
            if (window.MercadoPago) {
              console.log('[MERCADOPAGO] MercadoPago disponible globalmente')
              resolve(true)
            } else {
              console.error('[MERCADOPAGO] MercadoPago no disponible después de cargar script')
              reject(new Error('MercadoPago no disponible después de cargar script'))
            }
          }
          
          script.onerror = (error) => {
            console.error('[MERCADOPAGO] Error cargando script:', error)
            reject(error)
          }
          
          document.head.appendChild(script)
        })
      }
    }
    
    loadMercadoPagoScript().catch((error) => {
      console.error('[MERCADOPAGO] Error al cargar script:', error)
    })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const amount = getFinalAmount()
      
      if (amount < MERCADOPAGO_CONFIG.MIN_AMOUNT) {
        alert(`Por favor ingresa un monto válido (mínimo S/ ${MERCADOPAGO_CONFIG.MIN_AMOUNT})`)
        return
      }
      
      if (amount > MERCADOPAGO_CONFIG.MAX_AMOUNT) {
        alert(`El monto máximo permitido es S/ ${MERCADOPAGO_CONFIG.MAX_AMOUNT}`)
        return
      }

      const donationData = {
        amount,
        frequency,
        donor_name: donor.name,
        donor_email: donor.email,
        message: donor.message
      }

      // Procesar con MercadoPago
      console.log('[FRONTEND] Enviando datos a MercadoPago API:', donationData)
        
      const response = await fetch('/api/payments/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData)
      })

      const result = await response.json()
      
      console.log('[FRONTEND] Respuesta de MercadoPago API:', result)
      
      if (result.error) {
        console.error('[FRONTEND] Error de MercadoPago API:', result.error)
        alert(`Error: ${result.error}${result.details ? ` (${result.details})` : ''}`)
        return
      }

      console.log('[MERCADOPAGO] Datos recibidos:', result)
      
      // Validar datos recibidos
      if (!result.publicKey) {
        console.error('[FRONTEND] No se recibió la clave pública. Respuesta completa:', result)
        alert('Error: No se recibió la clave pública de MercadoPago. Revisa la configuración.')
        return
      }
      
      if (!result.initPoint) {
        alert('Error: Datos de pago inválidos')
        return
      }
      
      // Guardar datos de la sesión
      setMercadopagoPublicKey(result.publicKey)
      setCurrentDonationId(result.donationId)
      
      console.log('[MERCADOPAGO] Redirigiendo a checkout:', result.initPoint)
      
      // Redireccionar a MercadoPago Checkout Pro
      window.location.href = result.initPoint
        
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
                  disabled={isLoading || getFinalAmount() < MERCADOPAGO_CONFIG.MIN_AMOUNT || getFinalAmount() > MERCADOPAGO_CONFIG.MAX_AMOUNT}
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

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>💳 Pagos Seguros:</strong> Todas las transacciones están protegidas por MercadoPago, la plataforma de pagos líder en Latinoamérica.</p>
                <p><strong>📱 Múltiples Métodos:</strong> Acepta tarjetas de crédito/débito, Yape, billeteras digitales y cuotas sin interés.</p>
                <p><strong>📧 Comprobante:</strong> Recibirás un email con los detalles de tu donación.</p>
                <p><strong>❤️ Transparencia:</strong> Te mantendremos informado del impacto de tu donación.</p>
              </div>
            </CardContent>
          </Card>

          {/* Información de modo de prueba si aplica */}
          {mercadopagoPublicKey && mercadopagoPublicKey.includes('TEST') && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800 mb-2">🧪 Modo de Prueba Activo</p>
                  <p className="text-yellow-700 mb-2">
                    Esta es una demostración. Usa estos datos de prueba:
                  </p>
                  <div className="bg-white p-3 rounded border text-xs space-y-1">
                    {MERCADOPAGO_CONFIG.TEST_CARDS.map((card, index) => (
                      <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
                        <p><strong>Tarjeta:</strong> {card.number}</p>
                        <p><strong>CVV:</strong> {card.cvv} | <strong>Fecha:</strong> {card.month}/{card.year}</p>
                        <p><strong>Email:</strong> {card.email}</p>
                        <p className="text-gray-600 italic">{card.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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