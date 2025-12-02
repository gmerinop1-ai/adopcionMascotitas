import { NextRequest, NextResponse } from 'next/server'
import { createCulqiCharge } from '@/lib/culqi'
import { updateDonationStatus } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, donation_id, amount, description, customer_email } = body
    
    console.log('[CULQI VERIFY] === INICIO verify-session ===')
    console.log('[CULQI VERIFY] Body recibido:', JSON.stringify(body, null, 2))
    console.log('[CULQI VERIFY] Procesando pago:', { 
      token: token ? `${token.substring(0, 10)}...` : 'MISSING', 
      donation_id, 
      amount,
      customer_email 
    })
    
    // Validación mejorada
    if (!token) {
      console.error('[CULQI VERIFY] ❌ Token faltante')
      return NextResponse.json(
        { error: 'Token de pago es requerido' },
        { status: 400 }
      )
    }
    
    if (!donation_id) {
      console.error('[CULQI VERIFY] ❌ donation_id faltante')
      return NextResponse.json(
        { error: 'ID de donación es requerido' },
        { status: 400 }
      )
    }
    
    if (!amount || amount <= 0) {
      console.error('[CULQI VERIFY] ❌ Monto inválido:', amount)
      return NextResponse.json(
        { error: 'Monto de donación inválido' },
        { status: 400 }
      )
    }
    
    console.log('[CULQI VERIFY] ✅ Validaciones pasadas, creando cargo...')
    
    // Verificar si es un token de prueba
    const isTestToken = token.startsWith('tkn_test_') || process.env.NODE_ENV === 'development'
    
    if (isTestToken) {
      console.log('[CULQI VERIFY] ⚠️  Token de prueba detectado, simulando respuesta exitosa')
      
      // Simular un cargo exitoso para pruebas
      const simulatedCharge = {
        id: 'chr_test_' + Date.now(),
        amount: Math.round(amount * 100),
        currency_code: 'PEN',
        outcome: {
          type: 'successful',
          merchant_message: 'Simulación exitosa'
        },
        created: Date.now(),
        metadata: {
          donation_id,
          platform: 'adopcion_mascotitas'
        }
      }
      
      try {
        await updateDonationStatus(donation_id, 'completed', {
          culqi_charge_id: simulatedCharge.id,
          culqi_data: simulatedCharge,
          test_mode: true
        })
        console.log('[CULQI VERIFY] ✅ Donación actualizada como completada (modo prueba)')
        
        return NextResponse.json({
          success: true,
          status: 'completed',
          charge_id: simulatedCharge.id,
          amount: amount,
          donation_id,
          test_mode: true
        })
      } catch (dbError: any) {
        console.error('[CULQI VERIFY] ❌ Error al actualizar donación en modo prueba:', dbError)
        return NextResponse.json(
          { 
            error: 'Error al actualizar donación en modo prueba',
            details: dbError.message
          },
          { status: 500 }
        )
      }
    }
    
    // Crear el cargo real en Culqi
    const chargeData = {
      amount: Math.round(amount * 100), // Convertir soles a centavos
      currency_code: 'PEN',
      description: description || 'Donación para mascotas',
      source_id: token,
      customer_email: customer_email || '',
      metadata: {
        donation_id,
        platform: 'adopcion_mascotitas'
      }
    }
    
    console.log('[CULQI VERIFY] Datos del cargo:', chargeData)
    
    let charge
    try {
      charge = await createCulqiCharge(chargeData)
      console.log('[CULQI VERIFY] ✅ Cargo creado exitosamente:', charge)
    } catch (culqiError) {
      console.error('[CULQI VERIFY] ❌ Error al crear cargo en Culqi:', culqiError)
      console.error('[CULQI VERIFY] ❌ Error message:', culqiError.message)
      
      // Marcar donación como fallida
      try {
        await updateDonationStatus(donation_id, 'failed', {
          error: 'Error al crear cargo en Culqi: ' + culqiError.message,
          culqi_error: culqiError,
          timestamp: new Date().toISOString()
        })
      } catch (dbError) {
        console.error('[CULQI VERIFY] Error al actualizar donación tras fallo de Culqi:', dbError)
      }
      
      return NextResponse.json(
        { 
          error: 'Error al procesar el pago con Culqi: ' + culqiError.message,
          details: culqiError.message
        },
        { status: 500 }
      )
    }
    
    // Verificar el estado del cargo
    if (charge && charge.outcome && charge.outcome.type === 'successful') {
      console.log('[CULQI VERIFY] ✅ Pago exitoso, actualizando donación...')
      
      // Actualizar el estado de la donación
      try {
        await updateDonationStatus(donation_id, 'completed', {
          culqi_charge_id: charge.id,
          culqi_data: charge
        })
        console.log('[CULQI VERIFY] ✅ Donación actualizada como completada')
      } catch (dbError) {
        console.error('[CULQI VERIFY] ❌ Error al actualizar donación como completada:', dbError)
        // El pago fue exitoso pero no pudimos actualizar la BD
        return NextResponse.json(
          { 
            error: 'Pago procesado pero error al actualizar base de datos',
            charge_id: charge.id,
            details: dbError.message
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        status: 'completed',
        charge_id: charge.id,
        amount: charge.amount / 100,
        donation_id
      })
    } else {
      console.log('[CULQI VERIFY] ❌ Pago falló:', charge?.outcome)
      
      // Pago falló
      await updateDonationStatus(donation_id, 'failed', {
        culqi_charge_id: charge?.id,
        culqi_data: charge,
        failure_reason: charge?.outcome?.merchant_message || 'Pago rechazado'
      })
      
      return NextResponse.json(
        { 
          error: charge?.outcome?.merchant_message || 'El pago fue rechazado',
          charge_id: charge?.id
        },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('[CULQI VERIFY] ❌ Error completo:', error)
    console.error('[CULQI VERIFY] ❌ Error message:', error.message)
    console.error('[CULQI VERIFY] ❌ Stack trace:', error.stack)
    
    // Intentar obtener el body para el donation_id
    let donation_id_for_update = null
    try {
      const body = await request.clone().json()
      donation_id_for_update = body.donation_id
    } catch (parseError) {
      console.error('[CULQI VERIFY] No se pudo parsear el body para obtener donation_id')
    }
    
    // Intentar actualizar la donación como fallida si tenemos el ID
    if (donation_id_for_update) {
      try {
        await updateDonationStatus(donation_id_for_update, 'failed', {
          error: error.message || 'Error desconocido',
          timestamp: new Date().toISOString()
        })
        console.log('[CULQI VERIFY] Donación marcada como fallida')
      } catch (dbError) {
        console.error('[CULQI VERIFY] Error updating donation status:', dbError)
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Error al procesar el pago. Inténtalo de nuevo.',
        details: error.message // Para desarrollo
      },
      { status: 500 }
    )
  }
}