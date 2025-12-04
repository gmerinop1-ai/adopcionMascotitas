import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[TEST MERCADOPAGO] === INICIO test-config ===')
    
    // Verificar variables de entorno
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    
    console.log('[TEST MERCADOPAGO] Variables de entorno:')
    console.log('- PUBLIC_KEY:', publicKey ? `${publicKey.substring(0, 15)}...` : 'MISSING')
    console.log('- ACCESS_TOKEN:', accessToken ? `${accessToken.substring(0, 15)}...` : 'MISSING')
    console.log('- BASE_URL:', baseUrl || 'MISSING')
    
    if (!publicKey || !accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Variables de entorno faltantes',
        details: {
          hasPublicKey: !!publicKey,
          hasAccessToken: !!accessToken,
          hasBaseUrl: !!baseUrl
        }
      })
    }

    // Intentar hacer un request simple a la API de MercadoPago para validar el token
    try {
      console.log('[TEST MERCADOPAGO] Probando conexión con MercadoPago...')
      
      const testResponse = await fetch('https://api.mercadopago.com/v1/account/settings', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('[TEST MERCADOPAGO] Respuesta de MercadoPago:', testResponse.status)
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text()
        console.error('[TEST MERCADOPAGO] Error en respuesta:', errorText)
        
        return NextResponse.json({
          success: false,
          error: `MercadoPago API error: ${testResponse.status}`,
          details: {
            status: testResponse.status,
            statusText: testResponse.statusText,
            response: errorText,
            possibleCauses: [
              'Access token inválido',
              'Access token expirado', 
              'Access token no corresponde a una aplicación de producción',
              'Problemas de conectividad'
            ]
          }
        })
      }
      
      const accountInfo = await testResponse.json()
      console.log('[TEST MERCADOPAGO] ✅ Conexión exitosa')
      
      // Intentar crear una preferencia de prueba (sin items, solo para validar)
      const preferenceTestData = {
        items: [
          {
            id: 'test-item',
            title: 'Test de configuración',
            quantity: 1,
            unit_price: 1,
            currency_id: 'PEN'
          }
        ],
        back_urls: {
          success: `${baseUrl || 'http://localhost:3000'}/test-success`,
          failure: `${baseUrl || 'http://localhost:3000'}/test-failure`,
          pending: `${baseUrl || 'http://localhost:3000'}/test-pending`
        },
        auto_return: 'approved'
      }
      
      const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferenceTestData)
      })
      
      if (!preferenceResponse.ok) {
        const errorText = await preferenceResponse.text()
        console.error('[TEST MERCADOPAGO] Error creando preferencia:', errorText)
        
        return NextResponse.json({
          success: false,
          error: `Error creando preferencia de prueba: ${preferenceResponse.status}`,
          details: {
            accountValid: true,
            preferenceError: errorText,
            status: preferenceResponse.status
          }
        })
      }
      
      const preferenceInfo = await preferenceResponse.json()
      console.log('[TEST MERCADOPAGO] ✅ Preferencia de prueba creada:', preferenceInfo.id)
      
      return NextResponse.json({
        success: true,
        details: {
          accountInfo: {
            id: accountInfo.id || 'N/A',
            email: accountInfo.email || 'N/A', 
            country: accountInfo.site_id || 'N/A'
          },
          preferenceTest: {
            id: preferenceInfo.id,
            status: 'created'
          },
          environment: accessToken.startsWith('APP_USR') ? 'production' : 'test',
          timestamp: new Date().toISOString()
        }
      })
      
    } catch (apiError: any) {
      console.error('[TEST MERCADOPAGO] Error de API:', apiError)
      
      return NextResponse.json({
        success: false,
        error: 'Error conectando con MercadoPago API',
        details: {
          message: apiError.message,
          possibleCauses: [
            'Problemas de conectividad',
            'Access token inválido',
            'Rate limiting',
            'Firewall/proxy bloqueando requests'
          ]
        }
      })
    }
    
  } catch (error: any) {
    console.error('[TEST MERCADOPAGO] ❌ Error general:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: {
        message: error.message,
        stack: error.stack
      }
    })
  }
}