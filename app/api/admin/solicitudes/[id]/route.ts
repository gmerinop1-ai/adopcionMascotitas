import { NextResponse } from "next/server"
import { getSolicitudById, updateSolicitudEstado } from "@/lib/db"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const { id } = params

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
        estado_anterior: "pendiente" as any,
        estado_nuevo: "entrevista",
        admin_nombre: "Administrador" as any,
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

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    console.log("[API] === INICIO PUT solicitud ===")
    
    const params = await context.params
    const { id } = params
    
    if (!id) {
      console.error("[API] No se proporcionó ID de solicitud")
      return NextResponse.json({ error: "ID de solicitud requerido" }, { status: 400 })
    }
    
    console.log("[API] ID de solicitud:", id)
    
    const body = await request.json()
    const { estado, fecha_entrevista, observaciones } = body

    console.log("[API] Actualizando solicitud:", { id, estado, fecha_entrevista, observaciones })

    // Validaciones básicas
    if (estado && !['pendiente', 'entrevista', 'aprobada', 'rechazada', 'cancelada'].includes(estado)) {
      console.log("[API] Estado inválido:", estado)
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    if (!estado) {
      console.log("[API] Estado es requerido")
      return NextResponse.json({ error: "Estado es requerido" }, { status: 400 })
    }

    if (estado === 'entrevista' && !fecha_entrevista) {
      console.log("[API] Fecha de entrevista requerida para estado entrevista")
      return NextResponse.json({ error: "Fecha de entrevista requerida para programar entrevista" }, { status: 400 })
    }

    // Validar formato de fecha
    if (fecha_entrevista) {
      const fechaEntrevista = new Date(fecha_entrevista)
      if (isNaN(fechaEntrevista.getTime())) {
        console.log("[API] Formato de fecha inválido:", fecha_entrevista)
        return NextResponse.json({ error: "Formato de fecha inválido" }, { status: 400 })
      }
      if (fechaEntrevista <= new Date()) {
        console.log("[API] Fecha debe ser futura:", fecha_entrevista)
        return NextResponse.json({ error: "La fecha de entrevista debe ser futura" }, { status: 400 })
      }
    }

    // Verificar que la solicitud existe
    console.log("[API] Verificando que la solicitud existe...")
    const existingSolicitud = await getSolicitudById(id)
    if (!existingSolicitud) {
      console.log("[API] Solicitud no encontrada:", id)
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    console.log("[API] Solicitud encontrada:", existingSolicitud.id)

    // Actualizar la solicitud en la base de datos
    console.log("[API] Actualizando solicitud en base de datos...")
    const resultado = await updateSolicitudEstado(id, estado, fecha_entrevista)

    console.log("[API] ✅ Solicitud actualizada:", resultado)

    return NextResponse.json({ 
      success: true, 
      message: "Solicitud actualizada correctamente",
      data: resultado
    })
  } catch (error) {
    console.error("[API] Error updating solicitud:", error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorDetails = error instanceof Error ? error.stack : 'No hay stack trace disponible'
    
    console.error("[API] Error details:", { errorMessage, errorDetails })
    
    return NextResponse.json({ 
      error: "Error al actualizar solicitud",
      details: errorMessage,
      message: errorMessage
    }, { status: 500 })
  }
}