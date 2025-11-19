"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, Calendar, Clock } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import type { SolicitudAdopcion } from "@/lib/db"

export function MisProcesos() {
  const { user } = useAuth()
  const [solicitudes, setSolicitudes] = useState<SolicitudAdopcion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSolicitudes()
    }
  }, [user])

  const fetchSolicitudes = async () => {
    try {
      const response = await fetch("/api/solicitudes/mis-procesos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      })
      const data = await response.json()
      setSolicitudes(data.solicitudes || [])
    } catch (error) {
      console.error("[v0] Error fetching solicitudes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>
      case "entrevista":
        return <Badge className="bg-blue-600">Entrevista Programada</Badge>
      case "aprobada":
        return <Badge className="bg-green-600">Aprobada</Badge>
      case "rechazada":
        return <Badge variant="destructive">Rechazada</Badge>
      case "cancelada":
        return <Badge variant="outline">Cancelada</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const getEstadoDescription = (estado: string, fechaEntrevista?: string) => {
    switch (estado) {
      case "pendiente":
        return "Tu solicitud está siendo revisada por nuestro equipo"
      case "entrevista":
        return fechaEntrevista 
          ? `Entrevista programada para el ${new Date(fechaEntrevista).toLocaleDateString("es-ES", {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}`
          : "Nos pondremos en contacto contigo para coordinar una entrevista"
      case "aprobada":
        return "¡Felicidades! Tu solicitud ha sido aprobada. Puedes proceder con la adopción"
      case "rechazada":
        return "Lamentablemente tu solicitud no fue aprobada en esta ocasión"
      case "cancelada":
        return "Esta solicitud ha sido cancelada"
      default:
        return ""
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (solicitudes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No tienes solicitudes de adopción activas</p>
          <Button asChild>
            <Link href="/mascotas">Explorar Mascotas</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Procesos de Adopción</h2>
        <Badge variant="outline" className="text-sm">
          {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''}
        </Badge>
      </div>

      {solicitudes.map((solicitud) => (
        <Card key={solicitud.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {solicitud.mascota_foto && (
                  <div className="h-16 w-16 rounded-lg bg-secondary overflow-hidden">
                    <img
                      src={solicitud.mascota_foto || "/placeholder.svg"}
                      alt={solicitud.mascota_nombre}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <CardTitle className="mb-1">{solicitud.mascota_nombre || "Mascota"}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Solicitud #{solicitud.id.slice(0, 8)}</span>
                    {solicitud.created_at && (
                      <>
                        <span>•</span>
                        <span>Enviada el {formatDate(solicitud.created_at)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {getEstadoBadge(solicitud.estado)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {getEstadoDescription(solicitud.estado, solicitud.fecha_entrevista)}
              </p>

              {solicitud.estado === "entrevista" && solicitud.fecha_entrevista && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Próxima entrevista</span>
                    </div>
                    <p className="text-blue-600 mt-1">
                      {new Date(solicitud.fecha_entrevista).toLocaleDateString("es-ES", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/mascotas/${solicitud.mascota_id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Mascota
                  </Link>
                </Button>
                
                {solicitud.estado === "entrevista" && (
                  <Button variant="secondary" size="sm">
                    <Clock className="mr-2 h-4 w-4" />
                    Recordatorio
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
