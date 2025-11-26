import { NextResponse } from "next/server"
import { deleteFranjaHoraria } from "@/lib/db"

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[API] === INICIO DELETE franja-horaria ===')
    
    const params = await context.params
    const { id } = params

    console.log("[API] ID franja a eliminar:", id)

    // Validaciones
    if (!id) {
      return NextResponse.json({ 
        error: "ID de franja horaria es requerido" 
      }, { status: 400 })
    }

    // TODO: Verificar que el usuario es administrador
    // const session = await getServerSession()
    // if (!session?.user?.role === 'admin') {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    // }

    await deleteFranjaHoraria(id)

    console.log("[API] ✅ Franja horaria eliminada exitosamente")

    return NextResponse.json({ 
      success: true, 
      message: "Franja horaria eliminada correctamente"
    })
  } catch (error) {
    console.error("[API] Error deleting franja horaria:", error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error("[API] Error details:", errorMessage)
    
    return NextResponse.json({ 
      error: "Error al eliminar franja horaria",
      details: errorMessage
    }, { status: 500 })
  }
}