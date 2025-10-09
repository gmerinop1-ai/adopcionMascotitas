import { supabase } from "@/lib/db"
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { randomBytes } from "crypto"

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false, // true para puerto 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
})

export async function POST(req: Request) {
  console.log("🔍 Iniciando proceso de recuperación de contraseña")
  
  try {
    const { email } = await req.json()
    console.log("📧 Email recibido:", email)

    if (!email) {
      console.log("❌ Email vacío")
      return NextResponse.json(
        { error: "El correo electrónico es requerido" },
        { status: 400 }
      )
    }

    // Verificar variables de entorno
    console.log("🔧 Verificando configuración SMTP...")
    console.log("HOST:", !!process.env.EMAIL_SERVER_HOST)
    console.log("PORT:", !!process.env.EMAIL_SERVER_PORT)
    console.log("USER:", !!process.env.EMAIL_SERVER_USER)
    console.log("PASS:", !!process.env.EMAIL_SERVER_PASSWORD)

    // Crear cliente de Supabase
    console.log("🗃️ Cliente Supabase disponible")

    // Verificar si el usuario existe
    console.log("👤 Buscando usuario...")
    const { data: usuario, error: userError } = await supabase
      .from("usuario")
      .select("usuario_id, correo")
      .eq("correo", email)
      .single()

    if (userError) {
      console.log("❌ Error al buscar usuario:", userError)
    }
    
    if (!usuario) {
      console.log("👤 Usuario no encontrado:", email)
      // Por seguridad, no revelamos si el usuario existe o no
      return NextResponse.json({ 
        message: "Si existe una cuenta con este correo, recibirás un enlace de recuperación" 
      })
    }

    console.log("✅ Usuario encontrado:", usuario.correo)

    // Generar token único
    const resetToken = randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora de validez
    console.log("🔑 Token generado:", resetToken.substring(0, 8) + "...")

    // Guardar el token en la base de datos
    console.log("💾 Guardando token en la base de datos...")
    const { error: updateError } = await supabase
      .from("usuario")
      .update({
        reset_token: resetToken,
        reset_token_expires: resetTokenExpiry.toISOString(),
      })
      .eq("usuario_id", usuario.usuario_id)

    if (updateError) {
      console.error("❌ Error al actualizar usuario:", updateError)
      throw new Error("Error al guardar token de recuperación")
    }

    console.log("✅ Token guardado exitosamente")

    // Construir el enlace de recuperación
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    console.log("🔗 Enlace de recuperación:", resetLink)

    // Verificar la conexión del transportador
    console.log("📡 Verificando conexión SMTP...")
    await transporter.verify()
    console.log("✅ Servidor SMTP verificado correctamente")

    // Enviar el correo
    console.log("📤 Enviando correo...")
    const mailOptions = {
      from: process.env.EMAIL_SERVER_USER, // Usar el mismo email de autenticación
      to: email,
      subject: "Recuperación de Contraseña - Catálogo de Mascotas",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #be123c;">Recuperación de Contraseña</h1>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display:inline-block;padding:12px 20px;background-color:#be123c;color:white;text-decoration:none;border-radius:5px;">
              Restablecer Contraseña
            </a>
          </div>
          <p><strong>Este enlace expirará en 1 hora.</strong></p>
          <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #666;">${resetLink}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">
            Este correo fue enviado desde el sistema de Catálogo de Mascotas.
          </p>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("✅ Correo enviado exitosamente:", info.messageId)

    return NextResponse.json({ 
      message: "Si existe una cuenta con este correo, recibirás un enlace de recuperación",
      success: true 
    })

  } catch (error) {
    console.error("❌ Error detallado al procesar la recuperación de contraseña:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud. Intenta de nuevo más tarde." },
      { status: 500 }
    )
  }
}