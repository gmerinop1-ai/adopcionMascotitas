import { NextResponse } from 'next/server'
import { getCulqiSecretKey, CULQI_CONFIG } from '@/lib/config'

export async function POST() {
  try {
    const secretKey = getCulqiSecretKey()
    
    if (!secretKey) {
      return NextResponse.json({
        error: 'Configuración de Culqi no disponible'
      }, { status: 500 })
    }

    console.log('[TEST CULQI] Probando pago con datos de prueba...')

    // Paso 1: Crear token de prueba
    const tokenResponse = await fetch('https://api.culqi.com/v2/tokens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        card_number: CULQI_CONFIG.TEST_CARDS.VISA_SUCCESS.number,
        cvv: CULQI_CONFIG.TEST_CARDS.VISA_SUCCESS.cvv,
        expiration_month: CULQI_CONFIG.TEST_CARDS.VISA_SUCCESS.month,
        expiration_year: CULQI_CONFIG.TEST_CARDS.VISA_SUCCESS.year,
        email: CULQI_CONFIG.TEST_CARDS.VISA_SUCCESS.email
      })
    })

    const tokenData = await tokenResponse.json()
    console.log('[TEST CULQI] Token response:', tokenData)
    
    if (!tokenResponse.ok) {
      return NextResponse.json({
        error: 'Error creando token de prueba',
        details: tokenData
      }, { status: tokenResponse.status })
    }

    // Paso 2: Crear cargo de prueba
    const chargeResponse = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 1000, // S/ 10.00
        currency_code: 'PEN',
        description: 'Prueba de pago - Adopción Mascotas',
        email: 'test@example.com',
        source_id: tokenData.id,
        metadata: {
          test: true,
          donor_name: 'Usuario de Prueba'
        }
      })
    })

    const chargeData = await chargeResponse.json()
    console.log('[TEST CULQI] Charge response:', chargeData)
    
    if (!chargeResponse.ok) {
      return NextResponse.json({
        error: 'Error creando cargo de prueba',
        tokenData,
        chargeError: chargeData
      }, { status: chargeResponse.status })
    }

    return NextResponse.json({
      success: true,
      message: 'Prueba de Culqi exitosa',
      token: {
        id: tokenData.id,
        object: tokenData.object
      },
      charge: {
        id: chargeData.id,
        object: chargeData.object,
        amount: chargeData.amount,
        outcome: chargeData.outcome,
        creation_date: chargeData.creation_date
      },
      fullResponse: {
        token: tokenData,
        charge: chargeData
      }
    })

  } catch (error: any) {
    console.error('[TEST CULQI] Error:', error)
    return NextResponse.json({
      error: 'Error en prueba de Culqi',
      details: error.message
    }, { status: 500 })
  }
}