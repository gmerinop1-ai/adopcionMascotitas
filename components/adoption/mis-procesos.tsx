"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Eye } from "lucide-react"
import Link from "next/link"
import type { SolicitudAdopcion } from "@/lib/db"

interface SolicitudWithMascota extends SolicitudAdopcion {
  mascota_nombre?: string
  mascota_foto?: string
}

export function MisProcesos() {
  const [solicitudes, setSolicitudes] = useState<SolicitudWithMascota[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSolicitudes()
  }, [])

  const fetchSolicitudes = async () => {
    try {
      // TODO: Get user ID from session
      const response = await fetch("/api/solicitudes/mis-procesos")
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
      case "pre_filtro":
        return <Badge variant="secondary">Pre-Filtro</Badge>
      case "entrevista":
        return <Badge className="bg-primary">Entrevista</Badge>
      case "aprobada":
        return <Badge className="bg-accent text-accent-foreground">Aprobada</Badge>
      case "rechazada":
        return <Badge variant="destructive">Rechazada</Badge>
      case "cancelada":
        return <Badge variant="outline">Cancelada</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const getEstadoDescription = (estado: string) => {
    switch (estado) {
      case "pre_filtro":
        return "Tu solicitud está siendo revisada por nuestro equipo"
      case "entrevista":
        return "Nos pondremos en contacto contigo para coordinar una entrevista"
      case "aprobada":
        return "¡Felicidades! Tu solicitud ha sido aprobada"
      case "rechazada":
        return "Lamentablemente tu solicitud no fue aprobada en esta ocasión"
      case "cancelada":
        return "Esta solicitud ha sido cancelada"
      default:
        return ""
    }
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
                  <p className="text-sm text-muted-foreground">
                    Solicitud #{solicitud.id} • {new Date(solicitud.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
              {getEstadoBadge(solicitud.estado)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{getEstadoDescription(solicitud.estado)}</p>

            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/mascotas/${solicitud.mascota_id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Mascota
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
