const nodemailer = require("nodemailer")

// Script de prueba para verificar la configuración de correo
async function testEmailConfig() {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "mvalenciag2@upao.edu.pe",
      pass: "jlzh qtku tkbe dlxq",
    },
    tls: {
      rejectUnauthorized: false
    }
  })

  try {
    // Verificar la conexión
    await transporter.verify()
    console.log("✅ Servidor SMTP configurado correctamente")

    // Enviar correo de prueba
    const info = await transporter.sendMail({
      from: "mvalenciag2@upao.edu.pe",
      to: "mvalenciag2@upao.edu.pe", // Enviar a ti mismo
      subject: "Prueba de configuración SMTP",
      html: `
        <h1>¡Configuración exitosa!</h1>
        <p>Si recibes este correo, tu configuración SMTP está funcionando correctamente.</p>
        <p>Fecha: ${new Date().toLocaleString()}</p>
      `,
    })

    console.log("✅ Correo de prueba enviado:", info.messageId)
  } catch (error) {
    console.error("❌ Error en la configuración:", error)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testEmailConfig()
}

module.exports = { testEmailConfig }