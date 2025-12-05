import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { 
  generateVerificationCode, 
  getCodeExpirationTime, 
  sendVerificationEmail 
} from "@/lib/email"
import { 
  insertVerificationCode, 
  invalidateOldVerificationCodes 
} from "@/lib/db"
import { validateEmail } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
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

    // Check if user exists
    const existingUser = await getUserByEmail(email)
    
    // For security, we always return success message even if user doesn't exist
    // This prevents email enumeration attacks
    if (!existingUser) {
      console.log(`[PASSWORD_RESET] Email no encontrado: ${email}`)
      return NextResponse.json(
        { 
          success: true, 
          message: "Si tu email está registrado, recibirás un código para restablecer tu contraseña" 
        },
        { status: 200 }
      )
    }

    // Check if account is active
    if (existingUser.estado !== 'activo') {
      console.log(`[PASSWORD_RESET] Cuenta inactiva para: ${email}`)
      return NextResponse.json(
        { 
          success: true, 
          message: "Si tu email está registrado, recibirás un código para restablecer tu contraseña" 
        },
        { status: 200 }
      )
    }

    // Invalidate any existing unused password reset codes for this email
    await invalidateOldVerificationCodes(email, 'password_reset')

    // Generate new verification code
    const code = generateVerificationCode()
    const expiresAt = getCodeExpirationTime()

    // Store verification code in database
    await insertVerificationCode({
      email,
      code,
      type: 'password_reset',
      expires_at: expiresAt
    })

    // Send password reset email
    const emailSent = await sendVerificationEmail(email, code, 'password_reset')

    if (!emailSent) {
      console.error(`[PASSWORD_RESET] Error enviando email a: ${email}`)
      return NextResponse.json(
        { error: "Error enviando el email. Inténtalo de nuevo." },
        { status: 500 }
      )
    }

    console.log(`[PASSWORD_RESET] ✅ Código enviado exitosamente a: ${email}`)

    return NextResponse.json(
      { 
        success: true, 
        message: "Si tu email está registrado, recibirás un código para restablecer tu contraseña",
        expiresIn: "15 minutos"
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("[PASSWORD_RESET] Error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}