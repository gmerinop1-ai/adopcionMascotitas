import { NextResponse } from "next/server"
import { validateRegistrationForm } from "@/lib/validations"
import { hashPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre_completo, correo, password } = body

    // Validate input
    const validationErrors = validateRegistrationForm({
      nombre_completo,
      correo,
      password,
      confirmar_password: password, // For API, we assume frontend validated this
    })

    if (validationErrors.length > 0) {
      return NextResponse.json({ error: "Datos inválidos", errors: validationErrors }, { status: 400 })
    }

    // TODO: Check if email already exists in database
    // const existingUser = await query("SELECT id FROM usuarios WHERE correo = $1", [correo])
    // if (existingUser.length > 0) {
    //   return NextResponse.json(
    //     { error: "El correo ya está registrado", errors: [{ field: "correo", message: "Este correo ya está en uso" }] },
    //     { status: 400 }
    //   )
    // }

    // Hash password
    const password_hash = await hashPassword(password)

    // TODO: Insert user into database
    // await query(
    //   "INSERT INTO usuarios (nombre_completo, correo, password_hash, rol, estado) VALUES ($1, $2, $3, $4, $5)",
    //   [nombre_completo, correo, password_hash, "usuario", "activo"]
    // )

    // For now, return success (will be implemented when database is connected)
    return NextResponse.json(
      {
        success: true,
        message: "Cuenta creada con éxito",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
