import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, amount, donor_name, donor_email, frequency, message } = await request.json()
    
    if (!phoneNumber || !amount || !donor_name || !donor_email) {
      return NextResponse.json(
        { error: 'Phone number, amount, donor_name and donor_email are required' },
        { status: 400 }
      )
    }

    const secretKey = process.env.CULQI_SECRET_KEY
    
    if (!secretKey) {
      return NextResponse.json(
        { error: 'Credenciales de Culqi no configuradas' },
        { status: 500 }
      )
    }

    console.log('[CULQI YAPE] Procesando pago:', { amount, donor_name, phoneNumber: phoneNumber.substring(0, 3) + 'XXXX' })

    // Crear cargo usando Yape con Culqi
    const response = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Culqi requiere centavos
        currency_code: 'PEN',
        description: `Donación para adopción de mascotas - ${donor_name}`,
        email: donor_email,
        source_id: phoneNumber, // Para Yape, el source_id es el número de teléfono
        payment_method: {
          type: 'yape'
        },
        metadata: {
          donor_name,
          donor_email,
          frequency,
          message: message || '',
          phone_number: phoneNumber
        }
      })
    })

    const chargeData = await response.json()
    
    if (!response.ok) {
      console.error('[CULQI YAPE] Error:', chargeData)
      return NextResponse.json({
        error: 'Error procesando pago con Yape',
        details: chargeData
      }, { status: response.status })
    }

    console.log('[CULQI YAPE] ✅ Respuesta:', chargeData)

    // Para Yape, el flujo puede requerir confirmación
    if (chargeData.outcome?.type === 'yape_pending') {
      return NextResponse.json({
        success: false,
        pending: true,
        charge_id: chargeData.id,
        status: 'pending',
        message: 'Completa el pago en tu app Yape',
        yape_url: chargeData.payment_method?.yape_url || null,
        chargeData
      })
    }

    // Guardar donación en base de datos si el pago fue exitoso
    try {
      const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          donor_name,
          donor_email,
          payment_method: 'culqi_yape',
          frequency,
          message: message || '',
          status: chargeData.outcome?.type === 'venta_exitosa' ? 'approved' : 'pending',
          culqi_charge_id: chargeData.id
        })
      })
      
      if (saveResponse.ok) {
        console.log('[CULQI YAPE] ✅ Donación guardada en BD')
      } else {
        console.warn('[CULQI YAPE] ⚠️ Error guardando en BD:', await saveResponse.text())
      }
    } catch (saveError) {
      console.error('[CULQI YAPE] ❌ Error guardando donación:', saveError)
    }

    return NextResponse.json({
      success: chargeData.outcome?.type === 'venta_exitosa',
      charge_id: chargeData.id,
      status: chargeData.outcome?.type || 'unknown',
      approved: chargeData.outcome?.type === 'venta_exitosa',
      message: chargeData.outcome?.type === 'venta_exitosa'
        ? '¡Pago procesado exitosamente con Yape!'
        : `Pago ${chargeData.outcome?.type}: ${chargeData.outcome?.merchant_message}`,
      chargeData
    })

  } catch (error: any) {
    console.error('[CULQI YAPE] ❌ Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}