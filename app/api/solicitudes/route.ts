import { NextResponse } from "next/server"
import { validateSolicitudForm } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mascota_id, dni, telefono, distrito, motivacion, disponibilidad_tiempo, condiciones_hogar } = body

    // Validate input
    const validationErrors = validateSolicitudForm({
      dni,
      telefono,
      distrito,
      motivacion,
      disponibilidad_tiempo,
      condiciones_hogar,
    })

    if (validationErrors.length > 0) {
      return NextResponse.json({ error: "Datos inválidos", errors: validationErrors }, { status: 400 })
    }

    // TODO: Get user ID from session
    // const session = await getSession()
    // if (!session) {
    //   return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    // }

    // TODO: Insert into database
    // const result = await query(
    //   `INSERT INTO solicitudes_adopcion
    //    (usuario_id, mascota_id, dni, telefono, distrito, motivacion, disponibilidad_tiempo, condiciones_hogar, estado)
    //    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    //    RETURNING id`,
    //   [session.user.id, mascota_id, dni, telefono, distrito, motivacion, disponibilidad_tiempo, condiciones_hogar, 'pre_filtro']
    // )

    // TODO: Create history entry
    // await query(
    //   "INSERT INTO historial_solicitudes (solicitud_id, estado_nuevo) VALUES ($1, $2)",
    //   [result[0].id, 'pre_filtro']
    // )

    return NextResponse.json(
      {
        success: true,
        message: "Solicitud registrada con éxito",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error creating solicitud:", error)
    return NextResponse.json({ error: "Error al crear solicitud" }, { status: 500 })
  }
}
