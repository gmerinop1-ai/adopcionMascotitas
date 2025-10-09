"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

interface SolicitudWithDetails {
  id: number
  fecha: string
  mascota_nombre: string
  postulante_nombre: string
  postulante_correo: string
  estado: string
}

export function SolicitudesTable() {
  const [solicitudes, setSolicitudes] = useState<SolicitudWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("todas")

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

  const filterSolicitudes = (estado?: string) => {
    if (!estado || estado === "todas") return solicitudes
    return solicitudes.filter((s) => s.estado === estado)
  }

  const filteredSolicitudes = filterSolicitudes(activeTab)

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
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="todas">Todas ({solicitudes.length})</TabsTrigger>
        <TabsTrigger value="pre_filtro">
          Pre-Filtro ({solicitudes.filter((s) => s.estado === "pre_filtro").length})
        </TabsTrigger>
        <TabsTrigger value="entrevista">
          Entrevista ({solicitudes.filter((s) => s.estado === "entrevista").length})
        </TabsTrigger>
        <TabsTrigger value="aprobada">
          Aprobadas ({solicitudes.filter((s) => s.estado === "aprobada").length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab}>
        {filteredSolicitudes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay solicitudes de adopción.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Solicitud</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Mascota</TableHead>
                    <TableHead>Postulante</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSolicitudes.map((solicitud) => (
                    <TableRow key={solicitud.id}>
                      <TableCell className="font-medium">#{solicitud.id}</TableCell>
                      <TableCell>{new Date(solicitud.fecha).toLocaleDateString("es-ES")}</TableCell>
                      <TableCell>{solicitud.mascota_nombre}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{solicitud.postulante_nombre}</p>
                          <p className="text-sm text-muted-foreground">{solicitud.postulante_correo}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getEstadoBadge(solicitud.estado)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/solicitudes/${solicitud.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalle
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
