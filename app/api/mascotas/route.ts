import { NextResponse } from "next/server"
import { getMascotasDisponibles } from "@/lib/db"

export async function GET() {
  try {
    const mascotas = await getMascotasDisponibles()
    return NextResponse.json({ mascotas })
  } catch (error) {
    console.error("Error fetching mascotas:", error)
    return NextResponse.json({ error: "Error al obtener mascotas" }, { status: 500 })
  }
}
