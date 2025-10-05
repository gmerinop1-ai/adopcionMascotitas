import { NextResponse } from "next/server"
import { validateLoginForm } from "@/lib/validations"
import { verifyPassword } from "@/lib/auth"
import { getUserByEmail } from "@/lib/db"
import { supabase } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { correo, password } = body

    // Validate input
    const validationErrors = validateLoginForm({ correo, password })

    if (validationErrors.length > 0) {
      return NextResponse.json({ error: "Datos inválidos", errors: validationErrors }, { status: 400 })
    }

    // Get user from database
    const user = await getUserByEmail(correo)

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      )
    }

    // Check if account is active
    if (user.estado !== "activo") {
      return NextResponse.json(
        { error: "Cuenta inactiva. Contacta al administrador." },
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      )
    }

    // Get role information
    const { data: roleData } = await supabase
      .from('roles')
      .select('nombre')
      .eq('id', user.rol_id)
      .single()

    // Get adoptante information if user is adoptante
    let userData: any = {
      usuario_id: user.usuario_id,
      correo: user.correo,
      rol: roleData?.nombre || 'adoptante'
    }

    if (roleData?.nombre === 'adoptante') {
      const { data: adoptanteData } = await supabase
        .from('adoptante')
        .select('nombres, apellidos, nro_dni')
        .eq('usuario_id', user.usuario_id)
        .single()

      if (adoptanteData) {
        userData = {
          ...userData,
          nombres: adoptanteData.nombres,
          apellidos: adoptanteData.apellidos,
          nro_dni: adoptanteData.nro_dni
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Inicio de sesión exitoso",
        user: userData,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[LOGIN] Login error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
