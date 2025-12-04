import { NextRequest, NextResponse } from 'next/server'
import { getCulqiSecretKey } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const { cardNumber, cvv, expirationMonth, expirationYear, email } = await request.json()
    
    if (!cardNumber || !cvv || !expirationMonth || !expirationYear || !email) {
      return NextResponse.json(
        { error: 'Todos los campos de tarjeta son requeridos' },
        { status: 400 }
      )
    }

    const secretKey = getCulqiSecretKey()
    
    if (!secretKey) {
      console.error('[CULQI TOKEN] Clave secreta no disponible')
      return NextResponse.json(
        { error: 'Configuración de Culqi no disponible' },
        { status: 500 }
      )
    }
    
    console.log('[CULQI TOKEN] Usando clave secreta:', secretKey.substring(0, 15) + '...')

    console.log('[CULQI TOKEN] Creando token para:', email)

    // Crear token usando la API de Culqi
    const response = await fetch('https://api.culqi.com/v2/tokens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        card_number: cardNumber.replace(/\s/g, ''),
        cvv: cvv,
        expiration_month: expirationMonth,
        expiration_year: expirationYear,
        email: email
      })
    })

    const tokenData = await response.json()
    
    if (!response.ok) {
      console.error('[CULQI TOKEN] Error:', tokenData)
      let errorMessage = 'Error creando token de pago'
      
      if (tokenData.merchant_message) {
        errorMessage = tokenData.merchant_message
      } else if (tokenData.user_message) {
        errorMessage = tokenData.user_message
      } else if (tokenData.message) {
        errorMessage = tokenData.message
      }
      
      return NextResponse.json({
        error: errorMessage,
        details: tokenData,
        culqi_error: true
      }, { status: response.status })
    }

    console.log('[CULQI TOKEN] ✅ Token creado:', tokenData.id)

    return NextResponse.json({
      success: true,
      token: tokenData.id,
      tokenData
    })

  } catch (error: any) {
    console.error('[CULQI TOKEN] ❌ Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}