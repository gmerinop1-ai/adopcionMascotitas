"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Phone, Mail, MapPin, FileText, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import {
  isValidTransition,
  getValidNextStates,
  getTransitionError,
  getEstadoLabel,
  type EstadoSolicitud,
} from "@/lib/estado-validations"

interface SolicitudDetailData {
  id: number
  usuario_id: number
  mascota_id: number
  mascota_nombre: string
  mascota_foto: string
  postulante_nombre: string
  postulante_correo: string
  dni: string
  telefono: string
  distrito: string
  motivacion: string
  disponibilidad_tiempo: string
  condiciones_hogar: string
  estado: EstadoSolicitud
  observaciones_internas?: string
  created_at: string
  updated_at: string
}

interface HistorialEntry {
  id: number
  estado_anterior?: string
  estado_nuevo: string
  admin_nombre?: string
  notas?: string
  created_at: string
}

interface SolicitudDetailProps {
  solicitudId: string
}

export function SolicitudDetail({ solicitudId }: SolicitudDetailProps) {
  const [solicitud, setSolicitud] = useState<SolicitudDetailData | null>(null)
  const [historial, setHistorial] = useState<HistorialEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState<EstadoSolicitud>("pre_filtro")
  const [observaciones, setObservaciones] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    fetchSolicitud()
  }, [solicitudId])

  const fetchSolicitud = async () => {
    try {
      const response = await fetch(`/api/admin/solicitudes/${solicitudId}`)
      const data = await response.json()
      setSolicitud(data.solicitud)
      setHistorial(data.historial || [])
      setNuevoEstado(data.solicitud.estado)
      setObservaciones(data.solicitud.observaciones_internas || "")
    } catch (error) {
      console.error("[v0] Error fetching solicitud:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateEstado = async () => {
    if (!solicitud) return

    if (!isValidTransition(solicitud.estado, nuevoEstado)) {
      setErrorMessage(getTransitionError(solicitud.estado, nuevoEstado))
      return
    }

    setIsUpdating(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const response = await fetch(`/api/admin/solicitudes/${solicitudId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: nuevoEstado,
          observaciones_internas: observaciones,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || "Error al actualizar el estado")
        return
      }

      setSuccessMessage("Estado actualizado correctamente. El adoptante será notificado del cambio.")
      fetchSolicitud()
    } catch (error) {
      setErrorMessage("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setIsUpdating(false)
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (!solicitud) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Solicitud no encontrada</p>
        </CardContent>
      </Card>
    )
  }

  const validNextStates = getValidNextStates(solicitud.estado)
  const canChangeState = validNextStates.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">Solicitud #{solicitud.id}</CardTitle>
                {getEstadoBadge(solicitud.estado)}
              </div>
              <p className="text-sm text-muted-foreground">
                Creada el {new Date(solicitud.created_at).toLocaleDateString("es-ES")} •{" "}
                {new Date(solicitud.created_at).toLocaleTimeString("es-ES")}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mascota Info */}
        <Card>
          <CardHeader>
            <CardTitle>Mascota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-20 w-20 rounded-lg overflow-hidden bg-secondary">
                <img
                  src={solicitud.mascota_foto || "/placeholder.svg"}
                  alt={solicitud.mascota_nombre}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-xl font-bold">{solicitud.mascota_nombre}</p>
                <Button asChild variant="link" className="h-auto p-0">
                  <Link href={`/mascotas/${solicitud.mascota_id}`}>Ver ficha completa</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Postulante Info */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Postulante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{solicitud.postulante_nombre}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{solicitud.postulante_correo}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>DNI: {solicitud.dni}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{solicitud.telefono}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{solicitud.distrito}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Respuestas del Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Respuestas del Formulario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Motivación para Adoptar</Label>
            <p className="text-muted-foreground mt-1 leading-relaxed">{solicitud.motivacion}</p>
          </div>

          <div>
            <Label className="text-base font-semibold">Disponibilidad de Tiempo</Label>
            <p className="text-muted-foreground mt-1 leading-relaxed">{solicitud.disponibilidad_tiempo}</p>
          </div>

          <div>
            <Label className="text-base font-semibold">Condiciones del Hogar</Label>
            <p className="text-muted-foreground mt-1 leading-relaxed">{solicitud.condiciones_hogar}</p>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Estado */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Estado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {successMessage && (
            <Alert className="bg-accent/10 text-accent-foreground border-accent">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {!canChangeState && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Esta solicitud está en un estado final y no puede ser modificada. Los estados finales son: Aprobada,
                Rechazada y Cancelada.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="estado">Cambiar Estado</Label>
            <Select value={nuevoEstado} onValueChange={(value) => setNuevoEstado(value as EstadoSolicitud)}>
              <SelectTrigger id="estado" disabled={!canChangeState}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={solicitud.estado} disabled>
                  {getEstadoLabel(solicitud.estado)} (Actual)
                </SelectItem>
                {validNextStates.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {getEstadoLabel(estado)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canChangeState && (
              <p className="text-xs text-muted-foreground">
                Estados válidos desde {getEstadoLabel(solicitud.estado)}:{" "}
                {validNextStates.map(getEstadoLabel).join(", ")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones Internas</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas internas sobre esta solicitud..."
              rows={4}
              disabled={!canChangeState}
            />
          </div>

          <Button onClick={handleUpdateEstado} disabled={isUpdating || !canChangeState}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              "Actualizar Estado"
            )}
          </Button>
        </CardContent>
      </Card>

      {historial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Cambios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historial.map((entry) => (
                <div key={entry.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {entry.estado_anterior && (
                        <>
                          {getEstadoBadge(entry.estado_anterior)}
                          <span className="text-muted-foreground">→</span>
                        </>
                      )}
                      {getEstadoBadge(entry.estado_nuevo)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString("es-ES")} •{" "}
                      {new Date(entry.created_at).toLocaleTimeString("es-ES")}
                      {entry.admin_nombre && ` • Por ${entry.admin_nombre}`}
                    </p>
                    {entry.notas && <p className="text-sm mt-1">{entry.notas}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
