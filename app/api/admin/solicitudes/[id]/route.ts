import { NextResponse } from "next/server"
import { getSolicitudById, updateSolicitudEstado } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Obtener solicitud desde la base de datos real
    const solicitud = await getSolicitudById(id)
    
    if (!solicitud) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    // Mock historial - en producción vendría de una tabla de historial
    const mockHistorial = [
      {
        id: 1,
        solicitud_id: id,
        estado_anterior: null,
        estado_nuevo: "pendiente",
        admin_nombre: null,
        notas: "Solicitud creada",
        created_at: solicitud.created_at,
      }
    ]

    // Si tiene entrevista programada, agregar al historial
    if (solicitud.estado === "entrevista" && solicitud.fecha_entrevista) {
      mockHistorial.push({
        id: 2,
        solicitud_id: id,
        estado_anterior: "pendiente",
        estado_nuevo: "entrevista",
        admin_nombre: "Administrador",
        notas: "Entrevista programada",
        created_at: solicitud.updated_at,
      })
    }

    return NextResponse.json({
      solicitud,
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
    const { estado, fecha_entrevista, observaciones } = body

    console.log("[DEBUG] Actualizando solicitud:", { id, estado, fecha_entrevista, observaciones })

    // Validaciones básicas
    if (estado && !['pendiente', 'entrevista', 'aprobado', 'rechazado', 'cancelado'].includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    if (!estado) {
      return NextResponse.json({ error: "Estado es requerido" }, { status: 400 })
    }

    if (estado === 'entrevista' && !fecha_entrevista) {
      return NextResponse.json({ error: "Fecha de entrevista requerida" }, { status: 400 })
    }

    // Verificar que la solicitud existe
    const existingSolicitud = await getSolicitudById(id)
    if (!existingSolicitud) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    // Actualizar la solicitud en la base de datos
    const resultado = await updateSolicitudEstado(id, estado, fecha_entrevista)

    console.log("[DEBUG] Solicitud actualizada:", resultado)

    return NextResponse.json({ 
      success: true, 
      message: "Solicitud actualizada correctamente",
      data: resultado
    })
  } catch (error) {
    console.error("[v0] Error updating solicitud:", error)
    return NextResponse.json({ error: "Error al actualizar solicitud" }, { status: 500 })
  }
}