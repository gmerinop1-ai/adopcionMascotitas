import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Mascota } from "@/lib/db"
import { MapPin, Heart } from "lucide-react"
import Image from "next/image"

interface MascotaCardProps {
  mascota: Mascota
}

export function MascotaCard({ mascota }: MascotaCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square">
        <Image
          src={mascota.foto_url || "/placeholder.svg?height=300&width=300"}
          alt={mascota.nombre}
          fill
          className="object-cover"
        />
        {mascota.estado === "reservado" && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary">Reservado</Badge>
          </div>
        )}
      </div>

      <CardContent className="pt-4">
        <div className="mb-2">
          <h3 className="text-xl font-bold mb-1">{mascota.nombre}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="capitalize">{mascota.especie}</span>
            {mascota.raza && (
              <>
                <span>•</span>
                <span>{mascota.raza}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="capitalize">
            {mascota.sexo}
          </Badge>
          {mascota.edad !== undefined && <Badge variant="outline">{mascota.edad} años</Badge>}
          {mascota.tamano && (
            <Badge variant="outline" className="capitalize">
              {mascota.tamano}
            </Badge>
          )}
        </div>

        {mascota.ubicacion && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{mascota.ubicacion}</span>
          </div>
        )}

        {mascota.descripcion && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{mascota.descripcion}</p>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link href={`/mascotas/${mascota.id}`}>
            <Heart className="mr-2 h-4 w-4" />
            Ver Detalles
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
