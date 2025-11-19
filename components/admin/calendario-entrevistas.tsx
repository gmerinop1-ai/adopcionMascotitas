"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Clock, Phone, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface EntrevistaData {
  id: string
  solicitud_id: string
  fecha_entrevista: string
  estado: string
  mascota_nombre: string
  postulante_nombre: string
  postulante_telefono: string
  observaciones?: string
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function CalendarioEntrevistas() {
  const [entrevistas, setEntrevistas] = useState<EntrevistaData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fechaActual, setFechaActual] = useState(new Date())
  const [selectedEntrevista, setSelectedEntrevista] = useState<EntrevistaData | null>(null)
  const [vistaMode, setVistaMode] = useState<'calendario' | 'lista'>('calendario')

  useEffect(() => {
    fetchEntrevistas()
  }, [fechaActual])

  const fetchEntrevistas = async () => {
    try {
      setIsLoading(true)
      const startOfMonth = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1)
      const endOfMonth = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0)
      
      const params = new URLSearchParams({
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      })

      console.log('[CALENDAR] Fetching entrevistas for:', {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      })

      const response = await fetch(`/api/admin/entrevistas?${params}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[CALENDAR] Response not ok:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('[CALENDAR] Response data:', data)
      
      // Asegurarse de que siempre tengamos un array
      const entrevistasData = Array.isArray(data.entrevistas) ? data.entrevistas : []
      console.log('[CALENDAR] Entrevistas obtenidas:', entrevistasData.length)
      
      setEntrevistas(entrevistasData)
    } catch (error) {
      console.error("[CALENDAR] Error fetching entrevistas:", error)
      // En caso de error, establecer array vacío para evitar crashes
      setEntrevistas([])
      
      // Mostrar el error al usuario si es necesario
      if (error instanceof Error) {
        console.error('[CALENDAR] Error details:', error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const obtenerEntrevistasPorDia = (fecha: Date) => {
    return entrevistas.filter(entrevista => {
      const fechaEntrevista = new Date(entrevista.fecha_entrevista)
      return (
        fechaEntrevista.getDate() === fecha.getDate() &&
        fechaEntrevista.getMonth() === fecha.getMonth() &&
        fechaEntrevista.getFullYear() === fecha.getFullYear()
      )
    })
  }

  const generarDiasCalendario = () => {
    const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1)
    const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0)
    const primerDiaCalendario = new Date(primerDiaMes)
    primerDiaCalendario.setDate(primerDiaMes.getDate() - primerDiaMes.getDay())

    const dias = []
    const fechaActualIterar = new Date(primerDiaCalendario)

    for (let semana = 0; semana < 6; semana++) {
      for (let dia = 0; dia < 7; dia++) {
        const fecha = new Date(fechaActualIterar)
        const entrevistasDelDia = obtenerEntrevistasPorDia(fecha)
        
        dias.push({
          fecha,
          esMesActual: fecha.getMonth() === fechaActual.getMonth(),
          entrevistas: entrevistasDelDia
        })
        
        fechaActualIterar.setDate(fechaActualIterar.getDate() + 1)
      }
    }

    return dias
  }

  const navegarMes = (direccion: 'anterior' | 'siguiente') => {
    setFechaActual(prev => {
      const nuevaFecha = new Date(prev)
      if (direccion === 'anterior') {
        nuevaFecha.setMonth(prev.getMonth() - 1)
      } else {
        nuevaFecha.setMonth(prev.getMonth() + 1)
      }
      return nuevaFecha
    })
  }

  const formatearHora = (fechaString: string) => {
    return new Date(fechaString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatearFechaCompleta = (fechaString: string) => {
    return new Date(fechaString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendario de Entrevistas</h2>
          <p className="text-muted-foreground">
            Visualiza y gestiona las entrevistas programadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={vistaMode === 'calendario' ? 'default' : 'outline'}
            onClick={() => setVistaMode('calendario')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </Button>
          <Button
            variant={vistaMode === 'lista' ? 'default' : 'outline'}
            onClick={() => setVistaMode('lista')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Lista
          </Button>
        </div>
      </div>

      {vistaMode === 'calendario' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {MESES[fechaActual.getMonth()]} {fechaActual.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navegarMes('anterior')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFechaActual(new Date())}
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navegarMes('siguiente')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {DIAS_SEMANA.map(dia => (
                <div key={dia} className="p-2 text-center font-medium text-sm text-muted-foreground">
                  {dia}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {generarDiasCalendario().map((dia, index) => (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border rounded-lg transition-colors hover:bg-muted/50 ${
                    !dia.esMesActual ? 'opacity-50' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    dia.fecha.toDateString() === new Date().toDateString() 
                      ? 'text-primary font-bold' 
                      : ''
                  }`}>
                    {dia.fecha.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dia.entrevistas.map((entrevista) => (
                      <div
                        key={entrevista.id}
                        className="text-xs p-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                        onClick={() => setSelectedEntrevista(entrevista)}
                      >
                        <div className="font-medium">{formatearHora(entrevista.fecha_entrevista)}</div>
                        <div className="truncate">{entrevista.postulante_nombre}</div>
                        <div className="truncate text-blue-600">{entrevista.mascota_nombre}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Próximas Entrevistas</CardTitle>
          </CardHeader>
          <CardContent>
            {entrevistas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No hay entrevistas programadas</p>
                <p>Para este mes no hay entrevistas agendadas. Las entrevistas aparecerán aquí cuando se programen desde la gestión de solicitudes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entrevistas
                  .sort((a, b) => new Date(a.fecha_entrevista).getTime() - new Date(b.fecha_entrevista).getTime())
                  .map((entrevista) => (
                    <Card key={entrevista.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">
                              {formatearFechaCompleta(entrevista.fecha_entrevista)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Postulante:</span> {entrevista.postulante_nombre}
                            </div>
                            <div>
                              <span className="font-medium">Mascota:</span> {entrevista.mascota_nombre}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {entrevista.postulante_telefono}
                            </div>
                            <div>
                              <Badge 
                                variant={entrevista.estado === 'programada' ? 'default' : 'secondary'}
                              >
                                {entrevista.estado}
                              </Badge>
                            </div>
                          </div>
                          
                          {entrevista.observaciones && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Observaciones:</span> {entrevista.observaciones}
                            </div>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEntrevista(entrevista)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog para detalles de entrevista */}
      {selectedEntrevista && (
        <Dialog open={!!selectedEntrevista} onOpenChange={() => setSelectedEntrevista(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles de la Entrevista</DialogTitle>
              <DialogDescription>
                Información completa de la entrevista programada
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Postulante</h4>
                  <p className="text-sm">{selectedEntrevista.postulante_nombre}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Phone className="h-3 w-3" />
                    {selectedEntrevista.postulante_telefono}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Mascota</h4>
                  <p className="text-sm">{selectedEntrevista.mascota_nombre}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Fecha y Hora</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    {formatearFechaCompleta(selectedEntrevista.fecha_entrevista)}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Estado</h4>
                <Badge variant={selectedEntrevista.estado === 'programada' ? 'default' : 'secondary'}>
                  {selectedEntrevista.estado}
                </Badge>
              </div>
              
              {selectedEntrevista.observaciones && (
                <div>
                  <h4 className="font-medium mb-2">Observaciones</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedEntrevista.observaciones}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedEntrevista(null)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    // Redirigir al administrador para ver la solicitud completa
                    window.open(`/admin/solicitudes?highlight=${selectedEntrevista.solicitud_id}`, '_blank')
                  }}
                >
                  Ver Solicitud Completa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}