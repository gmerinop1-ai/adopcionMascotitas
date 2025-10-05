import { NextResponse } from "next/server"

const mockMascotas = [
  {
    id: 1,
    nombre: "Luna",
    especie: "perro",
    raza: "Labrador",
    sexo: "hembra",
    edad: 3,
    tamano: "grande",
    ubicacion: "Lima, San Isidro",
    foto_url: "/friendly-labrador-dog.jpg",
    descripcion:
      "Luna es una perra muy cariñosa y juguetona. Le encanta correr en el parque y jugar con niños. Es perfecta para familias activas que disfruten de actividades al aire libre. Luna está completamente entrenada y socializada.",
    estado: "disponible",
    esterilizado: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    nombre: "Max",
    especie: "gato",
    raza: "Siamés",
    sexo: "macho",
    edad: 2,
    tamano: "mediano",
    ubicacion: "Lima, Miraflores",
    foto_url: "/siamese-cat.png",
    descripcion:
      "Max es un gato tranquilo y elegante. Perfecto para apartamentos. Le gusta observar por la ventana y es muy independiente pero cariñoso cuando quiere atención.",
    estado: "disponible",
    esterilizado: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
]

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // TODO: Fetch from database
    // const mascotas = await query<Mascota>(
    //   "SELECT * FROM mascotas WHERE id = $1 AND estado IN ('disponible', 'reservado')",
    //   [id]
    // )

    const mascota = mockMascotas.find((m) => m.id === Number.parseInt(id))

    if (!mascota) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ mascota })
  } catch (error) {
    console.error("[v0] Error fetching mascota:", error)
    return NextResponse.json({ error: "Error al obtener mascota" }, { status: 500 })
  }
}
