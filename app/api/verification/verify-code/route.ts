import { NextRequest, NextResponse } from "next/server"
import { 
  getValidVerificationCode,
  markVerificationCodeAsUsed,
  getUserByEmail,
  updateUserPassword
} from "@/lib/db"
import { validateEmail } from "@/lib/auth"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code, type, newPassword } = body

    // Validate input
    if (!email || !code || !type) {
      return NextResponse.json(
        { error: "Email, código y tipo son requeridos" },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['email_verification', 'password_reset', 'dni_verification']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Tipo de verificación inválido" },
        { status: 400 }
      )
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "El código debe tener 6 dígitos" },
        { status: 400 }
      )
    }

    // Get and validate verification code from database
    const verificationCode = await getValidVerificationCode(email, code, type)
    
    if (!verificationCode) {
      return NextResponse.json(
        { error: "Código inválido o expirado" },
        { status: 400 }
      )
    }

    // Mark code as used
    await markVerificationCodeAsUsed(verificationCode.id)

    // Handle password reset specifically
    if (type === 'password_reset') {
      if (!newPassword) {
        return NextResponse.json(
          { error: "Nueva contraseña es requerida para recuperación" },
          { status: 400 }
        )
      }

      // Validate password
      if (newPassword.length < 8 || newPassword.length > 12) {
        return NextResponse.json(
          { error: "La contraseña debe tener entre 8 y 12 caracteres" },
          { status: 400 }
        )
      }

      // Get user
      const user = await getUserByEmail(email)
      if (!user) {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        )
      }

      // Hash new password and update
      const hashedPassword = await hashPassword(newPassword)
      await updateUserPassword(user.usuario_id, hashedPassword)

      return NextResponse.json(
        { 
          success: true, 
          message: "Contraseña actualizada exitosamente",
          action: "password_updated"
        },
        { status: 200 }
      )
    }

    // For other types (email_verification, dni_verification)
    let successMessage = "Código verificado exitosamente"
    let action = "verified"

    if (type === 'email_verification') {
      successMessage = "Email verificado. Ahora puedes completar tu registro"
      action = "email_verified"
    } else if (type === 'dni_verification') {
      successMessage = "DNI verificado exitosamente"
      action = "dni_verified"
    }

    return NextResponse.json(
      { 
        success: true, 
        message: successMessage,
        action,
        verificationData: {
          email: verificationCode.email,
          dni: verificationCode.dni,
          verified_at: new Date().toISOString()
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("[VERIFICATION] Verify code error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}