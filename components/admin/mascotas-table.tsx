"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Trash2, ToggleLeft } from "lucide-react"
import Link from "next/link"
import type { Mascota } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function MascotasTable() {
  const [mascotas, setMascotas] = useState<Mascota[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null)
  const [showChangeStateModal, setShowChangeStateModal] = useState(false)
  const [motivoRetiro, setMotivoRetiro] = useState("")
  const [notaRetiro, setNotaRetiro] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    fetchMascotas()
  }, [])

  const fetchMascotas = async () => {
    try {
      const response = await fetch("/api/admin/mascotas")
      const data = await response.json()
      setMascotas(data.mascotas || [])
    } catch (error) {
      console.error("[v0] Error fetching mascotas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta mascota?")) return

    try {
      await fetch(`/api/admin/mascotas/${id}`, { method: "DELETE" })
      fetchMascotas()
    } catch (error) {
      console.error("[v0] Error deleting mascota:", error)
    }
  }

  const handleChangeState = (mascota: Mascota) => {
    setSelectedMascota(mascota)
    setMotivoRetiro("")
    setNotaRetiro("")
    setShowChangeStateModal(true)
  }

  const handleConfirmChangeState = async () => {
    if (!selectedMascota) return

    // Validar que se seleccione un motivo si se va a retirar
    if (selectedMascota.estado === "disponible" && !motivoRetiro) {
      alert("Por favor selecciona un motivo del retiro")
      return
    }

    setIsUpdating(true)

    try {
      const newState = selectedMascota.estado === "disponible" ? "no_disponible" : "disponible"
      
      const response = await fetch(`/api/admin/mascotas/${selectedMascota.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: newState,
          motivo_no_disponible: newState === "no_disponible" ? motivoRetiro : "",
          nota_estado: newState === "no_disponible" ? notaRetiro : "",
        }),
      })

      if (response.ok) {
        setSuccessMessage("Estado actualizado correctamente")
        setShowChangeStateModal(false)
        fetchMascotas()
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      console.error("[v0] Error updating mascota state:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "disponible":
        return <Badge className="bg-accent text-accent-foreground">Disponible</Badge>
      case "reservado":
        return <Badge variant="secondary">Reservado</Badge>
      case "no_disponible":
        return <Badge variant="outline">No Disponible</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Cargando mascotas...</CardContent>
      </Card>
    )
  }

  if (mascotas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No hay mascotas registradas</p>
          <Button asChild>
            <Link href="/admin/mascotas/nueva">Registrar Primera Mascota</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Especie</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mascotas.map((mascota) => (
                <TableRow key={mascota.id}>
                  <TableCell>
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary">
                      <img
                        src={mascota.url_foto || "/placeholder.svg"}
                        alt={mascota.nombre}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{mascota.nombre}</TableCell>
                  <TableCell>{mascota.especie}</TableCell>
                  <TableCell>{getEstadoBadge(mascota.estado)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/mascotas/${mascota.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/mascotas/${mascota.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleChangeState(mascota)}
                        title={mascota.estado === "disponible" ? "Retirar del catálogo" : "Reintegrar al catálogo"}
                      >
                        <ToggleLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(mascota.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Cambio de Estado */}
      <Dialog open={showChangeStateModal} onOpenChange={setShowChangeStateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedMascota?.estado === "disponible" 
                ? "¿Desea retirar esta mascota del catálogo público?" 
                : "¿Desea reintegrar esta mascota al catálogo público?"}
            </DialogTitle>
            <DialogDescription>
              {selectedMascota?.estado === "disponible" 
                ? `Se retirará "${selectedMascota?.nombre}" del catálogo de adopción.`
                : `Se reintegrará "${selectedMascota?.nombre}" al catálogo de adopción.`}
            </DialogDescription>
          </DialogHeader>

          {selectedMascota?.estado === "disponible" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="motivo">
                  Motivo del retiro <span className="text-red-500">*</span>
                </Label>
                <Select value={motivoRetiro} onValueChange={setMotivoRetiro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adoptada">Adoptada</SelectItem>
                    <SelectItem value="en_tratamiento">En tratamiento</SelectItem>
                    <SelectItem value="reintegrada">Reintegrada</SelectItem>
                    <SelectItem value="fallecida">Fallecida</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {motivoRetiro === "otro" && (
                <div className="space-y-2">
                  <Label htmlFor="nota">Nota adicional</Label>
                  <Textarea
                    id="nota"
                    value={notaRetiro}
                    onChange={(e) => setNotaRetiro(e.target.value)}
                    placeholder="Describe el motivo..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeStateModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmChangeState} 
              disabled={isUpdating || (selectedMascota?.estado === "disponible" && !motivoRetiro)}
            >
              {isUpdating ? "Procesando..." : "Confirmar Cambio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mensaje de éxito */}
      {successMessage && (
        <Alert className="mt-4 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}
    </>
  )
}
