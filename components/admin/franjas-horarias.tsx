"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus, Clock, Calendar, Users, Trash2, Check, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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

export function FranjasHorariasAdmin() {
  const { toast } = useToast()
  const [franjasHorarias, setFranjasHorarias] = useState<FranjaHoraria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedFranjas, setSelectedFranjas] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    fecha: '',
    hora_inicio: '',
    duracion_minutos: 60,
    cupo_maximo: 1
  })

  useEffect(() => {
    fetchFranjasHorarias()
  }, [])

  const fetchFranjasHorarias = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/franjas-horarias")
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setFranjasHorarias(data.franjasHorarias || [])
    } catch (error) {
      console.error("[FRANJAS] Error fetching franjas horarias:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las franjas horarias",
        variant: "destructive",
      })
      setFranjasHorarias([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFranja = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsCreating(true)
      
      // Validaciones del lado cliente
      if (!formData.fecha || !formData.hora_inicio || !formData.duracion_minutos) {
        toast({
          title: "Error de validación",
          description: "Todos los campos son requeridos",
          variant: "destructive",
        })
        return
      }

      // Validar que la fecha sea futura
      const fechaSeleccionada = new Date(formData.fecha)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      
      if (fechaSeleccionada < hoy) {
        toast({
          title: "Error de validación",
          description: "La fecha debe ser futura",
          variant: "destructive",
        })
        return
      }

      console.log("[FRANJAS] Creando franja horaria:", formData)

      const response = await fetch("/api/admin/franjas-horarias", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result = await response.json()
      console.log("[FRANJAS] Franja creada:", result)

      toast({
        title: "¡Franja horaria añadida!",
        description: "La franja se ha añadido a la lista de horarios pendientes",
      })

      // Limpiar formulario y cerrar dialog
      setFormData({
        fecha: '',
        hora_inicio: '',
        duracion_minutos: 60,
        cupo_maximo: 1
      })
      setShowCreateDialog(false)
      
      // Refrescar lista
      fetchFranjasHorarias()

    } catch (error) {
      console.error("[FRANJAS] Error creating franja:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la franja horaria",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteFranja = async (id: string) => {
    try {
      console.log("[FRANJAS] Eliminando franja:", id)

      const response = await fetch(`/api/admin/franjas-horarias/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      toast({
        title: "Franja eliminada",
        description: "La franja horaria se eliminó correctamente",
      })

      // Refrescar lista
      fetchFranjasHorarias()

    } catch (error) {
      console.error("[FRANJAS] Error deleting franja:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la franja horaria",
        variant: "destructive",
      })
    }
  }

  const handleSelectFranja = (id: string) => {
    setSelectedFranjas(prev => 
      prev.includes(id) 
        ? prev.filter(fId => fId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAllBorradores = () => {
    const borradorIds = franjasHorarias
      .filter(franja => franja.estado === 'borrador')
      .map(franja => franja.id)
    
    setSelectedFranjas(prev => {
      const allSelected = borradorIds.every(id => prev.includes(id))
      return allSelected ? prev.filter(id => !borradorIds.includes(id)) : [...new Set([...prev, ...borradorIds])]
    })
  }

  const handlePublishSelected = async () => {
    if (selectedFranjas.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos una franja horaria para publicar",
        variant: "destructive",
      })
      return
    }

    try {
      setIsPublishing(true)
      console.log("[FRANJAS] Publicando franjas:", selectedFranjas)

      const response = await fetch("/api/admin/franjas-horarias", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedFranjas })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result = await response.json()
      console.log("[FRANJAS] Franjas publicadas:", result)

      toast({
        title: "¡Franjas publicadas!",
        description: `${selectedFranjas.length} franjas horarias están ahora disponibles para los usuarios`,
      })

      // Limpiar selección y refrescar
      setSelectedFranjas([])
      fetchFranjasHorarias()

    } catch (error) {
      console.error("[FRANJAS] Error publishing franjas:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron publicar las franjas horarias",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
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

  const franjasPublicadas = franjasHorarias.filter(f => f.estado === 'publicado')
  const franjasBorrador = franjasHorarias.filter(f => f.estado === 'borrador')

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
          <h2 className="text-2xl font-bold">Gestión de Franjas Horarias</h2>
          <p className="text-muted-foreground">
            Define horarios disponibles para las entrevistas de adopción
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Franja
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Franja Horaria</DialogTitle>
              <DialogDescription>
                Define una nueva franja de tiempo para entrevistas
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateFranja} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora de Inicio</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duracion_minutos">Duración (minutos)</Label>
                <Input
                  id="duracion_minutos"
                  type="number"
                  min={15}
                  max={480}
                  step={15}
                  value={formData.duracion_minutos}
                  onChange={(e) => setFormData(prev => ({ ...prev, duracion_minutos: parseInt(e.target.value) }))}
                  required
                />
                <p className="text-xs text-muted-foreground">Entre 15 minutos y 8 horas</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cupo_maximo">Cupo</Label>
                <Input
                  id="cupo_maximo"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.cupo_maximo}
                  onChange={(e) => setFormData(prev => ({ ...prev, cupo_maximo: parseInt(e.target.value) }))}
                  required
                />
                <p className="text-xs text-muted-foreground">Número máximo de entrevistas simultáneas</p>
              </div>
              
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir a la Lista
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Franjas Borrador */}
      {franjasBorrador.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Horarios a Publicar ({franjasBorrador.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllBorradores}
                >
                  {franjasBorrador.every(f => selectedFranjas.includes(f.id)) ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                </Button>
                <Button
                  onClick={handlePublishSelected}
                  disabled={selectedFranjas.length === 0 || isPublishing}
                  size="sm"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Publicar Seleccionados ({selectedFranjas.length})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Estos horarios están en borrador. Puedes eliminarlos individualmente o seleccionar varios para publicar. 
                Al publicar, el sistema validará que no haya traslapes con otros horarios ya publicados.
              </AlertDescription>
            </Alert>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={franjasBorrador.length > 0 && franjasBorrador.every(f => selectedFranjas.includes(f.id))}
                      onChange={handleSelectAllBorradores}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Cupo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {franjasBorrador.map((franja) => (
                  <TableRow key={franja.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedFranjas.includes(franja.id)}
                        onChange={() => handleSelectFranja(franja.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatFecha(franja.fecha)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatHora(franja.hora_inicio)} - {getFinHorario(franja.hora_inicio, franja.duracion_minutos)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {franja.duracion_minutos} min
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {franja.cupo_maximo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFranja(franja.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Franjas Publicadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Horarios Publicados ({franjasPublicadas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {franjasPublicadas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No hay horarios publicados</p>
              <p>Los horarios publicados aparecerán aquí y estarán visibles para los usuarios.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Disponibilidad</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {franjasPublicadas.map((franja) => (
                  <TableRow key={franja.id}>
                    <TableCell>
                      <div className="font-medium">{formatFecha(franja.fecha)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatHora(franja.hora_inicio)} - {getFinHorario(franja.hora_inicio, franja.duracion_minutos)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {franja.duracion_minutos} min
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {franja.cupo_disponible} / {franja.cupo_maximo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={franja.cupo_disponible > 0 ? "default" : "secondary"}
                      >
                        {franja.cupo_disponible > 0 ? "Disponible" : "Completo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}