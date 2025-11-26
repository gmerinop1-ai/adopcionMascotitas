"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, Clock, Calendar, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FranjaHoraria {
  id: string
  fecha: string
  hora_inicio: string
  duracion_minutos: number
  cupo_maximo: number
  cupo_disponible: number
  estado: 'borrador' | 'publicado' | 'completado'
  created_at: string
  updated_at: string
}

interface FranjasDisponiblesProps {
  selectedFranja: string | null
  onFranjaSelect: (franjaId: string | null) => void
  disabled?: boolean
}

export function FranjasDisponibles({ selectedFranja, onFranjaSelect, disabled = false }: FranjasDisponiblesProps) {
  const [franjasDisponibles, setFranjasDisponibles] = useState<FranjaHoraria[]>([])
  const [franjasAgrupadas, setFranjasAgrupadas] = useState<Record<string, FranjaHoraria[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFranjasDisponibles()
  }, [])

  const fetchFranjasDisponibles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch("/api/franjas-disponibles")
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setFranjasDisponibles(data.franjasDisponibles || [])
      setFranjasAgrupadas(data.franjasAgrupadas || {})
    } catch (error) {
      console.error("[FRANJAS] Error fetching franjas disponibles:", error)
      setError("No se pudieron cargar los horarios disponibles")
      setFranjasDisponibles([])
      setFranjasAgrupadas({})
    } finally {
      setIsLoading(false)
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatHora = (hora: string) => {
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFinHorario = (hora_inicio: string, duracion_minutos: number) => {
    const inicio = new Date(`2000-01-01T${hora_inicio}`)
    const fin = new Date(inicio.getTime() + duracion_minutos * 60000)
    return fin.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFranjaInfo = (franjaId: string) => {
    return franjasDisponibles.find(f => f.id === franjaId)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Horario de Entrevista</CardTitle>
          <CardDescription>
            Elige un horario disponible para tu entrevista de adopción
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Horario de Entrevista</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (franjasDisponibles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Horario de Entrevista</CardTitle>
          <CardDescription>
            Elige un horario disponible para tu entrevista de adopción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              En este momento no hay horarios disponibles para entrevistas. 
              Por favor, intenta nuevamente más tarde o contacta con el administrador.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seleccionar Horario de Entrevista</CardTitle>
        <CardDescription>
          Elige un horario disponible para tu entrevista de adopción
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup 
          value={selectedFranja || ""} 
          onValueChange={onFranjaSelect}
          disabled={disabled}
        >
          {Object.entries(franjasAgrupadas)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([fecha, franjas]) => (
              <div key={fecha} className="space-y-3">
                <div className="font-semibold text-lg text-primary">
                  {formatFecha(fecha)}
                </div>
                
                <div className="grid gap-3 ml-4">
                  {franjas
                    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                    .map((franja) => (
                      <div key={franja.id} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={franja.id}
                          id={franja.id}
                          disabled={disabled || franja.cupo_disponible === 0}
                        />
                        <Label
                          htmlFor={franja.id}
                          className={`flex-1 cursor-pointer ${
                            disabled || franja.cupo_disponible === 0 
                              ? 'opacity-50 cursor-not-allowed' 
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {formatHora(franja.hora_inicio)} - {getFinHorario(franja.hora_inicio, franja.duracion_minutos)}
                                </span>
                              </div>
                              
                              <Badge variant="secondary">
                                {franja.duracion_minutos} min
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>
                                  {franja.cupo_disponible > 0 
                                    ? `${franja.cupo_disponible} disponible${franja.cupo_disponible > 1 ? 's' : ''}`
                                    : 'Completo'
                                  }
                                </span>
                              </div>
                              
                              {franja.cupo_disponible === 0 && (
                                <Badge variant="secondary">Completo</Badge>
                              )}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </RadioGroup>

        {selectedFranja && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">Horario Seleccionado</span>
            </div>
            {(() => {
              const franjaInfo = getFranjaInfo(selectedFranja)
              if (!franjaInfo) return null
              return (
                <div className="text-sm">
                  <div className="font-medium">
                    {formatFecha(franjaInfo.fecha)} a las {formatHora(franjaInfo.hora_inicio)}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    Duración: {franjaInfo.duracion_minutos} minutos 
                    ({formatHora(franjaInfo.hora_inicio)} - {getFinHorario(franjaInfo.hora_inicio, franjaInfo.duracion_minutos)})
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}