import { NextRequest, NextResponse } from 'next/server'
import { getMercadoPagoInstance, getMercadoPagoPublicKey } from '@/lib/mercadopago'

export async function GET(request: NextRequest) {
  try {
    console.log('[DIAGNOSTICO] === INICIO diagnóstico de MercadoPago ===')
    
    // Verificar variables de entorno
    const accessToken = 'APP_USR-2581186311571159-120402-140076f8d240816da2bb4412b31f7d4a-3039852664'
    const publicKey = 'APP_USR-e1376b0b-a75a-451f-b4ba-520d719ee956'
    
    console.log('[DIAGNOSTICO] ACCESS_TOKEN presente:', !!accessToken)
    console.log('[DIAGNOSTICO] PUBLIC_KEY presente:', !!publicKey)
    console.log('[DIAGNOSTICO] ACCESS_TOKEN tipo:', accessToken?.includes('TEST') ? 'PRUEBA' : 'PRODUCCIÓN')
    console.log('[DIAGNOSTICO] PUBLIC_KEY tipo:', publicKey?.includes('TEST') ? 'PRUEBA' : 'PRODUCCIÓN')
    
    // Verificar instancia de MercadoPago
    try {
      const mpInstance = getMercadoPagoInstance()
      console.log('[DIAGNOSTICO] ✅ Instancia MercadoPago creada exitosamente')
    } catch (mpError: any) {
      console.error('[DIAGNOSTICO] ❌ Error creando instancia MercadoPago:', mpError.message)
    }
    
    // Verificar clave pública
    try {
      const pubKey = getMercadoPagoPublicKey()
      console.log('[DIAGNOSTICO] ✅ Clave pública obtenida:', pubKey.substring(0, 30) + '...')
    } catch (pkError: any) {
      console.error('[DIAGNOSTICO] ❌ Error obteniendo clave pública:', pkError.message)
    }
    
    // Hacer una prueba de conectividad con la API de MercadoPago
    try {
      const response = await fetch('https://api.mercadopago.com/v1/payment_methods/search?public_key=' + publicKey, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        const methods = await response.json()
        const yapeAvailable = methods.some((method: any) => 
          method.id === 'yape' || method.payment_type_id === 'digital_wallet'
        )
        
        console.log('[DIAGNOSTICO] ✅ Conexión con MercadoPago API exitosa')
        console.log('[DIAGNOSTICO] Métodos de pago disponibles:', methods.length)
        console.log('[DIAGNOSTICO] Yape disponible:', yapeAvailable)
        
        return NextResponse.json({
          success: true,
          config: {
            accessTokenPresent: !!accessToken,
            publicKeyPresent: !!publicKey,
            environment: accessToken?.includes('TEST') ? 'test' : 'production',
          },
          api: {
            connected: true,
            paymentMethodsCount: methods.length,
            yapeAvailable
          },
          timestamp: new Date().toISOString()
        })
      } else {
        console.error('[DIAGNOSTICO] ❌ Error en API MercadoPago:', response.status, response.statusText)
        return NextResponse.json({
          success: false,
          error: `API Error: ${response.status} ${response.statusText}`,
          config: {
            accessTokenPresent: !!accessToken,
            publicKeyPresent: !!publicKey,
            environment: accessToken?.includes('TEST') ? 'test' : 'production',
          }
        })
      }
    } catch (apiError: any) {
      console.error('[DIAGNOSTICO] ❌ Error conectando con API MercadoPago:', apiError.message)
      return NextResponse.json({
        success: false,
        error: `Connection Error: ${apiError.message}`,
        config: {
          accessTokenPresent: !!accessToken,
          publicKeyPresent: !!publicKey,
          environment: accessToken?.includes('TEST') ? 'test' : 'production',
        }
      })
    }
    
  } catch (error: any) {
    console.error('[DIAGNOSTICO] ❌ Error general:', error)
    return NextResponse.json(
      { error: 'Error en diagnóstico', details: error.message },
      { status: 500 }
    )
  }
}