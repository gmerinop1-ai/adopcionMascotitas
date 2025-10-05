import { NextResponse } from "next/server"

// Mock data for testing
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
    descripcion: "Luna es una perra muy cariñosa y juguetona",
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
    descripcion: "Max es un gato tranquilo y elegante",
    estado: "disponible",
    esterilizado: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
]

export async function GET() {
  try {
    // TODO: Fetch from database
    // const mascotas = await query<Mascota>("SELECT * FROM mascotas ORDER BY created_at DESC")

    return NextResponse.json({ mascotas: mockMascotas })
  } catch (error) {
    console.error("[v0] Error fetching mascotas:", error)
    return NextResponse.json({ error: "Error al obtener mascotas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // TODO: Insert into database
    // const result = await query(
    //   "INSERT INTO mascotas (...) VALUES (...) RETURNING id",
    //   [...]
    // )

    return NextResponse.json({ success: true, message: "Mascota registrada con éxito" }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating mascota:", error)
    return NextResponse.json({ error: "Error al registrar mascota" }, { status: 500 })
  }
}
