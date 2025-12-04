import { NextRequest, NextResponse } from 'next/server'
import { getCulqiSecretKey } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const { token, amount, donor_name, donor_email, frequency, message } = await request.json()
    
    if (!token || !amount || !donor_name || !donor_email) {
      return NextResponse.json(
        { error: 'Token, amount, donor_name and donor_email are required' },
        { status: 400 }
      )
    }
    
    // Validar monto mínimo (Culqi requiere mínimo S/ 1.00 = 100 centavos)
    if (amount < 1) {
      return NextResponse.json(
        { error: 'El monto mínimo es S/ 1.00' },
        { status: 400 }
      )
    }
    
    // Validar monto máximo
    if (amount > 10000) {
      return NextResponse.json(
        { error: 'El monto máximo es S/ 10,000.00' },
        { status: 400 }
      )
    }

    const secretKey = getCulqiSecretKey()
    
    if (!secretKey) {
      console.error('[CULQI CHARGE] Clave secreta no disponible')
      return NextResponse.json(
        { error: 'Configuración de Culqi no disponible' },
        { status: 500 }
      )
    }
    
    console.log('[CULQI CHARGE] Usando clave secreta:', secretKey.substring(0, 15) + '...')

    console.log('[CULQI CHARGE] Procesando pago:', { amount, donor_name, donor_email })

    // Crear cargo usando la API de Culqi
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
        source_id: token,
        metadata: {
          donor_name,
          donor_email,
          frequency,
          message: message || ''
        }
      })
    })

    const chargeData = await response.json()
    
    if (!response.ok) {
      console.error('[CULQI CHARGE] Error:', chargeData)
      let errorMessage = 'Error procesando pago con Culqi'
      
      // Manejar diferentes tipos de errores de Culqi
      if (chargeData.merchant_message) {
        errorMessage = chargeData.merchant_message
      } else if (chargeData.user_message) {
        errorMessage = chargeData.user_message
      } else if (chargeData.message) {
        errorMessage = chargeData.message
      } else if (chargeData.type === 'param_error') {
        errorMessage = 'Error en los datos enviados. Verifica la información e intenta nuevamente.'
      } else if (chargeData.type === 'card_error') {
        errorMessage = 'Error con la tarjeta. Verifica los datos o intenta con otra tarjeta.'
      }
      
      return NextResponse.json({
        error: errorMessage,
        details: chargeData,
        culqi_error: true,
        error_type: chargeData.type || 'unknown'
      }, { status: response.status })
    }

    console.log('[CULQI CHARGE] ✅ Pago procesado:', chargeData.id)
    console.log('[CULQI CHARGE] Outcome:', chargeData.outcome)
    console.log('[CULQI CHARGE] Estado completo:', JSON.stringify(chargeData, null, 2))

    // Determinar el estado del pago - Culqi puede devolver diferentes respuestas
    let paymentSuccess = false
    let paymentStatus = 'pending'
    let paymentMessage = 'Pago procesado'
    
    // Verificar el objeto de respuesta de Culqi
    if (chargeData.object === 'charge') {
      if (chargeData.outcome) {
        // Con outcome explícito
        paymentSuccess = chargeData.outcome.type === 'venta_exitosa'
        paymentStatus = chargeData.outcome.type === 'venta_exitosa' ? 'approved' : 'pending'
        paymentMessage = chargeData.outcome.merchant_message || chargeData.outcome.user_message || 'Procesado'
        console.log('[CULQI CHARGE] Con outcome - Success:', paymentSuccess, 'Status:', paymentStatus)
      } else {
        // Sin outcome pero charge válido - asumir éxito en pruebas
        paymentSuccess = true
        paymentStatus = 'approved'
        paymentMessage = 'Pago procesado exitosamente'
        console.log('[CULQI CHARGE] Sin outcome pero charge válido - Asumiendo éxito')
      }
    } else {
      // Respuesta inesperada
      console.warn('[CULQI CHARGE] Respuesta inesperada de Culqi:', chargeData.object)
      paymentSuccess = false
      paymentStatus = 'failed'
      paymentMessage = 'Respuesta inesperada de Culqi'
    }

    // Guardar donación en base de datos
    try {
      const donationPayload = {
        amount,
        donor_name,
        donor_email,
        payment_method: 'culqi',
        frequency,
        message: message || '',
        status: paymentStatus === 'approved' ? 'approved' : 'pending',
        culqi_charge_id: chargeData.id,
        culqi_token_id: token
      }
      
      console.log('[CULQI CHARGE] Guardando donación con payload:', donationPayload)
      
      const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationPayload)
      })
      
      if (saveResponse.ok) {
        const saveResult = await saveResponse.json()
        console.log('[CULQI CHARGE] ✅ Donación guardada en BD:', saveResult.donation?.id)
      } else {
        const errorText = await saveResponse.text()
        console.warn('[CULQI CHARGE] ⚠️ Error guardando en BD:', errorText)
      }
    } catch (saveError) {
      console.error('[CULQI CHARGE] ❌ Error guardando donación:', saveError)
    }

    return NextResponse.json({
      success: paymentSuccess,
      charge_id: chargeData.id,
      status: paymentStatus,
      approved: paymentSuccess,
      message: paymentSuccess ? '¡Pago procesado exitosamente!' : paymentMessage,
      chargeData: chargeData,
      donationId: chargeData.id, // Para compatibilidad
      debug: {
        outcome: chargeData.outcome,
        object: chargeData.object,
        creation_date: chargeData.creation_date
      }
    })

  } catch (error: any) {
    console.error('[CULQI CHARGE] ❌ Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}