import { NextResponse } from "next/server"
import { getFranjasPublicadasParaUsuario } from "@/lib/db"

export async function GET() {
  try {
    console.log('[API] === INICIO GET franjas-disponibles ===')

    const franjasDisponibles = await getFranjasPublicadasParaUsuario()

    console.log("[API] Franjas disponibles obtenidas desde DB:", franjasDisponibles?.length || 0)

    // Agrupar por fecha para mejor presentación
    const franjasAgrupadas = franjasDisponibles.reduce((acc: any, franja: any) => {
      const fecha = franja.fecha
      if (!acc[fecha]) {
        acc[fecha] = []
      }
      acc[fecha].push(franja)
      return acc
    }, {})

    return NextResponse.json({ 
      franjasDisponibles: franjasDisponibles || [],
      franjasAgrupadas,
      total: franjasDisponibles?.length || 0
    })
  } catch (error) {
    console.error("[API] Error fetching franjas disponibles:", error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json({ 
      error: "Error al obtener franjas disponibles",
      details: errorMessage,
      franjasDisponibles: [],
      franjasAgrupadas: {},
      total: 0
    }, { status: 500 })
  }
}