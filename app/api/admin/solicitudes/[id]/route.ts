import { NextResponse } from "next/server"
import { isValidTransition, getTransitionError, type EstadoSolicitud } from "@/lib/estado-validations"

const mockSolicitud = {
  id: 1,
  usuario_id: 1,
  mascota_id: 1,
  mascota_nombre: "Luna",
  mascota_foto: "/friendly-labrador-dog.jpg",
  postulante_nombre: "Juan Pérez",
  postulante_correo: "juan@email.com",
  dni: "12345678",
  telefono: "987654321",
  distrito: "Lima, San Isidro",
  motivacion:
    "Siempre he querido tener un perro y Luna parece perfecta para mi familia. Tenemos experiencia con mascotas y queremos darle un hogar lleno de amor.",
  disponibilidad_tiempo:
    "Trabajo desde casa 3 días a la semana, por lo que puedo dedicarle mucho tiempo. Los fines de semana siempre estoy disponible para paseos y actividades.",
  condiciones_hogar:
    "Vivo en una casa con jardín amplio. Tengo espacio suficiente para que Luna pueda correr y jugar. No tengo otras mascotas actualmente.",
  estado: "entrevista",
  observaciones_internas: "Candidato prometedor, tiene experiencia previa con perros grandes.",
  created_at: "2024-01-15T10:30:00",
  updated_at: "2024-01-20T15:45:00",
}

const mockHistorial = [
  {
    id: 1,
    solicitud_id: 1,
    estado_anterior: undefined,
    estado_nuevo: "pre_filtro",
    admin_nombre: undefined,
    notas: "Solicitud creada",
    created_at: "2024-01-15T10:30:00",
  },
  {
    id: 2,
    solicitud_id: 1,
    estado_anterior: "pre_filtro",
    estado_nuevo: "entrevista",
    admin_nombre: "Admin Usuario",
    notas: "Candidato prometedor, tiene experiencia previa con perros grandes.",
    created_at: "2024-01-20T15:45:00",
  },
]

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // TODO: Fetch from database with JOINs
    // const solicitudes = await query(
    //   `SELECT s.*, m.nombre as mascota_nombre, m.foto_url as mascota_foto,
    //           u.nombre_completo as postulante_nombre, u.correo as postulante_correo
    //    FROM solicitudes_adopcion s
    //    JOIN mascotas m ON s.mascota_id = m.id
    //    JOIN usuarios u ON s.usuario_id = u.id
    //    WHERE s.id = $1`,
    //   [id]
    // )

    // TODO: Fetch historial
    // const historial = await query(
    //   `SELECT h.*, u.nombre_completo as admin_nombre
    //    FROM historial_solicitudes h
    //    LEFT JOIN usuarios u ON h.admin_id = u.id
    //    WHERE h.solicitud_id = $1
    //    ORDER BY h.created_at ASC`,
    //   [id]
    // )

    return NextResponse.json({
      solicitud: mockSolicitud,
      historial: mockHistorial,
    })
  } catch (error) {
    console.error("[v0] Error fetching solicitud:", error)
    return NextResponse.json({ error: "Error al obtener solicitud" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { estado, observaciones_internas } = body

    // TODO: Get current solicitud estado from database
    // const solicitudes = await query("SELECT estado FROM solicitudes_adopcion WHERE id = $1", [id])
    // const currentEstado = solicitudes[0].estado

    // Mock current estado for validation
    const currentEstado: EstadoSolicitud = "entrevista"

    if (!isValidTransition(currentEstado, estado)) {
      return NextResponse.json({ error: getTransitionError(currentEstado, estado) }, { status: 400 })
    }

    // TODO: Update in database
    // await query(
    //   "UPDATE solicitudes_adopcion SET estado = $1, observaciones_internas = $2, updated_at = NOW() WHERE id = $3",
    //   [estado, observaciones_internas, id]
    // )

    // TODO: Create history entry
    // await query(
    //   "INSERT INTO historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, admin_id, notas) VALUES ($1, $2, $3, $4, $5)",
    //   [id, currentEstado, estado, adminId, observaciones_internas]
    // )

    // TODO: Send notification to user about status change
    // await sendStatusChangeNotification(userId, estado)

    return NextResponse.json({ success: true, message: "Estado actualizado correctamente" })
  } catch (error) {
    console.error("[v0] Error updating solicitud:", error)
    return NextResponse.json({ error: "Error al actualizar solicitud" }, { status: 500 })
  }
}
