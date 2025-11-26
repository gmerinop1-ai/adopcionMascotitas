"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Phone, Mail, MapPin, FileText, Clock, AlertCircle, Eye } from "lucide-react"
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
  const [nuevoEstado, setNuevoEstado] = useState<EstadoSolicitud>("pendiente")
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
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>
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
      {/* Header con navegación mejorada */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">Solicitud de Adopción #{solicitud.id}</CardTitle>
                {getEstadoBadge(solicitud.estado)}
              </div>
              <p className="text-sm text-muted-foreground">
                Creada el {new Date(solicitud.created_at).toLocaleDateString("es-ES", {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} a las {new Date(solicitud.created_at).toLocaleTimeString("es-ES", {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Última actualización: {new Date(solicitud.updated_at).toLocaleDateString("es-ES")} • {new Date(solicitud.updated_at).toLocaleTimeString("es-ES")}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">ID de Referencia</div>
              <div className="text-xs text-muted-foreground font-mono">
                SOL-{solicitud.id.toString().padStart(6, '0')}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mascota Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🐕</span>
              Mascota Solicitada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-xl overflow-hidden bg-secondary ring-2 ring-primary/10">
                <img
                  src={solicitud.mascota_foto || "/placeholder.svg"}
                  alt={solicitud.mascota_nombre}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold text-primary mb-1">{solicitud.mascota_nombre}</p>
                <p className="text-sm text-muted-foreground mb-3">ID: {solicitud.mascota_id}</p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/mascotas/${solicitud.mascota_id}`} target="_blank">
                    Ver ficha completa
                    <Eye className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Postulante Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Datos del Postulante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">{solicitud.postulante_nombre}</div>
                  <div className="text-xs text-muted-foreground">Nombre completo</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Mail className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm">{solicitud.postulante_correo}</div>
                    <div className="text-xs text-muted-foreground">Email</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-mono">{solicitud.dni}</div>
                    <div className="text-xs text-muted-foreground">DNI</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Phone className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm">{solicitud.telefono}</div>
                    <div className="text-xs text-muted-foreground">Teléfono</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm">{solicitud.distrito_ciudad}</div>
                    <div className="text-xs text-muted-foreground">Ubicación</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Respuestas del Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Respuestas del Formulario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold text-primary">Motivación para Adoptar</Label>
            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="text-sm leading-relaxed">{solicitud.razon}</p>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold text-primary">Disponibilidad de Tiempo</Label>
            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="text-sm leading-relaxed">
                {solicitud.condicion_hogar && solicitud.condicion_hogar.includes('DISPONIBILIDAD:') 
                  ? solicitud.condicion_hogar.split('||DISPONIBILIDAD: ')[1] || 'No especificado'
                  : 'No especificado'}
              </p>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold text-primary">Condiciones del Hogar</Label>
            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="text-sm leading-relaxed">
                {solicitud.condicion_hogar && solicitud.condicion_hogar.includes('||DISPONIBILIDAD:') 
                  ? solicitud.condicion_hogar.split('||DISPONIBILIDAD:')[0]
                  : solicitud.condicion_hogar}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Estado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gestión de Estado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {successMessage && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
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
            <Alert className="bg-blue-50 text-blue-800 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Esta solicitud está en un estado final y no puede ser modificada. Los estados finales son: Aprobada,
                Rechazada y Cancelada.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
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
                rows={3}
                disabled={!canChangeState}
              />
            </div>
          </div>

          <Button onClick={handleUpdateEstado} disabled={isUpdating || !canChangeState} className="w-full md:w-auto">
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
