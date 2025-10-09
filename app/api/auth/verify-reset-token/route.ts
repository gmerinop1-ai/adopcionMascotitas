import { supabase } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: "Token es requerido" },
        { status: 400 }
      )
    }

    // Verificar si el token existe y no ha expirado
    const { data: usuario, error } = await supabase
      .from("usuario")
      .select("usuario_id, reset_token_expires")
      .eq("reset_token", token)
      .single()

    if (error || !usuario) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 400 }
      )
    }

    // Verificar si el token ha expirado
    const now = new Date()
    const expiryDate = new Date(usuario.reset_token_expires)

    if (now > expiryDate) {
      return NextResponse.json(
        { error: "Token expirado" },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true })

  } catch (error) {
    console.error("Error verificando token:", error)
    return NextResponse.json(
      { error: "Error al verificar el token" },
      { status: 500 }
    )
  }
}