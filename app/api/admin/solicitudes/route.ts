import { NextResponse } from "next/server"

// Mock data
const mockSolicitudes = [
  {
    id: 1,
    fecha: "2024-01-15",
    mascota_nombre: "Luna",
    postulante_nombre: "Juan Pérez",
    postulante_correo: "juan@email.com",
    estado: "entrevista",
  },
  {
    id: 2,
    fecha: "2024-01-20",
    mascota_nombre: "Max",
    postulante_nombre: "María García",
    postulante_correo: "maria@email.com",
    estado: "pre_filtro",
  },
  {
    id: 3,
    fecha: "2024-01-22",
    mascota_nombre: "Rocky",
    postulante_nombre: "Carlos López",
    postulante_correo: "carlos@email.com",
    estado: "pre_filtro",
  },
  {
    id: 4,
    fecha: "2024-01-10",
    mascota_nombre: "Luna",
    postulante_nombre: "Ana Martínez",
    postulante_correo: "ana@email.com",
    estado: "aprobada",
  },
]

export async function GET() {
  try {
    // TODO: Fetch from database with JOIN
    // const solicitudes = await query(
    //   `SELECT s.id, s.created_at as fecha, m.nombre as mascota_nombre,
    //           u.nombre_completo as postulante_nombre, u.correo as postulante_correo,
    //           s.estado
    //    FROM solicitudes_adopcion s
    //    JOIN mascotas m ON s.mascota_id = m.id
    //    JOIN usuarios u ON s.usuario_id = u.id
    //    ORDER BY s.created_at DESC`
    // )

    return NextResponse.json({ solicitudes: mockSolicitudes })
  } catch (error) {
    console.error("[v0] Error fetching solicitudes:", error)
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 })
  }
}
