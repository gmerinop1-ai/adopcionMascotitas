import { NextResponse } from "next/server"

export async function GET() {
  // Solo mostrar si las variables existen (no sus valores por seguridad)
  const config = {
    EMAIL_SERVER_HOST: !!process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: !!process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER: !!process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: !!process.env.EMAIL_SERVER_PASSWORD,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  }

  return NextResponse.json(config)
}