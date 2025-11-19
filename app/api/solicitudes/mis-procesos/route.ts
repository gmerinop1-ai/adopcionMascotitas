import { NextResponse } from "next/server"
import { getSolicitudesByAdoptante } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user } = body

    console.log("[API] User data in mis-procesos:", {
      usuario_id: user?.usuario_id,
      adoptante_id: user?.adoptante_id,
      correo: user?.correo
    })

    if (!user || !user.adoptante_id) {
      console.log("[API] Error: Usuario no autenticado o sin adoptante_id")
      return NextResponse.json({ 
        error: "Usuario no autenticado o sin perfil de adoptante" 
      }, { status: 401 })
    }

    console.log("[API] Obteniendo solicitudes desde la base de datos...")
    const solicitudes = await getSolicitudesByAdoptante(user.adoptante_id)
    
    console.log("[API] Solicitudes del usuario desde DB:", {
      total: solicitudes.length,
      solicitudes_ids: solicitudes.map(s => s.id)
    })

    return NextResponse.json({ 
      solicitudes
    })
  } catch (error) {
    console.error("[API] Error fetching solicitudes:", error)
    
    // Manejo específico de errores de RLS
    if (error instanceof Error) {
      if (error.message.includes('Row Level Security') || 
          error.message.includes('permission denied') ||
          error.message.includes('policy')) {
        return NextResponse.json({ 
          error: "Error de permisos. Verifica que tengas acceso a tus solicitudes." 
        }, { status: 403 })
      }
    }
    
    return NextResponse.json({ 
      error: "Error al obtener solicitudes",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}
