import { NextResponse } from "next/server"

// Mock data - only show available pets
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
    descripcion: "Luna es una perra muy cariñosa y juguetona. Le encanta correr en el parque y jugar con niños.",
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
    descripcion: "Max es un gato tranquilo y elegante. Perfecto para apartamentos.",
    estado: "disponible",
    esterilizado: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 3,
    nombre: "Rocky",
    especie: "perro",
    raza: "Pastor Alemán",
    sexo: "macho",
    edad: 5,
    tamano: "grande",
    ubicacion: "Lima, Surco",
    foto_url: "/german-shepherd-dog.jpg",
    descripcion: "Rocky es un perro leal y protector. Ideal para familias con espacio.",
    estado: "reservado",
    esterilizado: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
]

export async function GET() {
  try {
    // TODO: Fetch from database - only disponible and reservado
    // const mascotas = await query<Mascota>(
    //   "SELECT * FROM mascotas WHERE estado IN ('disponible', 'reservado') ORDER BY created_at DESC"
    // )

    return NextResponse.json({ mascotas: mockMascotas })
  } catch (error) {
    console.error("[v0] Error fetching mascotas:", error)
    return NextResponse.json({ error: "Error al obtener mascotas" }, { status: 500 })
  }
}
