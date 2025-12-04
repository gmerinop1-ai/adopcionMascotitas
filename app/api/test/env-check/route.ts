import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verificar variables desde el lado del servidor
    const serverEnvs = {
      NEXT_PUBLIC_CULQI_PUBLIC_KEY: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY,
      CULQI_SECRET_KEY: process.env.CULQI_SECRET_KEY ? 'CONFIGURADA' : 'NO CONFIGURADA',
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NODE_ENV: process.env.NODE_ENV
    }
    
    console.log('[ENV CHECK] Variables del servidor:', serverEnvs)
    
    return NextResponse.json({
      message: 'Variables de entorno desde el servidor',
      server: serverEnvs,
      allCulqiKeys: Object.keys(process.env).filter(key => key.includes('CULQI'))
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Error verificando variables de entorno',
      details: error.message
    }, { status: 500 })
  }
}