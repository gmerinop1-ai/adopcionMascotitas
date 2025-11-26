"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FranjasDisponibles } from "@/components/adoption/franjas-disponibles"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Calendar, CheckCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Solicitud {
  id: string
  mascota_nombre: string
  mascota_foto: string
  estado: string
  fecha_entrevista?: string
}

export default function SeleccionarHorarioPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const solicitudId = params.id as string

  const [solicitud, setSolicitud] = useState<Solicitud | null>(null)
  const [selectedFranja, setSelectedFranja] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSolicitud()
    }
  }, [user, solicitudId])

  const fetchSolicitud = async () => {
    try {
      setIsLoading(true)
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }
      
      // Verificar que el usuario tiene una solicitud con estado 'entrevista' sin fecha o 'cancelada'
      const response = await fetch(`/api/solicitudes/mis-procesos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('[SELECCIONAR-HORARIO] Solicitudes obtenidas:', data.solicitudes?.length)
      console.log('[SELECCIONAR-HORARIO] Buscando solicitud ID:', solicitudId)
      
      const solicitudEncontrada = data.solicitudes?.find(
        (s: Solicitud) => s.id === solicitudId && 
        ((s.estado === 'entrevista' && !s.fecha_entrevista) || s.estado === 'cancelada')
      )
      
      console.log('[SELECCIONAR-HORARIO] Solicitud encontrada:', solicitudEncontrada)
      
      if (!solicitudEncontrada) {
        toast({
          title: "Solicitud no válida",
          description: "Esta solicitud no está disponible para selección de horario",
          variant: "destructive",
        })
        router.push('/mis-procesos')
        return
      }
      
      setSolicitud(solicitudEncontrada)
    } catch (error) {
      console.error('[SELECCIONAR-HORARIO] Error fetching solicitud:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo cargar la información de la solicitud",
        variant: "destructive",
      })
      router.push('/mis-procesos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedFranja || !solicitud) {
      toast({
        title: "Error",
        description: "Debes seleccionar un horario para continuar",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/solicitudes/${solicitudId}/seleccionar-horario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          franja_horaria_id: selectedFranja,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al confirmar horario')
      }

      const result = await response.json()
      
      toast({
        title: "¡Horario confirmado!",
        description: "Tu entrevista ha sido programada exitosamente",
      })

      setIsCompleted(true)
      
    } catch (error) {
      console.error('[SELECCIONAR-HORARIO] Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo confirmar el horario",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!solicitud) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No se encontró una solicitud válida para seleccionar horario.
            </p>
            <Button onClick={() => router.push('/mis-procesos')}>
              Volver a Mis Procesos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Horario Confirmado!</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Tu entrevista para la adopción de <span className="font-semibold">{solicitud.mascota_nombre}</span> ha sido programada exitosamente.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/mis-procesos')}>
                Ver Mis Procesos
              </Button>
              <Button variant="outline" onClick={() => router.push('/mascotas')}>
                Ver Más Mascotas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/mis-procesos')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Selecciona tu Horario de Entrevista</h1>
          <p className="text-muted-foreground">
            Elige el horario que mejor se adapte a tu disponibilidad
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Entrevista para Adopción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-semibold">
              {solicitud.mascota_nombre[0]}
            </div>
            <div>
              <p className="font-medium">{solicitud.mascota_nombre}</p>
              <Badge variant="outline">
                {solicitud.estado === 'cancelada' ? 'Reprogramando Entrevista' : 'Entrevista Programada'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          El administrador ha programado una entrevista para tu solicitud de adopción. 
          Por favor selecciona el horario que mejor se ajuste a tu disponibilidad.
        </AlertDescription>
      </Alert>

      <FranjasDisponibles
        selectedFranja={selectedFranja}
        onFranjaSelect={setSelectedFranja}
        disabled={isSubmitting}
      />

      <div className="flex gap-4">
        <Button
          onClick={handleSubmit}
          disabled={!selectedFranja || isSubmitting}
          size="lg"
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirmando horario...
            </>
          ) : (
            "Confirmar Horario"
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push('/mis-procesos')}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}