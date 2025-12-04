import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const secretKey = process.env.CULQI_SECRET_KEY
    const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
    
    if (!secretKey || !publicKey) {
      return NextResponse.json({
        error: 'Credenciales de Culqi no configuradas',
        details: {
          secretKey: secretKey ? 'Configurada' : 'No configurada',
          publicKey: publicKey ? 'Configurada' : 'No configurada'
        }
      }, { status: 500 })
    }

    // Probar conectividad con la API de Culqi
    try {
      const response = await fetch('https://api.culqi.com/v2/tokens', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          card_number: '4111111111111111',
          cvv: '123',
          expiration_month: '09',
          expiration_year: '2025',
          email: 'test@example.com'
        })
      })

      const result = await response.json()
      
      return NextResponse.json({
        culqi: {
          configured: true,
          publicKey: publicKey.substring(0, 15) + '...',
          secretKey: secretKey.substring(0, 15) + '...',
          apiConnection: response.ok ? 'Conectado' : 'Error de conexión',
          apiResponse: result
        },
        message: 'Prueba de conexión con Culqi completada',
        status: response.status
      })
      
    } catch (apiError: any) {
      return NextResponse.json({
        culqi: {
          configured: true,
          publicKey: publicKey.substring(0, 15) + '...',
          secretKey: secretKey.substring(0, 15) + '...',
          apiConnection: 'Error de red',
          error: apiError.message
        },
        message: 'Error probando conexión con API de Culqi'
      }, { status: 500 })
    }
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Error verificando configuración de Culqi',
      details: error.message
    }, { status: 500 })
  }
}