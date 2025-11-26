import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[API] === INICIO POST seleccionar-horario ===')
    
    const params = await context.params
    const { id: solicitudId } = params
    const body = await request.json()
    const { franja_horaria_id } = body

    console.log("[API] Datos recibidos:", { solicitudId, franja_horaria_id })

    // Validaciones básicas
    if (!solicitudId || !franja_horaria_id) {
      return NextResponse.json({ 
        error: "Solicitud ID y franja horaria son requeridos" 
      }, { status: 400 })
    }

    // TODO: Verificar autenticación del usuario
    // TODO: Verificar que la solicitud pertenece al usuario autenticado

    const { supabase, reservarFranjaHoraria, updateSolicitud } = await import("@/lib/db")

    // Verificar que la solicitud existe y está en estado 'entrevista' sin fecha
    const { data: solicitud, error: solicitudError } = await supabase
      .from('solicitud')
      .select('*')
      .eq('id', solicitudId)
      .eq('estado', 'entrevista')
      .single()

    if (solicitudError || !solicitud) {
      console.error("[API] Error verificando solicitud:", solicitudError)
      return NextResponse.json({ 
        error: "Solicitud no válida o ya tiene horario asignado" 
      }, { status: 400 })
    }

    if (solicitud.fecha_entrevista) {
      return NextResponse.json({ 
        error: "Esta solicitud ya tiene un horario confirmado" 
      }, { status: 400 })
    }

    console.log("[API] Solicitud verificada:", solicitud)

    // Verificar que la franja horaria está disponible
    const { data: franja, error: franjaError } = await supabase
      .from('franja_horaria')
      .select('*')
      .eq('id', franja_horaria_id)
      .eq('estado', 'publicado')
      .gt('cupo_disponible', 0)
      .single()

    if (franjaError || !franja) {
      console.error("[API] Error verificando franja:", franjaError)
      return NextResponse.json({ 
        error: "El horario seleccionado ya no está disponible" 
      }, { status: 400 })
    }

    console.log("[API] Franja horaria verificada:", franja)

    // Reservar la franja horaria
    console.log("[API] Reservando franja horaria...")
    const reservaInfo = await reservarFranjaHoraria(franja_horaria_id, solicitudId)

    console.log("[API] Franja reservada exitosamente:", reservaInfo)

    // Actualizar la solicitud con la fecha de entrevista
    await updateSolicitud(solicitudId, {
      estado: 'entrevista',
      fecha_entrevista: reservaInfo.fechaEntrevista
    })

    console.log("[API] ✅ Horario confirmado exitosamente")

    return NextResponse.json({
      success: true,
      message: "Horario confirmado exitosamente",
      entrevista: {
        fecha: reservaInfo.fechaEntrevista,
        franja_id: franja_horaria_id
      }
    })

  } catch (error) {
    console.error("[API] Error en seleccionar-horario:", error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error("[API] Error details:", errorMessage)
    
    return NextResponse.json({ 
      error: "Error al confirmar horario",
      details: errorMessage
    }, { status: 500 })
  }
}