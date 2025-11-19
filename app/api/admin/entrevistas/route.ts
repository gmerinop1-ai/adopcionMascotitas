import { NextResponse } from "next/server"
import { getEntrevistasProgramadas } from "@/lib/db"

export async function GET(request: Request) {
  try {
    console.log('[API] === INICIO GET entrevistas ===')
    
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    // TODO: Verificar que el usuario es administrador
    // const session = await getServerSession()
    // if (!session?.user?.role === 'admin') {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    // }

    console.log("[API] Entrevistas - Request params:", { startDate, endDate })

    // Obtener entrevistas desde la base de datos real
    const entrevistas = await getEntrevistasProgramadas(startDate || undefined, endDate || undefined)

    console.log("[API] Entrevistas - Entrevistas obtenidas desde DB:", entrevistas?.length || 0)

    return NextResponse.json({ 
      entrevistas: entrevistas || [],
      total: entrevistas?.length || 0
    })
  } catch (error) {
    console.error("[API] Error fetching entrevistas:", error)
    
    // Retornar más información sobre el error para debugging
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorDetails = error instanceof Error ? error.stack : 'No hay stack trace disponible'
    
    console.error("[API] Error details:", { errorMessage, errorDetails })
    
    return NextResponse.json({ 
      error: "Error al obtener entrevistas",
      details: errorMessage,
      entrevistas: [], // Siempre retornar un array vacío como fallback
      total: 0
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { solicitud_id, fecha_entrevista, observaciones } = body

    // Validaciones
    if (!solicitud_id || !fecha_entrevista) {
      return NextResponse.json({ 
        error: "Solicitud ID y fecha de entrevista son requeridos" 
      }, { status: 400 })
    }

    const fechaEntrevista = new Date(fecha_entrevista)
    if (fechaEntrevista <= new Date()) {
      return NextResponse.json({ 
        error: "La fecha de entrevista debe ser futura" 
      }, { status: 400 })
    }

    // TODO: Verificar que el usuario es administrador
    // const session = await getServerSession()
    // if (!session?.user?.role === 'admin') {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    // }

    // Actualizar la solicitud para programar entrevista
    const { updateSolicitud } = await import("@/lib/db")
    const updatedSolicitud = await updateSolicitud(solicitud_id, {
      estado: 'entrevista',
      fecha_entrevista: fecha_entrevista
    })

    console.log("[DEBUG] Entrevista programada:", updatedSolicitud)

    return NextResponse.json({ 
      success: true, 
      message: "Entrevista programada correctamente",
      data: { solicitud_id, fecha_entrevista, observaciones }
    })
  } catch (error) {
    console.error("[v0] Error scheduling entrevista:", error)
    return NextResponse.json({ error: "Error al programar entrevista" }, { status: 500 })
  }
}