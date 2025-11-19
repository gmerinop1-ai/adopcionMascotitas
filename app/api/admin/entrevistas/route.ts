import { NextResponse } from "next/server"
import { getEntrevistasProgramadas } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    // TODO: Verificar que el usuario es administrador
    // const session = await getServerSession()
    // if (!session?.user?.role === 'admin') {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    // }

    console.log("[DEBUG] API Entrevistas - Request params:", { startDate, endDate })

    // Obtener entrevistas desde la base de datos real
    const entrevistas = await getEntrevistasProgramadas(startDate || undefined, endDate || undefined)

    console.log("[DEBUG] API Entrevistas - Entrevistas obtenidas desde DB:", entrevistas)

    return NextResponse.json({ 
      entrevistas,
      total: entrevistas.length 
    })
  } catch (error) {
    console.error("[v0] Error fetching entrevistas:", error)
    return NextResponse.json({ error: "Error al obtener entrevistas" }, { status: 500 })
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