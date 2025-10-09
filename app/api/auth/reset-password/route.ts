import { supabase } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token y nueva contraseña son requeridos" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
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
        { error: "Token inválido o expirado" },
        { status: 400 }
      )
    }

    // Verificar si el token ha expirado
    const now = new Date()
    const expiryDate = new Date(usuario.reset_token_expires)

    if (now > expiryDate) {
      return NextResponse.json(
        { error: "Token expirado. Solicita un nuevo enlace de recuperación" },
        { status: 400 }
      )
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Actualizar la contraseña y limpiar el token
    const { error: updateError } = await supabase
      .from("usuario")
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      })
      .eq("usuario_id", usuario.usuario_id)

    if (updateError) {
      console.error("Error al actualizar contraseña:", updateError)
      throw new Error("Error al actualizar la contraseña")
    }

    return NextResponse.json({ 
      success: true,
      message: "Contraseña restablecida exitosamente"
    })

  } catch (error) {
    console.error("Error al restablecer contraseña:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}