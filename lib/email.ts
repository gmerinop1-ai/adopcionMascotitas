// Email service for sending verification codes and password reset emails
// Note: Requires 'npm install nodemailer @types/nodemailer'

let nodemailer: any
try {
  nodemailer = require('nodemailer')
} catch (error) {
  console.warn('[EMAIL] nodemailer not installed. Email functionality will be simulated.')
  nodemailer = null
}

// Email configuration using Gmail SMTP or any other provider
let transporter: any = null

if (nodemailer) {
  try {
    transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'adopcionmascotas@gmail.com', // Fallback for testing
        pass: process.env.EMAIL_PASSWORD || 'your-app-password' // App password from Gmail
      },
      // Alternative configuration for other SMTP providers
      // host: process.env.SMTP_HOST || 'smtp.gmail.com',
      // port: Number(process.env.SMTP_PORT) || 587,
      // secure: false,
    })
  } catch (error) {
    console.error('[EMAIL] Error creating transporter:', error)
    transporter = null
  }
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log(`[EMAIL] Enviando email a: ${options.to}`)
    
    // For development/testing or when nodemailer is not available, log the email instead
    if (!nodemailer || !transporter || (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER)) {
      console.log('[EMAIL] Modo desarrollo/simulado - Email simulado:')
      console.log('Para:', options.to)
      console.log('Asunto:', options.subject)
      console.log('Contenido HTML:', options.html)
      console.log('---')
      return true
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Adopción Mascotas" <adopcionmascotas@gmail.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`[EMAIL] ✅ Email enviado exitosamente. ID: ${result.messageId}`)
    return true
    
  } catch (error) {
    console.error('[EMAIL] ❌ Error enviando email:', error)
    // In development mode or when nodemailer is not available, still return true
    if (!nodemailer || process.env.NODE_ENV === 'development') {
      console.log('[EMAIL] Retornando true en modo desarrollo')
      return true
    }
    return false
  }
}

export function generateVerificationEmailHTML(code: string, type: 'email_verification' | 'password_reset'): string {
  const isPasswordReset = type === 'password_reset'
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isPasswordReset ? 'Recuperar Contraseña' : 'Verificar Email'}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #6b46c1;
          margin-bottom: 10px;
        }
        .code-container {
          background-color: #f3f4f6;
          border: 2px dashed #6b46c1;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .verification-code {
          font-size: 32px;
          font-weight: bold;
          color: #6b46c1;
          letter-spacing: 4px;
          margin: 10px 0;
        }
        .warning {
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 12px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🐾 Adopción Mascotas</div>
        <h1>${isPasswordReset ? 'Recuperar Contraseña' : 'Verificación de Email'}</h1>
      </div>
      
      <p>Hola,</p>
      
      <p>
        ${isPasswordReset 
          ? 'Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para continuar:' 
          : 'Gracias por registrarte. Para completar tu registro, verifica tu email con el siguiente código:'
        }
      </p>
      
      <div class="code-container">
        <p><strong>Tu código de verificación es:</strong></p>
        <div class="verification-code">${code}</div>
        <p><small>Este código expira en 15 minutos</small></p>
      </div>
      
      ${isPasswordReset ? `
        <div class="warning">
          <p><strong>⚠️ Importante:</strong></p>
          <ul>
            <li>Si no solicitaste este cambio, ignora este email</li>
            <li>Nunca compartas este código con nadie</li>
            <li>El código expira en 15 minutos</li>
          </ul>
        </div>
      ` : `
        <p>Si no te registraste en nuestra plataforma, puedes ignorar este email.</p>
      `}
      
      <div class="footer">
        <p>Este es un email automático, por favor no respondas.</p>
        <p>© 2024 Adopción Mascotas - Conectando corazones con patitas</p>
      </div>
    </body>
    </html>
  `
}

export async function sendVerificationEmail(
  email: string, 
  code: string, 
  type: 'email_verification' | 'password_reset' = 'email_verification'
): Promise<boolean> {
  const isPasswordReset = type === 'password_reset'
  
  const subject = isPasswordReset 
    ? '🔑 Código para recuperar tu contraseña'
    : '📧 Verifica tu email - Adopción Mascotas'
  
  const html = generateVerificationEmailHTML(code, type)
  
  return await sendEmail({
    to: email,
    subject,
    html
  })
}

export function generateVerificationCode(): string {
  // Generate 6-digit verification code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function getCodeExpirationTime(): string {
  // Code expires in 15 minutes
  const expirationTime = new Date()
  expirationTime.setMinutes(expirationTime.getMinutes() + 15)
  return expirationTime.toISOString()
}