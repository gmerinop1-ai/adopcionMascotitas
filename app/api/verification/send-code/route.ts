import { NextRequest, NextResponse } from "next/server"
import { 
  generateVerificationCode, 
  getCodeExpirationTime, 
  sendVerificationEmail 
} from "@/lib/email"
import { 
  insertVerificationCode, 
  invalidateOldVerificationCodes,
  getUserByEmail 
} from "@/lib/db"
import { validateDNIForRegistration } from "@/lib/dni-validation"
import { validateEmail } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, dni, type } = body

    // Validate input
    if (!email || !type) {
      return NextResponse.json(
        { error: "Email y tipo son requeridos" },
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

    // Additional validations based on type
    if (type === 'email_verification' || type === 'dni_verification') {
      // Check if user already exists for registration
      const existingUser = await getUserByEmail(email)
      if (existingUser) {
        return NextResponse.json(
          { error: "Este email ya está registrado" },
          { status: 400 }
        )
      }

      // Validate DNI if provided and type is dni_verification
      if (type === 'dni_verification') {
        if (!dni) {
          return NextResponse.json(
            { error: "DNI es requerido para verificación" },
            { status: 400 }
          )
        }

        const dniValidation = await validateDNIForRegistration(dni)
        if (!dniValidation.isValid) {
          return NextResponse.json(
            { error: dniValidation.error },
            { status: 400 }
          )
        }

        if (!dniValidation.exists) {
          return NextResponse.json(
            { error: "DNI no encontrado en RENIEC" },
            { status: 400 }
          )
        }
      }
    }

    if (type === 'password_reset') {
      // Check if user exists for password reset
      const existingUser = await getUserByEmail(email)
      if (!existingUser) {
        // For security, we return success even if user doesn't exist
        // but we don't actually send an email
        return NextResponse.json(
          { 
            success: true, 
            message: "Si el email existe en nuestro sistema, recibirás un código de verificación" 
          },
          { status: 200 }
        )
      }
    }

    // Invalidate any existing unused codes for this email and type
    await invalidateOldVerificationCodes(email, type)

    // Generate new verification code
    const code = generateVerificationCode()
    const expiresAt = getCodeExpirationTime()

    // Store verification code in database
    await insertVerificationCode({
      email,
      dni,
      code,
      type: type as 'email_verification' | 'password_reset' | 'dni_verification',
      expires_at: expiresAt
    })

    // Send verification email
    const emailType = (type === 'password_reset') ? 'password_reset' : 'email_verification'
    const emailSent = await sendVerificationEmail(email, code, emailType)

    if (!emailSent) {
      return NextResponse.json(
        { error: "Error enviando el email. Inténtalo de nuevo." },
        { status: 500 }
      )
    }

    // Success response
    const successMessage = type === 'password_reset' 
      ? "Código de recuperación enviado a tu email"
      : "Código de verificación enviado a tu email"

    return NextResponse.json(
      { 
        success: true, 
        message: successMessage,
        expiresIn: "15 minutos"
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("[VERIFICATION] Send code error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}