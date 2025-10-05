"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Mascota } from "@/lib/db"
import { ArrowLeft, Heart, MapPin, Shield, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface MascotaDetailProps {
  mascotaId: string
}

export function MascotaDetail({ mascotaId }: MascotaDetailProps) {
  const router = useRouter()
  const [mascota, setMascota] = useState<Mascota | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMascota()
  }, [mascotaId])

  const fetchMascota = async () => {
    try {
      const response = await fetch(`/api/mascotas/${mascotaId}`)
      const data = await response.json()
      setMascota(data.mascota)
    } catch (error) {
      console.error("[v0] Error fetching mascota:", error)
    } finally {
      setIsLoading(false)
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

  if (!mascota) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">Mascota no encontrada</p>
          <Button asChild>
            <Link href="/mascotas">Volver al catálogo</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost">
        <Link href="/mascotas">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al catálogo
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={mascota.foto_url || "/placeholder.svg?height=600&width=600"}
              alt={mascota.nombre}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-4xl font-bold">{mascota.nombre}</h1>
              {mascota.estado === "disponible" ? (
                <Badge className="bg-accent text-accent-foreground">Disponible</Badge>
              ) : (
                <Badge variant="secondary">Reservado</Badge>
              )}
            </div>
            <p className="text-xl text-muted-foreground capitalize">
              {mascota.especie}
              {mascota.raza && ` • ${mascota.raza}`}
            </p>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Sexo</p>
                <p className="text-lg font-semibold capitalize">{mascota.sexo}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Edad</p>
                <p className="text-lg font-semibold">{mascota.edad ? `${mascota.edad} años` : "No especificada"}</p>
              </CardContent>
            </Card>

            {mascota.tamano && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Tamaño</p>
                  <p className="text-lg font-semibold capitalize">{mascota.tamano}</p>
                </CardContent>
              </Card>
            )}

            {mascota.ubicacion && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Ubicación</p>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {mascota.ubicacion}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description */}
          {mascota.descripcion && (
            <Card>
              <CardHeader>
                <CardTitle>Sobre {mascota.nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{mascota.descripcion}</p>
              </CardContent>
            </Card>
          )}

          {/* Medical Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Información Médica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Esterilizado</span>
                <Badge variant={mascota.esterilizado ? "default" : "outline"}>
                  {mascota.esterilizado ? "Sí" : "No"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Vacunas y desparasitación al día</p>
            </CardContent>
          </Card>

          {/* CTA Button */}
          {mascota.estado === "disponible" && (
            <Button size="lg" className="w-full" asChild>
              <Link href={`/mascotas/${mascota.id}/postular`}>
                <Heart className="mr-2 h-5 w-5" />
                Postular a Adopción
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
