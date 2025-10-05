import { NextResponse } from "next/server"

// Mock data
const mockSolicitudes = [
  {
    id: 1,
    usuario_id: 1,
    mascota_id: 1,
    mascota_nombre: "Luna",
    mascota_foto: "/friendly-labrador-dog.jpg",
    dni: "12345678",
    telefono: "987654321",
    distrito: "Lima, San Isidro",
    motivacion: "Quiero adoptar a Luna porque...",
    disponibilidad_tiempo: "Trabajo desde casa...",
    condiciones_hogar: "Vivo en una casa con jardín...",
    estado: "entrevista",
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-01-20"),
  },
  {
    id: 2,
    usuario_id: 1,
    mascota_id: 2,
    mascota_nombre: "Max",
    mascota_foto: "/siamese-cat.png",
    dni: "12345678",
    telefono: "987654321",
    distrito: "Lima, Miraflores",
    motivacion: "Me encantan los gatos...",
    disponibilidad_tiempo: "Tengo tiempo completo...",
    condiciones_hogar: "Departamento amplio...",
    estado: "pre_filtro",
    created_at: new Date("2024-01-25"),
    updated_at: new Date("2024-01-25"),
  },
]

export async function GET() {
  try {
    // TODO: Get user ID from session and fetch their solicitudes
    // const session = await getSession()
    // const solicitudes = await query(
    //   `SELECT s.*, m.nombre as mascota_nombre, m.foto_url as mascota_foto
    //    FROM solicitudes_adopcion s
    //    JOIN mascotas m ON s.mascota_id = m.id
    //    WHERE s.usuario_id = $1
    //    ORDER BY s.created_at DESC`,
    //   [session.user.id]
    // )

    return NextResponse.json({ solicitudes: mockSolicitudes })
  } catch (error) {
    console.error("[v0] Error fetching solicitudes:", error)
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 })
  }
}
