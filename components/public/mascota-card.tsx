import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Mascota } from "@/lib/db"
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
      </div>

      <CardContent className="pt-4 text-center">
        <h3 className="text-xl font-bold">{mascota.nombre}</h3>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link href={`/mascotas/${mascota.id}`}>
            Ver Detalles
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
