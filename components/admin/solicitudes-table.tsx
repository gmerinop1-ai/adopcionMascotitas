"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Eye, Calendar, Clock, Phone, MapPin, CheckCircle, AlertCircle } from "lucide-react"
import { SolicitudDetail } from "./solicitud-detail"
import { useToast } from "@/hooks/use-toast"

interface SolicitudWithDetails {
  id: string
  fecha: string
  mascota_nombre: string
  mascota_id: string
  postulante_nombre: string
  postulante_correo: string
  postulante_telefono: string
  distrito_ciudad: string
  estado: string
  fecha_entrevista?: string
  created_at: string
  updated_at: string
}

export function SolicitudesTable() {
  const { toast } = useToast()
  const [solicitudes, setSolicitudes] = useState<SolicitudWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("todas")
  const [selectedSolicitud, setSelectedSolicitud] = useState<string | null>(null)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    solicitud_id: "",
    fecha_entrevista: "",
    observaciones: ""
  })

  useEffect(() => {
    fetchSolicitudes()
  }, [])

  const fetchSolicitudes = async () => {
    try {
      const response = await fetch("/api/admin/solicitudes")
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
        return <Badge className="bg-blue-600">Entrevista</Badge>
      case "aprobada":
        return <Badge className="bg-green-600">Aprobada</Badge>
      case "rechazada":
        return <Badge variant="destructive">Rechazada</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const filteredSolicitudes = solicitudes.filter(solicitud => {
    if (activeTab === "todas") return true
    if (activeTab === "pendientes") return solicitud.estado === "pendiente"
    if (activeTab === "entrevistas") return solicitud.estado === "entrevista"
    if (activeTab === "aprobadas") return solicitud.estado === "aprobada"
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleScheduleInterview = (solicitudId: string) => {
    setScheduleForm({
      solicitud_id: solicitudId,
      fecha_entrevista: "",
      observaciones: ""
    })
    setShowScheduleDialog(true)
  }

  const submitSchedule = async () => {
    try {
      // Validar campos requeridos
      if (!scheduleForm.solicitud_id) {
        toast({
          title: "Error de validación",
          description: "No se ha seleccionado una solicitud válida",
          variant: "destructive",
        })
        return
      }

      if (!scheduleForm.fecha_entrevista) {
        toast({
          title: "Error de validación",
          description: "La fecha de entrevista es requerida",
          variant: "destructive",
        })
        return
      }

      // Validar que la fecha sea futura
      const fechaEntrevista = new Date(scheduleForm.fecha_entrevista)
      const ahora = new Date()
      
      if (isNaN(fechaEntrevista.getTime())) {
        toast({
          title: "Error de validación",
          description: "Formato de fecha inválido",
          variant: "destructive",
        })
        return
      }
      
      if (fechaEntrevista <= ahora) {
        toast({
          title: "Error de validación",
          description: "La fecha de entrevista debe ser futura",
          variant: "destructive",
        })
        return
      }

      console.log("[FORM] Enviando solicitud de programación:", {
        solicitud_id: scheduleForm.solicitud_id,
        estado: "entrevista",
        fecha_entrevista: scheduleForm.fecha_entrevista,
        observaciones: scheduleForm.observaciones
      })

      const response = await fetch(`/api/admin/solicitudes/${scheduleForm.solicitud_id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          estado: "entrevista",
          fecha_entrevista: scheduleForm.fecha_entrevista,
          observaciones: scheduleForm.observaciones
        })
      })

      console.log("[FORM] Respuesta del servidor:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      })

      if (response.ok) {
        const successData = await response.json()
        console.log("[FORM] ✅ Entrevista programada exitosamente:", successData)
        
        setShowScheduleDialog(false)
        fetchSolicitudes() // Refresh data
        
        toast({
          title: "¡Entrevista programada!",
          description: "La entrevista se ha programado exitosamente.",
        })
      } else {
        // Intentar parsear la respuesta de error
        let errorData = {}
        let responseText = ""
        
        try {
          responseText = await response.text()
          console.log("[FORM] Respuesta de error como texto:", responseText)
          
          if (responseText && responseText.trim()) {
            try {
              errorData = JSON.parse(responseText)
            } catch (jsonError) {
              console.warn("[FORM] No se pudo parsear como JSON, usando texto plano")
              errorData = { error: responseText }
            }
          } else {
            errorData = { error: `Error ${response.status}: ${response.statusText}` }
          }
        } catch (textError) {
          console.error("[FORM] Error obteniendo texto de respuesta:", textError)
          errorData = { error: `Error ${response.status}: ${response.statusText}` }
        }
        
        console.error("[FORM] Error del servidor:", errorData)
        
        const errorMessage = 
          (errorData as any)?.details || 
          (errorData as any)?.error || 
          (errorData as any)?.message || 
          responseText ||
          `Error del servidor (${response.status})`
        
        toast({
          title: "Error al programar entrevista",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[FORM] Error en catch scheduling interview:", error)
      
      let errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo."
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Error de conexión. Verifica que el servidor esté funcionando."
      } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`
      }
      
      toast({
        title: "Error de conexión",
        description: errorMessage,
        variant: "destructive",
      })
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Solicitudes</h2>
          <p className="text-muted-foreground">
            Administra las solicitudes de adopción y programa entrevistas
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredSolicitudes.length} solicitud{filteredSolicitudes.length !== 1 ? 'es' : ''}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="entrevistas">Entrevistas</TabsTrigger>
          <TabsTrigger value="aprobadas">Aprobadas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredSolicitudes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No hay solicitudes {activeTab !== "todas" ? `en estado ${activeTab}` : ""}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Mascota</TableHead>
                    <TableHead>Postulante</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Entrevista</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSolicitudes.map((solicitud) => (
                    <TableRow key={solicitud.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{formatDate(solicitud.created_at)}</div>
                          <div className="text-muted-foreground">#{solicitud.id.slice(0, 8)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{solicitud.mascota_nombre}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{solicitud.postulante_nombre}</div>
                          <div className="text-sm text-muted-foreground">{solicitud.postulante_correo}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {solicitud.postulante_telefono}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {solicitud.distrito_ciudad}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getEstadoBadge(solicitud.estado)}</TableCell>
                      <TableCell>
                        {solicitud.fecha_entrevista ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateTime(solicitud.fecha_entrevista)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sin programar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSolicitud(solicitud.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {solicitud.estado === "pendiente" && (
                            <Button
                              size="sm"
                              onClick={() => handleScheduleInterview(solicitud.id)}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para programar entrevista */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Programar Entrevista</DialogTitle>
            <DialogDescription>
              Selecciona fecha y hora para la entrevista de adopción
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_entrevista">Fecha y Hora</Label>
              <Input
                id="fecha_entrevista"
                type="datetime-local"
                value={scheduleForm.fecha_entrevista}
                onChange={(e) => setScheduleForm(prev => ({
                  ...prev,
                  fecha_entrevista: e.target.value
                }))}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                placeholder="Notas adicionales sobre la entrevista..."
                value={scheduleForm.observaciones}
                onChange={(e) => setScheduleForm(prev => ({
                  ...prev,
                  observaciones: e.target.value
                }))}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowScheduleDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={submitSchedule}
                disabled={!scheduleForm.fecha_entrevista}
              >
                Programar Entrevista
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para detalles de solicitud */}
      {selectedSolicitud && (
        <Dialog open={!!selectedSolicitud} onOpenChange={() => setSelectedSolicitud(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles de Solicitud</DialogTitle>
              <DialogDescription>
                Información completa de la solicitud de adopción
              </DialogDescription>
            </DialogHeader>
            <SolicitudDetail 
              solicitudId={selectedSolicitud} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}