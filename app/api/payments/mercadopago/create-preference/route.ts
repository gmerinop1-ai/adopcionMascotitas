import { NextRequest, NextResponse } from 'next/server'
import { createPreference } from '@/lib/mercadopago'
import { insertDonation } from '@/lib/db'
import { MERCADOPAGO_CONFIG } from '@/lib/donation-config'

export async function POST(request: NextRequest) {
  try {
    console.log('[MERCADOPAGO API] === INICIO create-preference ===')
    
    const { amount, frequency, donor_name, donor_email, message } = await request.json()
    
    console.log('[MERCADOPAGO API] Datos recibidos:', { amount, frequency, donor_name, donor_email })
    
    // Validaciones mejoradas
    if (!amount || amount < MERCADOPAGO_CONFIG.MIN_AMOUNT) {
      console.error('[MERCADOPAGO API] Monto inválido:', amount)
      return NextResponse.json(
        { error: `El monto mínimo es S/ ${MERCADOPAGO_CONFIG.MIN_AMOUNT}` },
        { status: 400 }
      )
    }
    
    if (amount > MERCADOPAGO_CONFIG.MAX_AMOUNT) {
      console.error('[MERCADOPAGO API] Monto excede el límite:', amount)
      return NextResponse.json(
        { error: `El monto máximo es S/ ${MERCADOPAGO_CONFIG.MAX_AMOUNT}` },
        { status: 400 }
      )
    }
    
    // Usar claves de producción directamente
    console.log('[MERCADOPAGO API] === USANDO CREDENCIALES DE PRODUCCIÓN DIRECTAS ===')
    
    const publicKey = 'APP_USR-e1376b0b-a75a-451f-b4ba-520d719ee956'
    const accessToken = 'APP_USR-2581186311571159-120402-140076f8d240816da2bb4412b31f7d4a-3039852664'
    
    console.log('[MERCADOPAGO API] PUBLIC_KEY:', publicKey.substring(0, 30) + '...')
    console.log('[MERCADOPAGO API] ACCESS_TOKEN:', accessToken.substring(0, 30) + '...')
    console.log('[MERCADOPAGO API] Tipo de ACCESS_TOKEN: PRODUCCIÓN')
    
    if (!publicKey) {
      console.error('[MERCADOPAGO API] ❌ NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY no configurada')
      return NextResponse.json(
        { error: 'Configuración de MercadoPago incompleta - clave pública faltante' },
        { status: 500 }
      )
    }
    
    if (!accessToken) {
      console.error('[MERCADOPAGO API] ❌ MERCADOPAGO_ACCESS_TOKEN no configurada')  
      return NextResponse.json(
        { error: 'Configuración de MercadoPago incompleta - token de acceso faltante' },
        { status: 500 }
      )
    }
    
    console.log('[MERCADOPAGO API] ✅ Claves de producción configuradas correctamente')
    
    // Crear donación en base de datos primero
    console.log('[MERCADOPAGO API] Insertando donación en BD...')
    const donation = await insertDonation({
      donor_name,
      donor_email,
      amount,
      frequency,
      payment_method: 'mercadopago',
      status: 'pending',
      message
    })

    console.log('[MERCADOPAGO API] ✅ Donación creada:', donation.id)
    
    // Crear preferencia de MercadoPago
    const description = frequency === 'monthly' 
      ? 'Donación Mensual - Adopción Mascotitas' 
      : 'Donación - Adopción Mascotitas'
    
    console.log('[MERCADOPAGO API] Creando preferencia con SDK...')
    
    const preference = await createPreference({
      amount: amount,
      description,
      donor_email,
      donor_name,
      donation_id: donation.id,
      external_reference: donation.id
    })
    
    console.log('[MERCADOPAGO API] ✅ Preferencia creada:', preference.id)
    
    return NextResponse.json({ 
      success: true,
      donationId: donation.id,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      publicKey: publicKey
    })
    
  } catch (error: any) {
    console.error('[MERCADOPAGO API] ❌ Error completo:', error)
    console.error('[MERCADOPAGO API] ❌ Error message:', error.message)
    console.error('[MERCADOPAGO API] ❌ Stack trace:', error.stack)
    
    // Determinar tipo específico de error
    let errorMessage = 'Error al preparar el pago'
    
    if (error.message?.includes('invalid access token') || error.message?.includes('unauthorized')) {
      errorMessage = 'Error de autorización de MercadoPago: Access token inválido o expirado'
    } else if (error.message?.includes('relation') || error.message?.includes('donacion')) {
      errorMessage = 'Error de base de datos: tabla donacion no encontrada'
    } else if (error.message?.includes('MERCADOPAGO') || error.message?.includes('mercadopago')) {
      errorMessage = 'Error de configuración de MercadoPago'
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Error de conexión con MercadoPago'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message, // Detalles completos para debugging
        suggestion: error.message?.includes('invalid access token') ? 
          'Verifica que tus claves de MercadoPago sean de la misma aplicación y estén activas' : 
          'Revisa la configuración en .env.local y reinicia el servidor'
      },
      { status: 500 }
    )
  }
}