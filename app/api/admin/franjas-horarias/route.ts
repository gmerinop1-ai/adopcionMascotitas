import { NextResponse } from "next/server"
import { insertFranjaHoraria, getFranjasHorarias, publicarFranjasHorarias } from "@/lib/db"

export async function GET(request: Request) {
  try {
    console.log('[API] === INICIO GET franjas-horarias ===')
    
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado') as 'borrador' | 'publicado' | 'completado' | null

    // TODO: Verificar que el usuario es administrador
    // const session = await getServerSession()
    // if (!session?.user?.role === 'admin') {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    // }

    console.log("[API] Franjas horarias - Request params:", { estado })

    const franjasHorarias = await getFranjasHorarias(estado || undefined)

    console.log("[API] Franjas horarias obtenidas desde DB:", franjasHorarias?.length || 0)

    return NextResponse.json({ 
      franjasHorarias: franjasHorarias || [],
      total: franjasHorarias?.length || 0
    })
  } catch (error) {
    console.error("[API] Error fetching franjas horarias:", error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorDetails = error instanceof Error ? error.stack : 'No hay stack trace disponible'
    
    console.error("[API] Error details:", { errorMessage, errorDetails })
    
    return NextResponse.json({ 
      error: "Error al obtener franjas horarias",
      details: errorMessage,
      franjasHorarias: [],
      total: 0
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log('[API] === INICIO POST franjas-horarias ===')
    
    const body = await request.json()
    const { fecha, hora_inicio, duracion_minutos, cupo_maximo } = body

    console.log("[API] Datos recibidos:", { fecha, hora_inicio, duracion_minutos, cupo_maximo })

    // Validaciones
    if (!fecha || !hora_inicio || !duracion_minutos) {
      return NextResponse.json({ 
        error: "Fecha, hora de inicio y duración son requeridos" 
      }, { status: 400 })
    }

    // Validar que la fecha sea futura
    const fechaFranja = new Date(fecha)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    
    if (fechaFranja < hoy) {
      return NextResponse.json({ 
        error: "La fecha debe ser futura" 
      }, { status: 400 })
    }

    // Validar duración
    if (duracion_minutos < 15 || duracion_minutos > 480) {
      return NextResponse.json({ 
        error: "La duración debe estar entre 15 minutos y 8 horas" 
      }, { status: 400 })
    }

    // Validar cupo
    if (cupo_maximo && (cupo_maximo < 1 || cupo_maximo > 10)) {
      return NextResponse.json({ 
        error: "El cupo debe estar entre 1 y 10" 
      }, { status: 400 })
    }

    // TODO: Verificar que el usuario es administrador
    // const session = await getServerSession()
    // if (!session?.user?.role === 'admin') {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    // }

    const nuevaFranja = await insertFranjaHoraria({
      fecha,
      hora_inicio,
      duracion_minutos: parseInt(duracion_minutos),
      cupo_maximo: parseInt(cupo_maximo) || 1
    })

    console.log("[API] ✅ Franja horaria creada:", nuevaFranja)

    return NextResponse.json({ 
      success: true, 
      message: "Franja horaria creada correctamente",
      franja: nuevaFranja
    })
  } catch (error) {
    console.error("[API] Error creating franja horaria:", error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error("[API] Error details:", errorMessage)
    
    return NextResponse.json({ 
      error: "Error al crear franja horaria",
      details: errorMessage
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    console.log('[API] === INICIO PUT franjas-horarias (publicar) ===')
    
    const body = await request.json()
    const { ids } = body

    console.log("[API] IDs a publicar:", ids)

    // Validaciones
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ 
        error: "Se requiere un array de IDs para publicar" 
      }, { status: 400 })
    }

    // TODO: Verificar que el usuario es administrador
    // const session = await getServerSession()
    // if (!session?.user?.role === 'admin') {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    // }

    const franjasPublicadas = await publicarFranjasHorarias(ids)

    console.log("[API] ✅ Franjas horarias publicadas:", franjasPublicadas.length)

    return NextResponse.json({ 
      success: true, 
      message: `${franjasPublicadas.length} franjas horarias publicadas correctamente`,
      franjas: franjasPublicadas
    })
  } catch (error) {
    console.error("[API] Error publishing franjas horarias:", error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error("[API] Error details:", errorMessage)
    
    return NextResponse.json({ 
      error: "Error al publicar franjas horarias",
      details: errorMessage
    }, { status: 500 })
  }
}