import { NextRequest, NextResponse } from 'next/server'

// Crear preferencia de pago para Yape según la documentación oficial de MercadoPago
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, amount, donorName, donorEmail, frequency, message } = await request.json()
    
    if (!phoneNumber || !amount || !donorName || !donorEmail) {
      return NextResponse.json(
        { error: 'Phone number, amount, donor name and email are required' },
        { status: 400 }
      )
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing MercadoPago access token' },
        { status: 500 }
      )
    }
    
    console.log('[YAPE] Creando preferencia de pago')
    console.log('[YAPE] Datos:', { 
      phoneNumber: phoneNumber.substring(0, 3) + 'XXXX', 
      amount,
      donorName
    })

    // Generar requestId único para la API
    const requestId = `yape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('[YAPE] Creando preferencia en MercadoPago...')
    
    // Crear preferencia de pago para Yape
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        items: [{
          title: `Donación para adopción de mascotas`,
          description: message || 'Donación para ayudar a las mascotas',
          quantity: 1,
          unit_price: amount,
          currency_id: 'PEN'
        }],
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [
            { id: 'credit_card' },
            { id: 'debit_card' },
            { id: 'ticket' },
            { id: 'bank_transfer' },
            { id: 'atm' }
          ],
          installments: 1
        },
        payer: {
          name: donorName.split(' ')[0] || donorName,
          surname: donorName.split(' ').slice(1).join(' ') || '',
          email: donorEmail,
          phone: {
            area_code: '51',
            number: phoneNumber.toString()
          }
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donaciones/exito`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donaciones`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donaciones`
        },
        external_reference: requestId,
        metadata: {
          donor_name: donorName,
          donor_email: donorEmail,
          frequency,
          message: message || '',
          payment_method: 'yape'
        }
      })
    })
    
    console.log('[YAPE] Respuesta de preferencia:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[YAPE] Error creando preferencia:', response.status, errorData)
      
      return NextResponse.json({
        error: 'Error creando preferencia de pago',
        details: errorData,
        status: response.status
      }, { status: response.status })
    }
    
    const preferenceData = await response.json()
    console.log('[YAPE] ✅ Preferencia creada:', preferenceData.id)
    
    // Retornar la URL de pago y datos de la preferencia
    return NextResponse.json({
      success: true,
      preference_id: preferenceData.id,
      init_point: preferenceData.init_point,
      sandbox_init_point: preferenceData.sandbox_init_point,
      external_reference: requestId,
      message: 'Redirige al usuario a init_point para completar el pago con Yape',
      paymentFlow: 'redirect'
    })
    
  } catch (error: any) {
    console.error('[YAPE] ❌ Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}