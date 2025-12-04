import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🧪 [YAPE DEBUG] Datos de pago recibidos:', body)

    const { phoneNumber, otp, amount = 10.50 } = body

    if (!phoneNumber || !otp) {
      return NextResponse.json({ 
        error: 'Teléfono y OTP requeridos',
        received: { phoneNumber, otp }
      }, { status: 400 })
    }

    // Verificar credenciales
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
    
    console.log('🔑 Credenciales:', {
      hasAccessToken: !!accessToken,
      hasPublicKey: !!publicKey,
      publicKey: publicKey?.substring(0, 20) + '...',
      accessToken: accessToken?.substring(0, 20) + '...'
    })

    if (!accessToken || !publicKey) {
      return NextResponse.json({ 
        error: 'Credenciales de MercadoPago no encontradas',
        env: {
          hasAccessToken: !!accessToken,
          hasPublicKey: !!publicKey
        }
      }, { status: 500 })
    }

    // Para Yape, primero creamos una preferencia de pago
    const requestId = `debug_${Date.now()}`
    
    console.log('🚀 Creando preferencia de pago para Yape...')
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        items: [{
          title: 'Test Yape Payment',
          quantity: 1,
          unit_price: amount,
          currency_id: 'PEN'
        }],
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [
            { id: 'credit_card' },
            { id: 'debit_card' },
            { id: 'ticket' }
          ],
          installments: 1
        },
        payer: {
          name: 'Test',
          surname: 'User',
          email: 'test@example.com',
          phone: {
            area_code: '51',
            number: phoneNumber.toString()
          },
          identification: {
            type: 'DNI',
            number: '12345678'
          }
        },
        back_urls: {
          success: 'http://localhost:3000/donaciones/exito',
          failure: 'http://localhost:3000/donaciones',
          pending: 'http://localhost:3000/donaciones'
        },
        external_reference: requestId,
        metadata: {
          phone_number: phoneNumber,
          otp: otp
        }
      })
    })

    const responseText = await response.text()
    let responseData = {}
    
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { raw: responseText }
    }

    console.log('📄 Respuesta de MercadoPago:', {
      status: response.status,
      ok: response.ok,
      data: responseData
    })

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      mercadopagoResponse: responseData,
      requestData: {
        phoneNumber: phoneNumber.substring(0, 3) + 'XXXX',
        otp: otp.substring(0, 2) + 'XXXX',
        amount
      },
      credentials: {
        publicKey: publicKey?.substring(0, 20) + '...',
        accessToken: accessToken?.substring(0, 20) + '...'
      }
    })

  } catch (error) {
    console.error('❌ Error en debug:', error)
    return NextResponse.json({
      error: 'Error en debug',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}