import { NextResponse } from "next/server"
import { validateLoginForm } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { correo, password } = body

    // Validate input
    const validationErrors = validateLoginForm({ correo, password })

    if (validationErrors.length > 0) {
      return NextResponse.json({ error: "Datos inválidos", errors: validationErrors }, { status: 400 })
    }

    // TODO: Get user from database
    // const users = await query<Usuario>(
    //   "SELECT * FROM usuarios WHERE correo = $1",
    //   [correo]
    // )

    // if (users.length === 0) {
    //   return NextResponse.json(
    //     { error: "Credenciales incorrectas" },
    //     { status: 401 }
    //   )
    // }

    // const user = users[0]

    // // Check if account is active
    // if (user.estado !== "activo") {
    //   return NextResponse.json(
    //     { error: "Cuenta inactiva. Contacta al administrador." },
    //     { status: 403 }
    //   )
    // }

    // // Verify password
    // const isValidPassword = await verifyPassword(password, user.password_hash)

    // if (!isValidPassword) {
    //   return NextResponse.json(
    //     { error: "Credenciales incorrectas" },
    //     { status: 401 }
    //   )
    // }

    // For now, return mock success (will be implemented when database is connected)
    // Mock user for testing
    const mockUser = {
      id: 1,
      nombre_completo: "Usuario Demo",
      correo: correo,
      rol: correo.includes("admin") ? "administrador" : "usuario",
    }

    return NextResponse.json(
      {
        success: true,
        message: "Inicio de sesión exitoso",
        user: mockUser,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
