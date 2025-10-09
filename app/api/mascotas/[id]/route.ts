import { NextResponse } from "next/server"
import { getMascotaById } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const mascota = await getMascotaById(id)

    if (!mascota) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    // Only return pets that are available or reserved (public access)
    if (!['disponible', 'reservado'].includes(mascota.estado)) {
      return NextResponse.json({ error: "Mascota no disponible" }, { status: 404 })
    }

    return NextResponse.json({ mascota })
  } catch (error) {
    console.error("Error fetching mascota:", error)
    return NextResponse.json({ error: "Error al obtener mascota" }, { status: 500 })
  }
}
