'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Heart, Share2, ArrowLeft, Download, FileText } from 'lucide-react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/auth/protected-route'

function DonationSuccessContent() {
  const searchParams = useSearchParams()
  const [donationDetails, setDonationDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const sessionId = searchParams.get('session_id')
  const donationId = searchParams.get('donation_id')

  useEffect(() => {
    if (sessionId) {
      // Verificar el pago con Culqi (legacy para compatibilidad)
      fetch(`/api/payments/culqi/verify-session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setDonationDetails(data)
        })
        .catch(console.error)
        .finally(() => setIsLoading(false))
    } else if (donationId) {
      // Para pagos con Culqi, solo tenemos donation_id
      setDonationDetails({
        id: donationId,
        amount: 'Verificando...',
        status: 'completed'
      })
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [sessionId, donationId])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Doné para ayudar a las mascotas',
        text: '¡Acabo de hacer una donación para ayudar a las mascotas en adopción! 🐕🐱',
        url: window.location.origin + '/donaciones'
      })
    } else {
      // Fallback para navegadores que no soportan Web Share API
      const text = encodeURIComponent('¡Acabo de hacer una donación para ayudar a las mascotas en adopción! 🐕🐱')
      const url = encodeURIComponent(window.location.origin + '/donaciones')
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
    }
  }

  const handleDownloadReceipt = async () => {
    try {
      // Abrir en nueva pestaña para permitir al usuario guardar como PDF
      const url = `/api/donations/receipt-pdf?donation_id=${donationId}`
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error abriendo comprobante:', error)
      alert('Error al abrir el comprobante. Inténtalo de nuevo.')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando tu donación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="text-center">
        <CardHeader className="pb-6">
          <div className="mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl text-green-600">
            ¡Gracias por tu Donación! 
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-500 mr-2" />
              <p className="text-lg">
                Tu generosidad hace la diferencia en la vida de nuestras mascotas
              </p>
            </div>
            
            {donationDetails && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Monto donado:</span>
                  <span className="font-bold">S/ {donationDetails.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>ID de transacción:</span>
                  <span className="text-sm font-mono">{donationDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span>{new Date().toLocaleDateString('es-PE')}</span>
                </div>
                {donationDetails.customer_email && (
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-sm">{donationDetails.customer_email}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                📧 Te hemos enviado un comprobante de tu donación a tu correo electrónico.
              </p>
              <p>
                🐾 Tu donación nos ayuda a cubrir gastos de alimentación, atención veterinaria 
                y cuidados especiales para las mascotas que esperan encontrar un hogar.
              </p>
              <p>
                📱 Te mantendremos informado sobre el impacto de tu donación y las historias 
                de éxito de nuestras mascotas adoptadas.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/mascotas">
                Ver Mascotas Disponibles
              </Link>
            </Button>
            
            {donationId && (
              <Button variant="outline" onClick={handleDownloadReceipt}>
                <FileText className="w-4 h-4 mr-2" />
                Ver Comprobante
              </Button>
            )}
            
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
          </div>
          
          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-2">¿Quieres seguir ayudando?</h3>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="ghost" asChild>
                <Link href="/donaciones">
                  Hacer otra donación
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/registro">
                  Adoptar una mascota
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DonationSuccessPage() {
  return (
    <ProtectedRoute>
      <DonationSuccessContent />
    </ProtectedRoute>
  )
}