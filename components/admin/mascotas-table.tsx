"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import type { Mascota } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"

export function MascotasTable() {
  const [mascotas, setMascotas] = useState<Mascota[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta mascota?")) return

    try {
      await fetch(`/api/admin/mascotas/${id}`, { method: "DELETE" })
      fetchMascotas()
    } catch (error) {
      console.error("[v0] Error deleting mascota:", error)
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
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Especie</TableHead>
              <TableHead>Raza</TableHead>
              <TableHead>Sexo</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mascotas.map((mascota) => (
              <TableRow key={mascota.id}>
                <TableCell className="font-medium">{mascota.nombre}</TableCell>
                <TableCell>{mascota.especie}</TableCell>
                <TableCell>{mascota.raza || "-"}</TableCell>
                <TableCell className="capitalize">{mascota.sexo}</TableCell>
                <TableCell>{mascota.edad ? `${mascota.edad} años` : "-"}</TableCell>
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
  )
}
