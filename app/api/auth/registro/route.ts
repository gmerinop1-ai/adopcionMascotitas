import { NextResponse } from "next/server"
import { validateRegistrationForm } from "@/lib/validations"
import { hashPassword } from "@/lib/auth"
import { 
  insertUsuario, 
  insertAdoptante, 
  getUserByEmail, 
  getRoleByName, 
  getAdoptanteByDNI 
} from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombres, apellidos, nro_dni, correo, password } = body

    // Validate input
    const validationErrors = validateRegistrationForm({
      nombres,
      apellidos,
      nro_dni,
      correo,
      password,
      confirmar_password: password, // For API, we assume frontend validated this
    })

    if (validationErrors.length > 0) {
      return NextResponse.json({ error: "Datos inválidos", errors: validationErrors }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(correo)
    if (existingUser) {
      return NextResponse.json(
        { 
          error: "El correo ya está registrado", 
          errors: [{ field: "correo", message: "Este correo ya está en uso" }] 
        },
        { status: 400 }
      )
    }

    // Check if DNI already exists
    const existingAdoptante = await getAdoptanteByDNI(nro_dni)
    if (existingAdoptante) {
      return NextResponse.json(
        { 
          error: "El DNI ya está registrado", 
          errors: [{ field: "nro_dni", message: "Este DNI ya está registrado" }] 
        },
        { status: 400 }
      )
    }

    // Get the "adoptante" role
    const adoptanteRole = await getRoleByName("adoptante")
    if (!adoptanteRole) {
      return NextResponse.json({ error: "Error de configuración del sistema" }, { status: 500 })
    }

    // Hash password
    const password_hash = await hashPassword(password)

    // Create user in database
    const newUser = await insertUsuario({
      correo,
      password: password_hash,
      rol_id: adoptanteRole.id
    })

    // Create adoptante record
    await insertAdoptante({
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      nro_dni: nro_dni.trim(),
      usuario_id: newUser.usuario_id
    })

    return NextResponse.json(
      {
        success: true,
        message: "Cuenta creada con éxito",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[REGISTRO] Registration error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
