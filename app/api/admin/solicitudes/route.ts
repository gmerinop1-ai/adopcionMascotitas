import { NextResponse } from "next/server"
import { getAllSolicitudesAdmin } from "@/lib/db"

export async function GET() {
  try {
    // TODO: Verificar que el usuario es administrador
    // const session = await getServerSession()
    // if (!session?.user?.role === 'admin') {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    // }

    console.log("[DEBUG] Obteniendo solicitudes desde la base de datos real...")

    // Obtener todas las solicitudes desde la base de datos real
    const solicitudes = await getAllSolicitudesAdmin()

    console.log("[DEBUG] Solicitudes obtenidas desde DB:", solicitudes.length)

    return NextResponse.json({ 
      solicitudes,
      total: solicitudes.length 
    })
  } catch (error) {
    console.error("[v0] Error fetching admin solicitudes:", error)
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 })
  }
}
