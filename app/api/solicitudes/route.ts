import { NextResponse } from "next/server"
import { validateSolicitudForm } from "@/lib/validations" 
import { insertSolicitud } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mascota_id, dni, telefono, distrito, motivacion, disponibilidad_tiempo, condiciones_hogar, user } = body

    console.log("[API] Datos recibidos en solicitud:", { 
      mascota_id, 
      dni, 
      telefono, 
      distrito, 
      user_id: user?.usuario_id,
      adoptante_id: user?.adoptante_id
    })

    // Verificar que el usuario esté autenticado
    if (!user || !user.adoptante_id) {
      console.log("[API] Error: Usuario no autenticado o sin adoptante_id")
      return NextResponse.json({ 
        error: "Usuario no autenticado o sin perfil de adoptante" 
      }, { status: 401 })
    }

    // Verificar que el adoptante existe y pertenece al usuario autenticado
    const { supabase } = await import("@/lib/db")
    const { data: adoptanteData, error: adoptanteError } = await supabase
      .from('adoptante')
      .select('id, usuario_id')
      .eq('id', user.adoptante_id)
      .single()

    if (adoptanteError || !adoptanteData) {
      console.error("[API] Error verificando adoptante:", adoptanteError)
      return NextResponse.json({ 
        error: "Adoptante no válido" 
      }, { status: 403 })
    }

    console.log("[API] Adoptante verificado:", adoptanteData)

    // Verificar que la mascota existe
    const { data: mascotaData, error: mascotaError } = await supabase
      .from('mascota')
      .select('id, nombre, estado')
      .eq('id', mascota_id)
      .single()

    if (mascotaError || !mascotaData) {
      console.error("[API] Error verificando mascota:", mascotaError)
      return NextResponse.json({ 
        error: "Mascota no encontrada" 
      }, { status: 404 })
    }

    if (mascotaData.estado !== 'disponible') {
      return NextResponse.json({ 
        error: "Esta mascota ya no está disponible para adopción" 
      }, { status: 400 })
    }

    console.log("[API] Mascota verificada:", mascotaData)

    const solicitudData = {
      dni,
      telefono, 
      distrito_ciudad: distrito,
      razon: motivacion,
      condicion_hogar: condiciones_hogar,
      adoptante_id: user.adoptante_id,
      mascota_id
    }

    console.log("[API] Datos a insertar en DB:", solicitudData)

    const validationErrors = validateSolicitudForm({
      dni,
      telefono,
      distrito,
      motivacion,
      disponibilidad_tiempo,
      condiciones_hogar,
    })

    if (validationErrors.length > 0) {
      console.log("[API] Errores de validación:", validationErrors)
      return NextResponse.json({ error: "Datos inválidos", errors: validationErrors }, { status: 400 })
    }

    console.log("[API] Validación exitosa, guardando solicitud en base de datos...")

    try {
      // Guardar en la base de datos real
      const nuevaSolicitud = await insertSolicitud(solicitudData)

      console.log("[API] Solicitud creada exitosamente:", {
        id: nuevaSolicitud.id,
        adoptante_id: nuevaSolicitud.adoptante_id,
        mascota_id: nuevaSolicitud.mascota_id,
        estado: nuevaSolicitud.estado
      })

      return NextResponse.json(
        {
          success: true,
          message: "Solicitud registrada con éxito",
          solicitud: nuevaSolicitud
        },
        { status: 201 }
      )
    } catch (dbError) {
      console.error("[API] Error específico de base de datos:", dbError)
      
      return NextResponse.json(
        {
          error: "Error al guardar la solicitud",
          message: "No se pudo procesar tu solicitud. Intenta nuevamente en unos momentos.",
          details: dbError instanceof Error ? dbError.message : 'Error desconocido'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[API] Error general:", error)
    
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message: "Ocurrió un error inesperado. Intenta nuevamente.",
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
