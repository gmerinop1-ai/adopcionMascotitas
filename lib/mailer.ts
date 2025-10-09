// lib/mailer.ts

import nodemailer from 'nodemailer';

const emailConfig = {
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),

  secure: process.env.EMAIL_SERVER_PORT === '465', 
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

/**
 * Función para enviar correos electrónicos de forma asíncrona.
 */
export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@adopcionmascotas.com',
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    // En Render, el console.log no se ve, pero la función no lanzará error.
    return true; 
  } catch (error) {
    // Si hay un error, Next.js necesita que retornemos false o lancemos un error.
    console.error('Error al enviar el correo:', error);
    return false;
  }
}