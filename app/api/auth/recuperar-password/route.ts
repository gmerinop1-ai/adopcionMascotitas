import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const { correo } = await request.json();

    // 1. Simular Validación y Búsqueda de Usuario (Mock)
    if (!correo) {
        return NextResponse.json({ error: "El correo es obligatorio" }, { status: 400 });
    }
    
    // ** En una implementación real, aquí se buscaría al usuario en la BD,
    // ** se generaría un token de recuperación y se almacenaría.
    console.log(`Simulando solicitud de recuperación para: ${correo}`);

    // 2. Generar un enlace de recuperación Mock
    // En la vida real, 'token' sería un hash seguro
    const recoveryToken = "simulated_secure_token_12345"; 
    const recoveryLink = `http://localhost:3000/restablecer-password?token=${recoveryToken}`;
    const userName = "Usuario de Adopciones"; // Mock user name

    // 3. Crear el Contenido del Correo
    const subject = "Recuperación de Contraseña para Adopta una Mascota";
    const htmlBody = `
      <html>
        <body>
          <h2>Hola ${userName},</h2>
          <p>Has solicitado restablecer la contraseña para tu cuenta en Adopta una Mascota.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <p><a href="${recoveryLink}" style="background-color: #556B2F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a></p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p>Gracias,<br>El equipo de Adopta una Mascota</p>
        </body>
      </html>
    `;

    // 4. Enviar el Correo (Usando Nodemailer)
    const success = await sendMail({
        to: correo,
        subject: subject,
        html: htmlBody,
    });

    if (!success) {
         // Si Nodemailer falla, notificamos un error interno
        return NextResponse.json({ error: "Error interno al enviar el correo. Revisa la configuración del servidor de email." }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        message: "Si la cuenta existe, recibirás un correo con el enlace de recuperación." 
    }, { status: 200 });
  } catch (error) {
    console.error("[v0] Recovery password error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}